import { performance } from 'node:perf_hooks';

export const DEFAULT_ROUNDS = 10;
export const DEFAULT_TRANSACTIONS = 100;
export const DEFAULT_COOLDOWN_MS = 3000;

export function percentile(values, fraction) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const index = Math.ceil(fraction * ordered.length) - 1;
  return ordered[Math.max(0, index)];
}

export function summarize(samples, elapsedMs) {
  const successes = samples.filter(x => x.ok);
  const durations = successes.map(x => x.latencyMs);
  return {
    attempted: samples.length,
    succeeded: successes.length,
    failed: samples.length - successes.length,
    successRatePercent: samples.length ? 100 * successes.length / samples.length : 0,
    throughputTps: elapsedMs > 0 ? 1000 * successes.length / elapsedMs : 0,
    meanLatencyMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    p95LatencyMs: percentile(durations, .95),
    minLatencyMs: durations.length ? Math.min(...durations) : null,
    maxLatencyMs: durations.length ? Math.max(...durations) : null,
    elapsedMs,
  };
}

export async function runRound({ submit, count, concurrency, payloadFactory }) {
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(concurrency) || concurrency < 1) throw new Error('count and concurrency must be positive integers');
  const samples = new Array(count);
  let next = 0;
  const started = performance.now();
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= count) break;
      const start = performance.now();
      try {
        const response = await submit(payloadFactory(i));
        // A successful HTTP response is NOT sufficient: the adapter must confirm a committed transaction.
        if (!response?.committed || !response?.txId) throw new Error('No confirmed commit or transaction ID');
        samples[i] = { ok: true, latencyMs: performance.now() - start };
      } catch (error) {
        samples[i] = { ok: false, latencyMs: performance.now() - start, error: String(error?.message ?? error) };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(count, concurrency) }, () => worker()));
  return { ...summarize(samples, performance.now() - started), latenciesMs: samples.filter(x => x.ok).map(x => x.latencyMs), errors: samples.filter(x => !x.ok).slice(0, 10).map(x => x.error) };
}

export async function runExperiment({ submit, clients, rounds = DEFAULT_ROUNDS, count = DEFAULT_TRANSACTIONS, cooldownMs = DEFAULT_COOLDOWN_MS, payloadFactory }) {
  const results = [];
  for (let round = 0; round < rounds; round++) {
    results.push(await runRound({ submit, count, concurrency: clients, payloadFactory: index => payloadFactory(round, index) }));
    if (round < rounds - 1 && cooldownMs) await new Promise(resolve => setTimeout(resolve, cooldownMs));
  }
  const avg = key => results.reduce((sum, row) => sum + (row[key] ?? 0), 0) / results.length;
  const attempted = results.reduce((s, r) => s + r.attempted, 0);
  const succeeded = results.reduce((s, r) => s + r.succeeded, 0);
  const latencies = results.flatMap(r => r.latenciesMs);
  const totalMeasuredSeconds = results.reduce((s, r) => s + r.elapsedMs, 0) / 1000;
  return {
    clients, rounds, transactionsPerRound: count, cooldownMs, attempted, succeeded, failed: attempted - succeeded,
    successRatePercent: attempted ? 100 * succeeded / attempted : 0,
    meanThroughputTps: avg('throughputTps'),
    overallThroughputTps: totalMeasuredSeconds > 0 ? succeeded / totalMeasuredSeconds : 0,
    meanCommitLatencyMs: latencies.length ? latencies.reduce((s, x) => s + x, 0) / latencies.length : null,
    p95CommitLatencyMs: percentile(latencies, .95),
    roundsDetail: results,
  };
}
