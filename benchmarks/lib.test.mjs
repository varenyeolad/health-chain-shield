import test from 'node:test';
import assert from 'node:assert/strict';
import { percentile, summarize, runRound, runExperiment } from './lib.mjs';
import { createMockDriver, makeRecord } from './drivers.mjs';

test('p95 uses nearest-rank percentile', () => {
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], .95), 10);
  assert.equal(percentile([], .95), null);
});
test('throughput denominator is elapsed round time and failures are excluded', () => {
  const r = summarize([{ ok: true, latencyMs: 10 }, { ok: false, latencyMs: 12 }], 500);
  assert.equal(r.throughputTps, 2);
  assert.equal(r.successRatePercent, 50);
  assert.equal(r.meanLatencyMs, 10);
});
test('round executes exactly count distinct transactions with bounded concurrency', async () => {
  const driver = createMockDriver();
  let active = 0, peak = 0;
  const result = await runRound({
    count: 25, concurrency: 5,
    payloadFactory: i => makeRecord('test', 0, i),
    submit: async record => {
      active++; peak = Math.max(peak, active);
      try { await new Promise(resolve => setTimeout(resolve, 2)); return await driver.register(record); }
      finally { active--; }
    },
  });
  assert.equal(result.succeeded, 25);
  assert.equal(result.failed, 0);
  assert.ok(peak <= 5 && peak >= 2);
});
test('an uncommitted response is classified as failure', async () => {
  const result = await runRound({ count: 2, concurrency: 1, submit: async () => ({ txId: 'id', committed: false }), payloadFactory: i => i });
  assert.equal(result.failed, 2);
});
test('ten transactions across two rounds produce correct aggregate counts', async () => {
  const driver = createMockDriver();
  const result = await runExperiment({ submit: record => driver.register(record), clients: 2, rounds: 2, count: 5, cooldownMs: 0, payloadFactory: (r, i) => makeRecord('suite', r, i) });
  assert.equal(result.attempted, 10);
  assert.equal(result.succeeded, 10);
  assert.equal(result.roundsDetail.length, 2);
});
