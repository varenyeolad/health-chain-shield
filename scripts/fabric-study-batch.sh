#!/usr/bin/env bash
# Run manuscript-shaped BatchTimeout study on fresh two-org Fabric networks.
# Each timeout is applied in the genesis channel config, verified from active ledger config,
# then measured with the same 10 clients, 10 rounds of 100 synthetic commits, 3s cooldown.
set -euo pipefail
: "${FABRIC_SAMPLES:?Set FABRIC_SAMPLES to the installed fabric-samples directory}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
network="${FABRIC_SAMPLES}/test-network"
mkdir -p "${root}/benchmarks/results"
cleanup() {
  if [[ -f "${network}/network.sh" ]]; then
    (cd "${network}" && ./network.sh down) || true
  fi
}
trap cleanup EXIT
export FABRIC_MODE=fabric
export FABRIC_VERSION="${FABRIC_VERSION:-2.5.4}"
export FABRIC_PEER_ENDPOINT=localhost:7051
export FABRIC_PEER_HOST_ALIAS=peer0.org1.example.com
export FABRIC_MSP_ID=Org1MSP
export FABRIC_CHANNEL=healthchannel
export FABRIC_CHAINCODE=healthchain
export FABRIC_BENCH_LEVELS=10
export FABRIC_BENCH_TX="${FABRIC_BENCH_TX:-100}"
export FABRIC_BENCH_ROUNDS="${FABRIC_BENCH_ROUNDS:-10}"
export FABRIC_BENCH_COOLDOWN_MS="${FABRIC_BENCH_COOLDOWN_MS:-3000}"
export FABRIC_BENCH_OUTPUT="../benchmarks/results"
(cd "${root}/backend" && npm install --no-audit --no-fund)
for ms in 100 500 1000 2000 5000; do
  echo "=== Running real orderer BatchTimeout ${ms}ms ==="
  export FABRIC_BATCH_TIMEOUT_MS="$ms"
  export FABRIC_BENCH_LABEL="verified-orderer-batch-${ms}ms"
  bash "${root}/scripts/fabric-test-network.sh"
  org="${network}/organizations/peerOrganizations/org1.example.com"
  export FABRIC_TLS_CERT_PATH="${org}/peers/peer0.org1.example.com/tls/ca.crt"
  export FABRIC_CERT_PATH
  FABRIC_CERT_PATH="$(find "${org}/users/User1@org1.example.com/msp/signcerts" -maxdepth 1 -type f | head -n 1)"
  export FABRIC_KEY_PATH
  FABRIC_KEY_PATH="$(find "${org}/users/User1@org1.example.com/msp/keystore" -maxdepth 1 -type f | head -n 1)"
  (cd "${root}/backend" && npx ts-node --transpile-only scripts/live-fabric-performance.ts)
  echo "Completed BatchTimeout=${ms}ms"
  cleanup
  sleep 5
done
echo "All five live BatchTimeout experiments completed"
