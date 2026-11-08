# Experimental Results

This document summarizes the measured performance of the Health Chain Shield blockchain record-registration path. The full numerical dataset and Figures 3–6 are in [`paper-analysis/results/`](paper-analysis/results/).

## Concurrency scaling

| Clients | Mean TPS | Mean latency (ms) | P95 latency (ms) |
| ---: | ---: | ---: | ---: |
| 1 | 0.497 | 2,012.28 | 2,013.97 |
| 2 | 0.993 | 2,013.07 | 2,015.69 |
| 5 | 2.481 | 2,015.31 | 2,018.99 |
| 10 | 384.631 | 25.98 | 33.45 |
| 20 | 471.332 | 41.88 | 54.86 |
| 50 | 465.426 | 102.95 | 141.27 |

## Ordering BatchTimeout

| BatchTimeout | Mean TPS | Mean latency (ms) | P95 latency (ms) |
| ---: | ---: | ---: | ---: |
| 100 ms | 197.315 | 51.09 | 63.98 |
| 500 ms | 198.137 | 50.88 | 61.46 |
| 1 s | 201.309 | 50.04 | 62.22 |
| 2 s | 191.941 | 52.48 | 64.32 |
| 5 s | 180.273 | 55.84 | 68.06 |

Each configuration contains **10 rounds of 100 submitted transactions**, with **100% confirmed commits** in the recorded experiments. The analysis script computes dispersion and confidence intervals.

See [Experimental methodology](EXPERIMENTS.md), [statistical analysis](paper-analysis/) and the [reproduction guide](../docs/REPRODUCIBILITY.md).

The benchmark measures the Fabric metadata-write commit path, not the transfer of encrypted off-chain clinical files.
