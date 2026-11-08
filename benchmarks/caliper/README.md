# Hyperledger Caliper 0.6.0 on Health Chain Shield

This directory contains workload definitions for the real Hyperledger Fabric 2.5.4 network. It is an evaluation component of the **Health Chain Shield medical data exchange system**, not the main purpose of the repository.

## Test coverage

| Workload | File | Operation |
| --- | --- | --- |
| Public metadata write | `benchmark.yaml` | `RegistryContract:CreateRecord` |
| Public metadata evaluate | `benchmark.yaml` | `RegistryContract:ReadRecord` |
| Private key write | `pdc-benchmark.yaml` | `RegistryContract:PutRecordKey` |
| Private clinical writes | `pdc-benchmark.yaml` | `RegistryContract:AddDiagnosis`, `RegistryContract:AddLabResults` |
| Private key evaluate | `pdc-read-benchmark.yaml` | `RegistryContract:GetRecordKey` |
| Connector validation | `smoke.yaml` | Small public-write/read/PDC-write run |

These workloads use generated synthetic data, not real patient documents.

## Running on a deployed Fabric network

First deploy Fabric and the chaincode using the [system reproduction instructions](../../docs/REPRODUCIBILITY.md). Run the Caliper preparation from the repository root:

```bash
export FABRIC_SAMPLES=/absolute/path/to/fabric-samples
node scripts/caliper-network-profile.mjs
cd benchmarks/caliper
npm init -y
npm install --no-audit --no-fund @hyperledger/caliper-cli@0.6.0
npx caliper bind --caliper-bind-sut fabric:fabric-gateway
npx caliper launch manager --caliper-flow-only-test --caliper-workspace . --caliper-benchconfig smoke.yaml --caliper-networkconfig network.local.yaml
```

The Fabric 2.5 connector binding used here is **`fabric:fabric-gateway`**, not `fabric:2.5`. The generated `network.local.yaml` follows Caliper 0.6.0's `channels` and `organizations` list schema. It contains references to local enrollment credentials and is gitignored. Never commit credentials or any patient-identifying dataset.

Run the full workload specifications by replacing `smoke.yaml` with `benchmark.yaml`, `pdc-benchmark.yaml` or `pdc-read-benchmark.yaml`. GitHub Actions also offers a [Caliper study workflow](../../.github/workflows/fabric-caliper.yml) with `smoke` and `full` modes, preserving the Caliper logs and HTML report when available.

## Measurement and interpretation

Caliper fixed-rate workload configuration supplies an **offered request rate**. Caliper reports successful transactions, achieved throughput and latency; offered TPS is *not* the same as measured committed TPS.

- A public `CreateRecord` transaction commits record metadata on the ledger.
- Private data writes use **transient proposal data**, not public chaincode arguments; they require an installed `recordKeys` collection and authorized peers. Caliper 0.6.0's Fabric Gateway connector serializes `transientMap` with `Object.keys()`, so these workloads deliberately pass a plain object of `Buffer` values rather than a JavaScript `Map` (despite the connector documentation describing a Map).
- Evaluate reads do not create new ledger transactions and must be compared separately with write TPS.
- Existing workloads do not upload the paper's 1–5 MB encrypted off-chain files; they are microbenchmarks of ledger operations.

No Caliper result should be added to the manuscript based only on the configuration files. Use the saved live-network reports and cite their run ID and hardware/settings.

Reference: [Official Caliper 0.6.0 Fabric connector documentation](https://hyperledger-caliper.github.io/caliper/0.6.0/connectors/fabric-config/).
