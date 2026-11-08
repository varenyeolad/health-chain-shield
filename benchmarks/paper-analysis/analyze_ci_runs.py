#!/usr/bin/env python3
"""Statistics, tables and figures of the revised manuscript, computed from the raw GitHub Actions artifacts.

usage:
  python3 analyze_ci_runs.py <study-concurrency dir> <study-batch-timeout dir> <output dir>

Run A = artifact study-concurrency-42294376222 (1-50 clients, BatchTimeout 2 s, one deployment)
Run B = artifact study-batch-timeout-42294636507 (BatchTimeout 0.1-5 s, 10 clients, fresh network per value)

Definitions (Section VI-A of the paper):
  throughput  = mean of per-round TPS (committed / round wall time), 95% t-interval, df = rounds - 1
  latency     = pooled committed transactions; 95% CI of the mean and of P95 (nearest rank)
                by bootstrap over whole rounds, 10,000 resamples, fixed seed
  Little's law check: N / mean latency
"""
import glob
import json
import os
import re
import sys

import numpy as np
import pandas as pd
from scipy import stats
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

RUN_A, RUN_B, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
RNG = np.random.default_rng(20261108)
B = 10000


def tci(x):
    x = np.asarray(x, float)
    m, sd = x.mean(), x.std(ddof=1)
    h = stats.t.ppf(0.975, len(x) - 1) * sd / np.sqrt(len(x))
    return m, sd, m - h, m + h


def nearest_rank(x, q):
    v = np.sort(np.asarray(x))
    return v[max(0, int(np.ceil(len(v) * q)) - 1)]


def boot(rounds, fn):
    vals = np.empty(B)
    for b in range(B):
        pick = RNG.integers(0, len(rounds), len(rounds))
        vals[b] = fn(np.concatenate([rounds[i] for i in pick]))
    return np.percentile(vals, [2.5, 97.5])


def analyse(path, run, bt):
    d = json.load(open(path))
    out = []
    for n in d["parameters"]["concurrencyLevels"]:
        rounds = [r for r in d["roundsDetail"] if r["concurrency"] == n]
        lat = [np.array([s["latencyMs"] for s in r["samples"] if s["committed"]]) for r in rounds]
        pooled = np.concatenate(lat)
        tps = [r["tps"] for r in rounds]
        m, sd, lo, hi = tci(tps)
        mci = boot(lat, np.mean)
        pci = boot(lat, lambda v: nearest_rank(v, 0.95))
        out.append(dict(
            run=run, batch_timeout_s=bt, clients=n, rounds=len(rounds),
            attempted=sum(r["attempted"] for r in rounds), committed=sum(r["committed"] for r in rounds),
            tps=m, tps_sd=sd, tps_ci_lo=lo, tps_ci_hi=hi, tps_min=min(tps), tps_max=max(tps),
            success_pct=100 * np.mean([r["successRate"] for r in rounds]),
            lat_mean_ms=pooled.mean(), lat_mean_ci_lo=mci[0], lat_mean_ci_hi=mci[1],
            lat_p50_ms=nearest_rank(pooled, 0.5), lat_p95_ms=nearest_rank(pooled, 0.95),
            lat_p95_ci_lo=pci[0], lat_p95_ci_hi=pci[1], lat_p99_ms=nearest_rank(pooled, 0.99),
            lat_min_ms=pooled.min(), lat_max_ms=pooled.max(),
            little_tps=n / (pooled.mean() / 1000), little_ratio=m / (n / (pooled.mean() / 1000)),
            round1_mean_ms=lat[0].mean(), later_rounds_mean_ms=np.concatenate(lat[1:]).mean(),
            source=os.path.basename(path), git_sha=d.get("gitSha"), label=d.get("experimentalLabel")))
    return out


rows = analyse(glob.glob(os.path.join(RUN_A, "fabric-live-perf-*.json"))[0], "A", 2.0)
for f in glob.glob(os.path.join(RUN_B, "fabric-live-perf-*.json")):
    lab = json.load(open(f))["experimentalLabel"]
    rows += analyse(f, "B", int(re.search(r"(\d+)ms", lab).group(1)) / 1000)
df = pd.DataFrame(rows).sort_values(["run", "batch_timeout_s", "clients"])
df.to_csv(os.path.join(OUT, "summary.csv"), index=False)
pd.set_option("display.width", 200)
print(df[["run", "batch_timeout_s", "clients", "committed", "tps", "tps_ci_lo", "tps_ci_hi", "lat_mean_ms",
          "lat_mean_ci_lo", "lat_mean_ci_hi", "lat_p95_ms", "little_tps", "little_ratio"]].round(3).to_string(index=False))

# ------------------------------------------------------------------ figures
plt.rcParams.update({"font.size": 9, "axes.labelsize": 9, "legend.fontsize": 8})
A = df[df.run == "A"].sort_values("clients")
Bt = df[df.run == "B"].sort_values("batch_timeout_s")
W, H = 3.4, 2.55


