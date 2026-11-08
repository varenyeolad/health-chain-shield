#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createHttpDriver, createMockDriver, makeRecord } from './drivers.mjs';
import { runExperiment } from './lib.mjs';

const flags = Object.fromEntries(process.argv.slice(2).map(s => {
  const [key, value] = s.replace(/^--/, '').split('=');
  return [key, value ?? true];
}));
const mode = flags.experiment ?? 'baseline';
const driverName = flags.driver ?? process.env.BENCHMARK_DRIVER ?? 'mock';
const rounds = Number(flags.rounds ?? 10);
const count = Number(flags.count ?? 100);
const cooldownMs = Number(flags.cooldown ?? 3000);
const concurrencyLevels = [1, 2, 5, 10, 20, 50];
const batchTimeouts = [100, 500, 1000, 2000, 5000];

if (!['baseline', 'concurrency', 'batch'].includes(mode)) throw new Error('Experiment must be baseline|concurrency|batch');
if (!Number.isInteger(rounds) || rounds < 1 || !Number.isInteger(count) || count < 1 || !Number.isFinite(cooldownMs) || cooldownMs < 0) throw new Error('Invalid rounds/count/cooldown');
if (!['mock', 'http'].includes(driverName)) throw new Error('Driver must be mock|http');
const driver = driverName === 'http' ? createHttpDriver({ url: process.env.BENCHMARK_URL, token: process.env.BENCHMARK_TOKEN }) : createMockDriver();
const runId = randomUUID();
const configurations = mode === 'concurrency'
  ? concurrencyLevels.map(clients => ({ clients }))
  : mode === 'batch'
    ? [{ clients: 10, batchTimeoutMs: Number(flags['batch-timeout'] ?? process.env.BENCHMARK_BATCH_TIMEOUT_MS) }]
    : [{ clients: 10 }];
if (mode === 'batch' && !batchTimeouts.includes(configurations[0].batchTimeoutMs))
  throw new Error('Set --batch-timeout to one of 100,500,1000,2000,5000; change the real orderer configuration externally before this run');

const measurements = [];
for (const config of configurations) {
  const result = await runExperiment({
    submit: record => driver.register(record),
    clients: config.clients, rounds, count, cooldownMs,
    payloadFactory: (round, index) => makeRecord(runId, round, index),
  });
  measurements.push({ ...config, ...result });
  console.log(JSON.stringify({ driver: driverName, experiment: mode, clients: config.clients, batchTimeoutMs: config.batchTimeoutMs ?? null, meanThroughputTps: result.meanThroughputTps, meanCommitLatencyMs: result.meanCommitLatencyMs, p95CommitLatencyMs: result.p95CommitLatencyMs, successRatePercent: result.successRatePercent }, null, 2));
}
const output = {
  schemaVersion: 1,
  runId, timestamp: new Date().toISOString(),
  experiment: mode, driver: driverName,
  evidence: driverName === 'mock' ? 'SIMULATED — NOT FABRIC PERFORMANCE EVIDENCE' : 'HTTP BRIDGE REPORTED COMMITS — VERIFY BRIDGE AND NETWORK CONFIGURATION',
  nodeVersion: process.version,
  configuration: { rounds, count, cooldownMs, offeredClients: concurrencyLevels, definedBatchTimeoutsMs: batchTimeouts },
  measurements,
};
await mkdir('benchmarks/results', { recursive: true });
const file = 'benchmarks/results/' + runId + '.json';
await writeFile(file, JSON.stringify(output, null, 2) + '\n');
console.log('Wrote ' + file);
