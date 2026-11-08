#!/usr/bin/env python3
"""Render the manuscript Figures 3–6 from the archived summary.csv.

Uses the *same plotting section* as analyze_ci_runs.py, without re-running
the bootstrap analysis (which requires the original GitHub Actions artifacts).
The archived CSV is read unchanged. Output PNGs may differ at the byte level
from archived originals due to font/rendering library versions.
"""
from pathlib import Path
import os
import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
summary = ROOT / "results" / "summary.csv"
original_analysis = ROOT / "analyze_ci_runs.py"
df = pd.read_csv(summary)
expected = {"A": 6, "B": 5}
for run, n in expected.items():
    if (df["run"] == run).sum() != n:
        raise ValueError(f"Expected {n} summary rows for run {run}")

# Extract the plotting portion of the original archived analysis file, so
# figure definitions and labels remain consistent with the attached source.
source = original_analysis.read_text(encoding="utf-8")
marker = "# ------------------------------------------------------------------ figures"
if source.count(marker) != 1:
    raise ValueError("Could not locate unique plotting section in original analysis")
plot_code = source.split(marker, 1)[1]
out = ROOT / "results"
out.mkdir(parents=True, exist_ok=True)
namespace = {
    "np": np,
    "pd": pd,
    "plt": plt,
    "os": os,
    "df": df,
    "OUT": str(out),
}
exec(compile(plot_code, str(original_analysis), "exec"), namespace)
for name in [
    "fig3_throughput_vs_clients.png",
    "fig4_latency_vs_clients.png",
    "fig5_latency_vs_batchtimeout.png",
    "fig6_throughput_vs_batchtimeout.png",
]:
    f = out / name
    if not f.is_file() or f.stat().st_size < 1000:
        raise RuntimeError(f"Figure not rendered: {f}")
    print(f"Rendered {f.relative_to(ROOT)} ({f.stat().st_size} bytes)")
