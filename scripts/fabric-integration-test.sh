#!/usr/bin/env bash
# Integration test against the official Fabric 2.5 test-network (2 orgs, CouchDB, 1 Raft orderer).
set -euo pipefail

: "${FABRIC_SAMPLES:?Set FABRIC_SAMPLES to a fabric-samples directory with installed binaries}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETWORK="${FABRIC_SAMPLES}/test-network"
export PATH="${FABRIC_SAMPLES}/bin:${PATH}"
export FABRIC_CFG_PATH="${FABRIC_SAMPLES}/config"
cd "${NETWORK}"

# These functions are part of the official fabric-samples test network.
export OVERRIDE_ORG="${OVERRIDE_ORG:-}"
# fabric-samples helpers refer to optional vars (VERBOSE, etc.) without defaults.
set +u
source scripts/envVar.sh
setGlobals 1
set -u
export CORE_PEER_TLS_ENABLED=true

ORDERER_CA="${NETWORK}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
ORG1_TLS="${NETWORK}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
ORG2_TLS="${NETWORK}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
CC="healthchain"
CHANNEL="healthchannel"
TX_ARGS=(
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com
  --tls --cafile "${ORDERER_CA}"
  -C "${CHANNEL}" -n "${CC}"
  --peerAddresses localhost:7051 --tlsRootCertFiles "${ORG1_TLS}"
  --peerAddresses localhost:9051 --tlsRootCertFiles "${ORG2_TLS}"
)
query() {
  peer chaincode query -C "${CHANNEL}" -n "${CC}" -c "$1"
}
invoke() {
  peer chaincode invoke "${TX_ARGS[@]}" -c "$1" --waitForEvent
}
# JSON-encode arguments with Node to avoid injection and quoting mistakes.
payload() {
  node -e 'const [name,...args]=process.argv.slice(1); process.stdout.write(JSON.stringify({function:name,Args:args}))' "$@"
}

id="e2e-${GITHUB_RUN_ID:-local}-$(date +%s)"
hash="$(printf '%s' "${id}" | sha256sum | cut -d' ' -f1)"
record="$(node -e 'const [id,hash]=process.argv.slice(1); console.log(JSON.stringify({recordId:id,patientPseudoId:"test-patient",ownerOrgId:"Org1MSP",recordType:"DiagnosticReport",contentType:"application/fhir+json",objectUri:"s3://synthetic-benchmark/"+id,cipherHash:hash,createdAt:new Date().toISOString(),version:1}))' "${id}" "${hash}")"

echo "1/5: Submit record and await VALID commit on two peers"
invoke "$(payload 'RegistryContract:RegisterRecord' "${record}")"
actual="$(query "$(payload 'RegistryContract:GetRecord' "${id}")")"
node -e 'const x=JSON.parse(process.argv[1]);if(x.recordId!==process.argv[2]||x.ownerOrgId!=="Org1MSP"){process.exit(1)}' "${actual}" "${id}"

echo "2/5: Reject duplicate registration"
if invoke "$(payload 'RegistryContract:RegisterRecord' "${record}")";then
  echo "ERROR: duplicate registration unexpectedly succeeded" >&2
  exit 1
fi

echo "3/5: Verify signed patient identity consent and revocation"
# The project does not yet provision dedicated patient certificates; the test identity
# stands in for a patient solely to validate chaincode signature enforcement.
identity="$(query "$(payload 'ConsentContract:CallerID')")"
policy="$(node -e 'const [id,patient]=process.argv.slice(1);console.log(JSON.stringify({policyId:"policy-"+id,patientPseudoId:patient,granteeOrgId:"Org2MSP",recordTypes:["DiagnosticReport"],purpose:["treatment"],validFrom:"2025-01-01T00:00:00Z",validTo:"2035-01-01T00:00:00Z",status:"ACTIVE"}))' "${id}" "${identity}")"
invoke "$(payload 'ConsentContract:GrantConsent' "${policy}")"
check="$(query "$(payload 'ConsentContract:CheckAccess' "${identity}" 'Org2MSP' 'DiagnosticReport' '2026-01-01T00:00:00Z' 'treatment')")"
node -e 'if(JSON.parse(process.argv[1]).allowed!==true)process.exit(1)' "${check}"
invoke "$(payload 'ConsentContract:RevokeConsent' "policy-${id}")"
check="$(query "$(payload 'ConsentContract:CheckAccess' "${identity}" 'Org2MSP' 'DiagnosticReport' '2026-01-01T00:00:00Z' 'treatment')")"
node -e 'if(JSON.parse(process.argv[1]).allowed!==false)process.exit(1)' "${check}"

echo "4/5: Append-only audit event"
event="$(node -e 'const [id,patient]=process.argv.slice(1); console.log(JSON.stringify({eventId:"audit-"+id,recordId:id,patientPseudoId:patient,requesterOrgId:"Org1MSP",purpose:"synthetic-test",outcome:"ALLOW",at:new Date().toISOString()}))' "${id}" "${identity}")"
invoke "$(payload 'AuditContract:LogAccess' "${event}")"
audit="$(query "$(payload 'AuditContract:GetAuditByPatient' "${identity}")")"
node -e 'const x=JSON.parse(process.argv[1]);if(!x.some(e=>e.eventId===process.argv[2]))process.exit(1)' "${audit}" "audit-${id}"
if invoke "$(payload 'AuditContract:LogAccess' "${event}")";then
  echo "ERROR: duplicate audit event unexpectedly succeeded" >&2
  exit 1
fi

echo "5/5: Confirm private data collection write and read"
# Peer source identity is a collection member. The value is synthetic only.
transient="$(node -e 'console.log(JSON.stringify({recordKey:Buffer.from("synthetic-test-key").toString("base64")}))')"
CORE_PEER_TLS_ENABLED=true peer chaincode invoke "${TX_ARGS[@]}" --transient "${transient}" -c "$(payload 'RegistryContract:PutRecordKey' "${id}")" --waitForEvent
key="$(query "$(payload 'RegistryContract:GetRecordKey' "${id}")")"
node -e 'if(Buffer.from(JSON.parse(process.argv[1]),"base64").toString()!=="synthetic-test-key")process.exit(1)' "${key}"

echo "PASS: real Fabric ledger writes, reads, signature-based consent, revocation, audit and PDC"
