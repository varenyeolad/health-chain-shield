# Statistical Analysis — Medical Data Exchange Study

This directory contains the statistical analysis and figures for the experimental evaluation in *Design and Evaluation of a Permissioned Blockchain Architecture for Medical Data Exchange*, by Aizhan Kenzhegarina and Aivar Sakhipov.

## Files

| File | Purpose |
| --- | --- |
| [`analyze_ci_runs.py`](analyze_ci_runs.py) | Processes raw transaction-level measurements and generates summary statistics and figures |
| [`results/summary.csv`](results/summary.csv) | Eleven experimental configurations, TPS, latency percentiles, success rates and confidence intervals |
| [Figure 3](results/fig3_throughput_vs_clients.png) | Throughput versus client concurrency |
| [Figure 4](results/fig4_latency_vs_clients.png) | Mean and P95 latency versus client concurrency |
| [Figure 5](results/fig5_latency_vs_batchtimeout.png) | Mean and P95 latency versus BatchTimeout |
| [Figure 6](results/fig6_throughput_vs_batchtimeout.png) | Throughput versus BatchTimeout |
| [`render_figures_from_summary.py`](render_figures_from_summary.py) | Regenerates figures from the included summary CSV |

## Datasets and method

**Study A — Client concurrency:** 1, 2, 5, 10, 20 and 50 clients; BatchTimeout 2 s; ten rounds of 100 synthetic record-registration transactions at each concurrency level.

**Study B — Ordering BatchTimeout:** 100, 500, 1000, 2000 and 5000 ms; ten concurrent clients; ten rounds of 100 transactions at each setting, with a newly initialized network for every setting.

The script computes mean throughput with 95% t confidence intervals across rounds, pooled commit-latency percentiles, and 95% bootstrap confidence intervals over whole rounds with 10,000 resamples and a fixed random seed. The exported dataset also contains a Little's-law consistency check and first-round versus later-round latency.

## Reproduce the analysis

Place the raw transaction JSON for Study A and Study B in separate directories, then run:

```bash
python3 -m pip install numpy pandas scipy matplotlib
python3 analyze_ci_runs.py \
  /path/to/concurrency-data \
  /path/to/batch-timeout-data \
  /path/to/output
```

To regenerate the visualizations from the archived summary without rerunning the statistical analysis:

```bash
python3 render_figures_from_summary.py
```

The experimental tables and visualizations use [`results/summary.csv`](results/summary.csv) as their source. The original raw measurements are required to independently regenerate bootstrap intervals from transaction-level data.
