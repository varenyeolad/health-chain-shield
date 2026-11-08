# Fabric Go chaincode — Health Chain Shield

This directory implements the Fabric ledger contracts used by the Health Chain Shield medical data exchange architecture:

- **RegistryContract**: register, read and query synthetic medical metadata with integrity anchors.
- **ConsentContract**: patient-signed grant/revoke policy operations and access checks.
- **AuditContract**: append-only recording and retrieval of access events.
- **Private data collection operations**: `PutRecordKey`, `GetRecordKey`, `AddDiagnosis` and `AddLabResults` use Fabric transient input to avoid exposing values in public transaction arguments.

The chaincode is deployed as `healthchain` on `healthchannel`. The default development network has Org1MSP and Org2MSP peers, CouchDB and one Raft orderer.

## Run

From the repository root:

```bash
export FABRIC_SAMPLES=/absolute/path/to/fabric-samples
export FABRIC_VERSION=2.5.4
bash scripts/fabric-test-network.sh
```

Go unit tests:

```bash
cd backend/fabric-chaincode
go test ./...
```

The [Fabric network CI](../../.github/workflows/fabric-network-integration.yml) has verified real commits, duplicate rejection, consent grant/revocation, audit and PDC operations on a running Fabric 2.5.4 test network, as well as backend Fabric Gateway SDK submit/read.

**Security boundary:** `patientPseudoId` must match the submitting Fabric identity for signing grant/revoke transactions. The web demonstration's patient IDs are not yet integrated with dedicated Fabric identities. Provider registration uses the caller's MSP ID. The example `recordKeys` collection policy requires review before use with sensitive keys. The one-orderer test network does not establish multi-orderer Raft fault tolerance.

Do not commit certificates, credentials, private keys or patient information. See the [system reproduction guide](../../docs/REPRODUCIBILITY.md).
