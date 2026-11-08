# Experimental Evaluation

This directory contains the performance workloads and statistical analysis supporting the paper *Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange*.

## Experiments

| Study | Parameters | Experimental output |
| --- | --- | --- |
| Client concurrency | 1, 2, 5, 10, 20, 50 clients; BatchTimeout 2 s; 10 rounds × 100 transactions | Throughput, mean/P95 commit latency, success rate |
| Ordering BatchTimeout | 100, 500, 1000, 2000, 5000 ms; 10 concurrent clients; 10 rounds × 100 transactions | Throughput, mean/P95 commit latency, success rate |
| Hyperledger Caliper | Public ledger writes, private-data writes, evaluate/read operations | Separate operation-level microbenchmarks |

The two main experiments time confirmed `RegistryContract:RegisterRecord` transactions on **Hyperledger Fabric v2.5.4**. Their analysis and figures are in [`paper-analysis/`](paper-analysis/).

### Analysis resources

- [`paper-analysis/analyze_ci_runs.py`](paper-analysis/analyze_ci_runs.py) — statistical processing of transaction measurements.
- [`paper-analysis/results/summary.csv`](paper-analysis/results/summary.csv) — metrics and confidence intervals for all 11 configurations.
- [`paper-analysis/results/`](paper-analysis/results/) — Figures 3–6.
- [`EXPERIMENTS.md`](EXPERIMENTS.md) — methodology and result tables.
- [`RESULTS.md`](RESULTS.md) — concise experimental summary.

## Measurements

Throughput is successful confirmed commits divided by round duration. Mean latency and P95 capture the client-observed interval through commit confirmation; success rate is committed transactions divided by attempted submissions.

The analysis computes mean round throughput with a 95% Student-t confidence interval, pooled commit latency percentiles and 95% bootstrap confidence intervals using 10,000 resamples of complete rounds.

### Reproduce the figures and statistics

```bash
python3 -m pip install numpy pandas scipy matplotlib
python3 benchmarks/paper-analysis/analyze_ci_runs.py \
  /path/to/concurrency-data \
  /path/to/batch-timeout-data \
  /path/to/output
```

The archived [`summary.csv`](paper-analysis/results/summary.csv) can also regenerate the figures directly:

```bash
python3 benchmarks/paper-analysis/render_figures_from_summary.py
```

## Implementation and validation

- [`backend/scripts/live-fabric-performance.ts`](../backend/scripts/live-fabric-performance.ts) submits unique synthetic metadata through Fabric Gateway SDK and records successful commit measurements.
- [`scripts/fabric-test-network.sh`](../scripts/fabric-test-network.sh) deploys the two-organization test network.
- [`scripts/fabric-study-batch.sh`](../scripts/fabric-study-batch.sh) applies the five ordering configurations.
- [`caliper/`](caliper/) contains the public-write, PDC and read workloads.
- [`docs/REPRODUCIBILITY.md`](../docs/REPRODUCIBILITY.md) explains the network and analysis setup.

The measured transaction workload consists of compact synthetic on-chain record metadata. Off-chain transfer of encrypted 1–5 MB clinical files and fault tolerance of a multi-orderer Raft cluster are not evaluated by these measurements.
