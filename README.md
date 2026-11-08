# Health Chain Shield

**Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange**

Research implementation accompanying the paper by **Aizhan Kenzhegarina and Aivar Sakhipov**.

Health Chain Shield presents a permissioned consortium architecture for secure cross-institutional medical data exchange. It integrates Hyperledger Fabric with patient-centric consent policies, cryptographic record integrity, encrypted off-chain storage, and auditable access operations. The repository contains the implementation, functional tests, performance workloads, statistical analysis, and figures supporting the study.

## Overview

Healthcare records are distributed across hospitals, laboratories, diagnostic centers, and other care providers. Exchanging these records requires consistent authorization, confidentiality, verifiable integrity, and accountability across organizational boundaries.

The proposed architecture maintains **clinical payloads off-chain**, while a permissioned ledger coordinates record metadata, consent decisions, integrity anchors, and audit events. This separation reduces the amount of sensitive information recorded on-chain and enables authorized institutions to exchange clinical information without placing the medical content directly on the ledger.

### Participants

| Participant | Responsibility |
| --- | --- |
| **Patient** | Authorizes, scopes, and revokes access to medical records |
| **Data provider** | Creates records, encrypts clinical content, and registers its metadata |
| **Data consumer** | Requests and retrieves authorized medical information |
| **Consortium administrator** | Manages participating organizations and network configuration |
| **Regulator / auditor** | Reviews authorized activity and audit evidence |

## System Architecture

```text
                   Healthcare participants
             Patients | Providers | Consumers
                              |
                 Application / FHIR interface
                              |
                      Integration gateway
                              |
              +---------------+---------------+
              |                               |
      Hyperledger Fabric               Off-chain storage
      -------------------               -----------------
      Registry contract                 Encrypted records
      Consent contract                  MinIO / S3 objects
      Audit contract                    Clinical payloads
      Private data collections
              |
       Consortium organizations
       Peers | CouchDB | Raft orderer
```

### Blockchain layer

The permissioned blockchain is based on **Hyperledger Fabric v2.5.4**, with **Go** smart contracts and an ordering service using **Raft**. The chaincode comprises three principal contracts:

- **RegistryContract** — registers and queries medical-record metadata, cryptographic hashes, timestamps, and references to off-chain objects.
- **ConsentContract** — represents patient-authorized access policies specifying grantee, record scope, permitted purpose, and validity period; supports access evaluation and revocation.
- **AuditContract** — records access events and supports audit queries.

The implementation also includes **private data collection (PDC)** operations using transient inputs, allowing selected data to be shared with eligible consortium members without placing their values in public transaction arguments.

### Off-chain data and interoperability

Encrypted medical payloads are held in MinIO-compatible object storage. The ledger stores compact metadata and cryptographic integrity references rather than raw clinical documents. The backend uses **AES-256-GCM**, object storage adapters, and a **Fabric Gateway SDK** integration to submit transactions and verify their commit status.

The healthcare integration layer provides FHIR-oriented interfaces and clinical resource handling. The application also includes interfaces for patients, providers, consumers, administrators, and auditors.

### Medical data exchange workflow

1. A data provider prepares a medical record, encrypts its clinical content, and stores the encrypted object off-chain.
2. The provider registers the record's metadata and integrity reference through the Registry contract.
3. The patient grants a consent policy for a specific organization, purpose, scope, and period.
4. The consumer requests access to the record. The Consent contract evaluates the applicable authorization.
5. An authorized consumer accesses the off-chain record through the integration layer, while the ledger provides an integrity anchor.
6. The Audit contract records access activity. Revocation affects subsequent authorization checks.

## Implementation

| Layer | Technologies |
| --- | --- |
| Permissioned blockchain | Hyperledger Fabric 2.5.4, Raft, CouchDB |
| Smart contracts | Go, Fabric Contract API, private data collections |
| Blockchain integration | Fabric Gateway SDK, Node.js, TypeScript, NestJS |
| Clinical data storage | MinIO-compatible object storage, AES-256-GCM |
| Backend persistence | PostgreSQL, Prisma |
| Web application | React, TypeScript, Vite, Tailwind CSS |
| Performance evaluation | Instrumented Fabric commit-path workloads, Hyperledger Caliper 0.6.0 |
| Statistical analysis | Python, NumPy, pandas, SciPy, Matplotlib |

