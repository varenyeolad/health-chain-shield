# Experimental Methodology and Results

The performance evaluation of *Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange* investigates the behavior of the Fabric medical-record registration path under different client concurrency levels and ordering configurations.

The measurements and confidence intervals below are calculated by [`paper-analysis/analyze_ci_runs.py`](paper-analysis/analyze_ci_runs.py) from the recorded transaction-level results. The full statistical dataset is [`paper-analysis/results/summary.csv`](paper-analysis/results/summary.csv).

## Experimental setup

- **Blockchain:** Hyperledger Fabric v2.5.4; two peer organizations, CouchDB and a single Raft orderer.
- **Operation:** `RegistryContract:RegisterRecord` with synthetic medical record metadata.
- **Protocol:** 10 rounds × 100 submissions per configuration; 3-second cooldown between rounds.
- **Metrics:** successful commits per second, mean and P95 client-observed commit latency, success rate.
- **Statistics:** per-round TPS with 95% t confidence intervals; 10,000 round-bootstrap resamples for mean and P95 latency intervals.

## Experiment 1 — Concurrency scaling

BatchTimeout = 2 seconds.

| Clients | Mean throughput (TPS) | Mean latency (ms) | P95 latency (ms) | Successful commits |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0.497 | 2,012.28 | 2,013.97 | 1,000 / 1,000 |
| 2 | 0.993 | 2,013.07 | 2,015.69 | 1,000 / 1,000 |
| 5 | 2.481 | 2,015.31 | 2,018.99 | 1,000 / 1,000 |
| 10 | 384.631 | 25.98 | 33.45 | 1,000 / 1,000 |
| 20 | 471.332 | 41.88 | 54.86 | 1,000 / 1,000 |
| 50 | 465.426 | 102.95 | 141.27 | 1,000 / 1,000 |

The results show a transition from timeout-dominated commits at low client counts to faster load-driven block cutting at higher concurrency. Throughput approaches saturation at the highest tested concurrency levels.

**Figures:** [3](paper-analysis/results/fig3_throughput_vs_clients.png) and [4](paper-analysis/results/fig4_latency_vs_clients.png).

## Experiment 2 — BatchTimeout

Concurrency = 10 clients. Each timeout is applied to a fresh network and verified against the active Fabric channel configuration.

| BatchTimeout | Mean throughput (TPS) | Mean latency (ms) | P95 latency (ms) | Successful commits |
| ---: | ---: | ---: | ---: | ---: |
| 100 ms | 197.315 | 51.09 | 63.98 | 1,000 / 1,000 |
| 500 ms | 198.137 | 50.88 | 61.46 | 1,000 / 1,000 |
| 1 s | 201.309 | 50.04 | 62.22 | 1,000 / 1,000 |
| 2 s | 191.941 | 52.48 | 64.32 | 1,000 / 1,000 |
| 5 s | 180.273 | 55.84 | 68.06 | 1,000 / 1,000 |

The observed sensitivity to timeout is limited for this metadata-write workload, with slightly lower throughput at the longest timeout. Block-cutting behavior also depends on transaction arrival rate and block size.

**Figures:** [5](paper-analysis/results/fig5_latency_vs_batchtimeout.png) and [6](paper-analysis/results/fig6_throughput_vs_batchtimeout.png).

## Hyperledger Caliper

The [Caliper workload suite](caliper/) includes:

- Public ledger writes: `CreateRecord`.
- Private-data writes: `PutRecordKey`, `AddDiagnosis`, `AddLabResults`.
- Read/evaluate: `ReadRecord`, `GetRecordKey`.

Caliper results are evaluated separately from the two commit-path studies and require their own validated workload reports.

## Reproducibility

The statistical analysis source, summary CSV and Figures 3–6 are packaged in [`paper-analysis/`](paper-analysis/). See [the reproduction guide](../docs/REPRODUCIBILITY.md) for software, deployment, test, and analysis instructions.

**Scope:** These measurements concern compact synthetic ledger metadata; they do not include transmission of 1–5 MB off-chain MinIO objects. The test network contains a single Raft orderer, so failure tolerance of a multi-orderer deployment is not established.
