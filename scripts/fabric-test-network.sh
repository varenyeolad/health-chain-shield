#!/usr/bin/env bash
set -euo pipefail
# Requires the official fabric-samples test-network, Fabric binaries/images, Docker and Go.
# The upstream two-org test network is intended for development ONLY (single Raft orderer).
if [[ -z "${FABRIC_SAMPLES:-}" ]]; then echo "Set FABRIC_SAMPLES to your fabric-samples directory" >&2; exit 1; fi
NETWORK="${FABRIC_SAMPLES}/test-network"
[[ -f "${NETWORK}/network.sh" ]] || { echo "Missing official test-network scripts" >&2; exit 1; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Resolving and verifying Go chaincode dependencies before Fabric packaging"
(cd "${ROOT}/backend/fabric-chaincode" && go mod tidy && go mod verify && go test ./...)
cd "${NETWORK}"
if [[ -n "${FABRIC_BATCH_TIMEOUT_MS:-}" ]]; then
  bash "${ROOT}/scripts/fabric-batch-timeout.sh" "${FABRIC_BATCH_TIMEOUT_MS}"
fi
./network.sh up -s couchdb -i "${FABRIC_VERSION:-2.5.4}"
# Explicitly wait for the published peer ports, not just container creation.
for port in 7051 9051; do
  ready=false
  for attempt in $(seq 1 45); do
    if (echo > "/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1; then ready=true; break; fi
    sleep 2
  done
  if [[ "$ready" != true ]]; then
    docker ps -a >&2 || true
    docker logs peer0.org2.example.com --tail 150 >&2 || true
    echo "Peer port $port not ready" >&2
    exit 1
  fi
done
./network.sh createChannel -c healthchannel -d 5 -r 15
if [[ -n "${FABRIC_BATCH_TIMEOUT_MS:-}" ]]; then
  bash "${ROOT}/scripts/fabric-verify-batch-timeout.sh" "${FABRIC_BATCH_TIMEOUT_MS}"
fi
./network.sh deployCC -c healthchannel -ccn healthchain -ccp "${ROOT}/backend/fabric-chaincode" -ccl go -cccg "${ROOT}/backend/fabric-chaincode/collections_config.json"
echo "Fabric test network deployed. Configure backend identity and peer TLS before enabling FABRIC_MODE=fabric."