### Repository structure

```text
src/                            Healthcare application interface
backend/
  src/                          Integration services, encryption, storage, API
  fabric-chaincode/             Go Registry, Consent, Audit, PDC contracts
  docker/                       Supporting services
scripts/                        Fabric deployment and channel setup
benchmarks/
  paper-analysis/
    analyze_ci_runs.py          Analysis of experimental measurements
    results/
      summary.csv               Summary statistics and confidence intervals
      fig3_*.png                Throughput versus concurrency
      fig4_*.png                Mean and P95 latency versus concurrency
      fig5_*.png                Latency versus BatchTimeout
      fig6_*.png                Throughput versus BatchTimeout
  caliper/                      Public-write, PDC, and read workloads
  EXPERIMENTS.md                Experimental design and numerical results
  RESULTS.md                    Experimental results summary
docs/
  REPRODUCIBILITY.md            Deployment and reproduction guide
```

## Experimental Methodology

The experimental evaluation investigates the effect of **concurrent clients** and **ordering-service BatchTimeout** on throughput and client-observed transaction commit latency.

The study measures successful record-registration transactions through the complete Fabric submit path: proposal, endorsement, ordering, validation, and confirmed commit. Both experiments use **10 rounds of 100 transactions**, with a **3-second cooldown** between rounds.

The evaluation reports:

- **Throughput (TPS):** successfully committed transactions per second.
- **Mean commit latency:** client-observed elapsed time from submission to valid commit confirmation.
- **P95 latency:** the 95th percentile of successful transaction commit latencies.
- **Success rate:** the proportion of submitted transactions successfully committed.

The [statistical analysis](benchmarks/paper-analysis/) additionally provides throughput dispersion, 95% confidence intervals, P50 and P99 latencies, bootstrap intervals for mean and P95 latency, and a Little's-law consistency check.

### Experiment 1 — Client concurrency

The number of concurrent clients varies across **1, 2, 5, 10, 20, and 50**. The ordering BatchTimeout is set to **2 s**.

| Concurrent clients | Throughput (TPS) | Mean latency (ms) | P95 latency (ms) | Success rate |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0.497 | 2,012.28 | 2,013.97 | 100% |
| 2 | 0.993 | 2,013.07 | 2,015.69 | 100% |
| 5 | 2.481 | 2,015.31 | 2,018.99 | 100% |
| 10 | 384.631 | 25.98 | 33.45 | 100% |
| 20 | 471.332 | 41.88 | 54.86 | 100% |
| 50 | 465.426 | 102.95 | 141.27 | 100% |

At low concurrency, the latency is approximately 2 seconds, consistent with timeout-dominated block formation. At higher concurrency, the observed throughput increases and commit latency decreases as transaction arrival rates become sufficient for load-driven block cutting. The throughput approaches saturation between 20 and 50 clients, accompanied by increased latency at 50 clients.

**Figures:** [Figure 3 — Throughput versus concurrency](benchmarks/paper-analysis/results/fig3_throughput_vs_clients.png) · [Figure 4 — Mean and P95 latency](benchmarks/paper-analysis/results/fig4_latency_vs_clients.png)

### Experiment 2 — BatchTimeout configuration

The ordering-service BatchTimeout is configured to **100 ms, 500 ms, 1 s, 2 s, and 5 s**, with **10 concurrent clients**. Each configuration is evaluated on a freshly initialized network and the configured timeout is verified before measurement.

| BatchTimeout | Throughput (TPS) | Mean latency (ms) | P95 latency (ms) | Success rate |
| ---: | ---: | ---: | ---: | ---: |
| 100 ms | 197.315 | 51.09 | 63.98 | 100% |
| 500 ms | 198.137 | 50.88 | 61.46 | 100% |
| 1 s | 201.309 | 50.04 | 62.22 | 100% |
| 2 s | 191.941 | 52.48 | 64.32 | 100% |
| 5 s | 180.273 | 55.84 | 68.06 | 100% |

