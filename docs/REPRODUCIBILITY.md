# Reproducing the Health Chain Shield Experimental Evaluation

This guide documents the software, Fabric network, experimental procedures and statistical analysis accompanying *Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange*.

## Environment

The study uses **Hyperledger Fabric 2.5.4**, a two-organization consortium test network (**Org1MSP**, **Org2MSP**), CouchDB and a single Raft orderer, with **Go smart contracts**. A Node.js/TypeScript integration service uses the Fabric Gateway SDK to submit transactions and await valid commit confirmation.

Required software:

- Linux with Docker and the official Hyperledger Fabric **2.5.4** binaries and Docker images.
- A compatible Go toolchain and Node.js 20+.
- Python 3 with NumPy, pandas, SciPy and Matplotlib for statistical analysis.
- Hyperledger Caliper **0.6.0** for separate blockchain microbenchmarks.

Use synthetic healthcare records only. Do not deploy the development network with real medical data or keys intended for production.

## 1. Deploy the network

Download and install the official [fabric-samples](https://github.com/hyperledger/fabric-samples) test network and matching Fabric 2.5.4 components.

From the repository root:

```bash
export FABRIC_SAMPLES=/absolute/path/to/fabric-samples
export FABRIC_VERSION=2.5.4
bash scripts/fabric-test-network.sh
```

The deployment creates the `healthchannel` channel and deploys the `healthchain` Go contracts. The [network setup script](../scripts/fabric-test-network.sh) configures peers and the ordering service; the [chaincode documentation](../backend/fabric-chaincode/README.md) explains the contracts.

## 2. Configure the backend

Copy `backend/.env.example` to `backend/.env`. Configure:

- `FABRIC_MODE=fabric`
- `FABRIC_CHANNEL=healthchannel` and `FABRIC_CHAINCODE=healthchain`
- `FABRIC_MSP_ID=Org1MSP`
- `FABRIC_PEER_ENDPOINT` and `FABRIC_PEER_HOST_ALIAS`
- peer TLS root certificate, client signing certificate and private key.

The Fabric Gateway SDK adapter submits proposals, obtains endorsements, sends transactions to the ordering service and checks commit status before reporting success.

The frontend demonstration uses sample patient accounts; production-style patient X.509 certificate enrollment and full cross-organization clinical authorization are not part of the verified application workflow.

## 3. Verify smart contracts and integration

Go tests:

```bash
cd backend/fabric-chaincode
go mod tidy
go test ./...
```

Backend tests:

```bash
cd backend
npm install
npm test -- --runInBand
```

On a deployed test network, [`scripts/fabric-integration-test.sh`](../scripts/fabric-integration-test.sh) checks record registration/read, duplicate rejection, consent grant/revoke and access evaluation, audit events, and private-data operations.

## 4. Experiment A — Client concurrency

This study varies **1, 2, 5, 10, 20 and 50 concurrent clients**, with **BatchTimeout 2 seconds**. Each configuration runs **10 rounds × 100 transactions**, separated by a **3-second cooldown**. All record metadata is synthetic.

The network and workload scripts are [`scripts/fabric-test-network.sh`](../scripts/fabric-test-network.sh) and [`backend/scripts/live-fabric-performance.ts`](../backend/scripts/live-fabric-performance.ts).

Required workload configuration:

```bash
export FABRIC_MODE=fabric
export FABRIC_BENCH_LEVELS=1,2,5,10,20,50
export FABRIC_BENCH_TX=100
export FABRIC_BENCH_ROUNDS=10
export FABRIC_BENCH_COOLDOWN_MS=3000
```

With valid peer and identity credentials configured, run from `backend/`:

```bash
npx ts-node --transpile-only scripts/live-fabric-performance.ts
```

The runner exports transaction-level JSON/CSV, per-round TPS, latency percentiles, and success counts.

## 5. Experiment B — BatchTimeout

The ordering-service settings are **100, 500, 1000, 2000 and 5000 milliseconds**. For each value, the study creates a fresh Fabric network, checks the active channel configuration, and submits **10 clients × 100 transactions per round × 10 rounds**, with 3-second cooldowns.

The full procedure is implemented in:

- [`scripts/fabric-study-batch.sh`](../scripts/fabric-study-batch.sh)
- [`scripts/fabric-batch-timeout.sh`](../scripts/fabric-batch-timeout.sh)
- [`scripts/fabric-verify-batch-timeout.sh`](../scripts/fabric-verify-batch-timeout.sh)

Run from the repository root with `FABRIC_SAMPLES` configured:

```bash
bash scripts/fabric-study-batch.sh
```

The script records each configuration's measured performance and channel metadata. The five settings must be interpreted as measurements taken under the stated load and block settings, rather than a universal BatchTimeout-only performance relation.

## 6. Statistical analysis

Experimental results and figures are committed in [`benchmarks/paper-analysis/results/`](../benchmarks/paper-analysis/results/). To independently analyze the raw transaction records for the two studies, provide one input directory for each dataset:

```bash
python3 -m pip install numpy pandas scipy matplotlib
python3 benchmarks/paper-analysis/analyze_ci_runs.py \
  /path/to/concurrency-data \
  /path/to/batch-timeout-data \
  /path/to/output
```

The script calculates:

- Mean per-round TPS, standard deviation and 95% Student-t confidence intervals.
- Mean/P50/P95/P99 of successful transaction commit latency.
- 95% bootstrap confidence intervals for mean and P95 latency from 10,000 resamples of complete rounds.
- First-round versus later-round latency, and a Little's-law consistency check.

The archived [`summary.csv`](../benchmarks/paper-analysis/results/summary.csv) provides the 11 experiment configurations. Figures 3–6 can be regenerated from this CSV alone:

```bash
python3 benchmarks/paper-analysis/render_figures_from_summary.py
```

## 7. Hyperledger Caliper

The [Caliper benchmark directory](../benchmarks/caliper/) provides workloads for:

- Public writes: `CreateRecord`.
- Private data writes: `PutRecordKey`, `AddDiagnosis`, `AddLabResults`.
- Read/evaluate: `ReadRecord`, `GetRecordKey`.

Caliper evaluates separate blockchain operations; its results should not be combined with the Fabric Gateway submit-path dataset when preparing experimental tables.

## Evaluation scope

The performance experiments time **compact synthetic record-metadata transactions** through confirmed Fabric commits. They do not time full 1–5 MB encrypted file transfers to MinIO. The deployed two-organization test network has a single Raft orderer and does not prove multi-orderer failure tolerance. System-level patient enrollment and full FHIR interoperability require separate integration validation.

The exact reported statistics are retained in [`benchmarks/paper-analysis/results/summary.csv`](../benchmarks/paper-analysis/results/summary.csv).