def err(t, m, lo, hi):
    return np.vstack([t[m] - t[lo], t[hi] - t[m]])


def shade(ax):
    ax.axvspan(0.8, 7.5, color="0.92", zorder=0)
    ax.axvspan(7.5, 30, color="0.97", zorder=0)


def xticks(ax, v, fmt=lambda x: f"{x:g}"):
    ax.set_xscale("log"); ax.set_xticks(list(v)); ax.set_xticklabels([fmt(x) for x in v]); ax.minorticks_off()


f, ax = plt.subplots(figsize=(W, H)); shade(ax)
ax.errorbar(A.clients, A.tps, yerr=err(A, "tps", "tps_ci_lo", "tps_ci_hi"), marker="o", ms=4, capsize=3, lw=1.2, label="Measured (mean, 95% CI)", zorder=3)
ax.plot(A.clients, A.little_tps, "k--", lw=0.8, label="N / mean latency", zorder=2)
xticks(ax, A.clients, lambda x: str(int(x))); ax.set_yscale("log")
ax.text(2.4, 150, "timeout-\nbound", ha="center", fontsize=7, color="0.3")
ax.text(13.5, 0.62, "size-\nbound", ha="center", fontsize=7, color="0.3")
ax.text(38, 0.62, "satur-\nation", ha="center", fontsize=7, color="0.3")
ax.set_xlabel("Concurrent closed-loop clients, N"); ax.set_ylabel("Throughput (TPS, log scale)")
ax.grid(alpha=0.3); ax.legend(loc="center right"); f.tight_layout(); f.savefig(os.path.join(OUT, "fig3_throughput_vs_clients.png"), dpi=300); plt.close(f)

f, ax = plt.subplots(figsize=(W, H)); shade(ax)
ax.errorbar(A.clients, A.lat_mean_ms, yerr=err(A, "lat_mean_ms", "lat_mean_ci_lo", "lat_mean_ci_hi"), marker="o", ms=4, capsize=3, lw=1.2, label="Mean", zorder=3)
ax.errorbar(A.clients, A.lat_p95_ms, yerr=err(A, "lat_p95_ms", "lat_p95_ci_lo", "lat_p95_ci_hi"), marker="s", ms=4, capsize=3, lw=1.2, label="P95", zorder=3)
ax.axhline(2000, color="k", ls=":", lw=0.8); ax.text(30, 2300, "BatchTimeout = 2 s", fontsize=7, ha="center")
xticks(ax, A.clients, lambda x: str(int(x))); ax.set_yscale("log"); ax.set_ylim(15, 5000)
ax.set_xlabel("Concurrent closed-loop clients, N"); ax.set_ylabel("Commit latency (ms, log scale)")
ax.grid(alpha=0.3); ax.legend(loc="lower left"); f.tight_layout(); f.savefig(os.path.join(OUT, "fig4_latency_vs_clients.png"), dpi=300); plt.close(f)

x = Bt.batch_timeout_s.values
f, ax = plt.subplots(figsize=(W, H))
ax.errorbar(x, Bt.lat_mean_ms, yerr=err(Bt, "lat_mean_ms", "lat_mean_ci_lo", "lat_mean_ci_hi"), marker="o", ms=4, capsize=3, lw=1.2, label="Mean")
ax.errorbar(x, Bt.lat_p95_ms, yerr=err(Bt, "lat_p95_ms", "lat_p95_ci_lo", "lat_p95_ci_hi"), marker="s", ms=4, capsize=3, lw=1.2, label="P95")
ax.plot(x, x * 1000, "k:", lw=0.8, label="Latency if blocks were\ncut by BatchTimeout")
xticks(ax, x); ax.set_yscale("log"); ax.set_ylim(20, 8000)
ax.set_xlabel("BatchTimeout (s)"); ax.set_ylabel("Commit latency (ms, log scale)")
ax.grid(alpha=0.3); ax.legend(loc="upper left"); f.tight_layout(); f.savefig(os.path.join(OUT, "fig5_latency_vs_batchtimeout.png"), dpi=300); plt.close(f)

f, ax = plt.subplots(figsize=(W, H))
ax.errorbar(x, Bt.tps, yerr=err(Bt, "tps", "tps_ci_lo", "tps_ci_hi"), marker="o", ms=4, capsize=3, lw=1.2, label="Measured (mean, 95% CI)")
ax.plot(x, Bt.little_tps, "k--", lw=0.8, label="N / mean latency")
xticks(ax, x); ax.set_ylim(0, 250)
ax.set_xlabel("BatchTimeout (s)"); ax.set_ylabel("Throughput (TPS)")
ax.grid(alpha=0.3); ax.legend(loc="lower left"); f.tight_layout(); f.savefig(os.path.join(OUT, "fig6_throughput_vs_batchtimeout.png"), dpi=300); plt.close(f)
print("figures and summary.csv written to", OUT)