Under the measured workload, the results show a relatively limited effect of BatchTimeout on transaction latency, with a modest throughput reduction at longer settings. The effect of BatchTimeout depends on block-cutting behavior, block size, and offered load.

**Figures:** [Figure 5 — Latency versus BatchTimeout](benchmarks/paper-analysis/results/fig5_latency_vs_batchtimeout.png) · [Figure 6 — Throughput versus BatchTimeout](benchmarks/paper-analysis/results/fig6_throughput_vs_batchtimeout.png)

### Hyperledger Caliper microbenchmarks

The project also includes **Hyperledger Caliper v0.6.0** workloads to evaluate distinct blockchain operation classes:

| Operation class | Methods |
| --- | --- |
| Public ledger writes | `CreateRecord` |
| Private data collection writes | `PutRecordKey`, `AddDiagnosis`, `AddLabResults` |
| Read / evaluate | `ReadRecord`, `GetRecordKey` |

The corresponding configurations and workload implementations are in [`benchmarks/caliper/`](benchmarks/caliper/). Caliper measurements are a separate benchmark mode from the two Fabric Gateway submit-path experiments above.

## Statistical Analysis and Figures

The source data, statistical processing code, and experimental figures are available in [`benchmarks/paper-analysis/`](benchmarks/paper-analysis/):

- [`analyze_ci_runs.py`](benchmarks/paper-analysis/analyze_ci_runs.py) — computes summary statistics and confidence intervals from transaction-level experimental measurements.
- [`results/summary.csv`](benchmarks/paper-analysis/results/summary.csv) — contains all **11 experimental configurations** and their computed metrics.
- [`results/`](benchmarks/paper-analysis/results/) — contains Figures 3–6.
- [`render_figures_from_summary.py`](benchmarks/paper-analysis/render_figures_from_summary.py) — rebuilds the figures from the archived summary table.

To reproduce the numerical analysis from the two raw experimental datasets:

```bash
python3 -m pip install numpy pandas scipy matplotlib
python3 benchmarks/paper-analysis/analyze_ci_runs.py \
  /path/to/concurrency-data \
  /path/to/batch-timeout-data \
  /path/to/output
```

To regenerate Figures 3–6 from the included summary data:

```bash
python3 benchmarks/paper-analysis/render_figures_from_summary.py
```

The datasets and figures used in this README are taken from [`results/summary.csv`](benchmarks/paper-analysis/results/summary.csv).

## Getting Started

### Web application

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/varenyeolad/health-chain-shield.git
cd health-chain-shield
npm install
npm run dev
```

The development server is available at `http://localhost:8080`.

### Blockchain network

Install the official Hyperledger Fabric 2.5 sample network and dependencies according to the [deployment guide](docs/REPRODUCIBILITY.md). Then run:

```bash
export FABRIC_SAMPLES=/absolute/path/to/fabric-samples
export FABRIC_VERSION=2.5.4
bash scripts/fabric-test-network.sh
```

This creates a development channel and deploys the Go `healthchain` contracts.

### Backend integration

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Configure the Fabric client identity, TLS certificate, peer endpoint, and channel in `backend/.env` before enabling `FABRIC_MODE=fabric`. Additional database and object-storage services require their corresponding configuration.

### Tests

```bash
# Go smart contracts
cd backend/fabric-chaincode
go test ./...

# Backend
cd ..
npm test -- --runInBand
```

The [reproducibility guide](docs/REPRODUCIBILITY.md) describes the experimental environment, Fabric configuration, functional verification, and analysis procedure.

## Scope of the Research Prototype

The evaluated performance path measures **on-chain registration of compact synthetic record metadata** through confirmed Fabric commits. Clinical file encryption and off-chain storage are part of the architecture but **1–5 MB MinIO transfers are not included in the reported concurrency and BatchTimeout measurements**. The development network includes one Raft orderer; multi-orderer failure tolerance and deployment with real patient data are outside this evaluation.

## Citation

Kenzhegarina, A., and Sakhipov, A. *Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange*. Research manuscript.

## License

No repository license has been specified.
