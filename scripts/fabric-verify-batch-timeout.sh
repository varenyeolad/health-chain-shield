#!/usr/bin/env bash
set -euo pipefail
: "${FABRIC_SAMPLES:?FABRIC_SAMPLES required}"
ms="${1:?Expected BatchTimeout in milliseconds required}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
network="${FABRIC_SAMPLES}/test-network"
export PATH="${FABRIC_SAMPLES}/bin:${PATH}"
export FABRIC_CFG_PATH="${FABRIC_SAMPLES}/config"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE="${network}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${network}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051
orderer_ca="${network}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
peer channel fetch config "$tmp/config.block" -c healthchannel -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$orderer_ca"
configtxlator proto_decode --input "$tmp/config.block" --type common.Block --output "$tmp/config.json"
actual="$(jq -r '.data.data[0].payload.data.config.channel_group.groups.Orderer.values.BatchTimeout.value.timeout' "$tmp/config.json")"
expected="$([ "$ms" -lt 1000 ] && echo "${ms}ms" || echo "$((ms / 1000))s")"
if [[ "$actual" != "$expected" ]]; then
  echo "ERROR: active orderer BatchTimeout $actual differs from requested $expected" >&2
  exit 1
fi
mkdir -p "${root}/benchmarks/results"
jq --arg timeout "$actual" --arg sha "${GITHUB_SHA:-unrecorded}" '{
  verifiedBatchTimeout: $timeout,
  gitSha: $sha,
  ordererBatchSize: .data.data[0].payload.data.config.channel_group.groups.Orderer.values.BatchSize.value,
  fabricConfigBlock: "verified via peer channel fetch config",
  source: "active Fabric channel configuration"
}' "$tmp/config.json" > "${root}/benchmarks/results/channel-config-${ms}ms.json"
echo "Verified active channel BatchTimeout=$actual"
