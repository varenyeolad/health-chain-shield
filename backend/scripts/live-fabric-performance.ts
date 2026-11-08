/**
 * Research benchmark for committed Hyperledger Fabric record-registration transactions.
 *
 * Operates directly through the project's Fabric Gateway SDK adapter.
 * Counts only VALID commits; each request has a unique synthetic record ID.
 * Output is source evidence for this run, not a reproduction of paper results.
 *
 * Example:
 * FABRIC_MODE=fabric FABRIC_BENCH_LEVELS=1,2,5 FABRIC_BENCH_TX=10 FABRIC_BENCH_ROUNDS=1 \
 *   npx ts-node --transpile-only scripts/live-fabric-performance.ts
 */
import { createHash, randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { performance } from 'perf_hooks';
import { HyperledgerFabricGateway } from '../src/fabric/gateway/hyperledger-fabric.gateway';
import type { RecordMeta } from '../src/fabric/gateway/fabric-gateway.port';

type Sample = { index: number; committed: boolean; latencyMs: number; txId?: string; error?: string };
type Round = {
  concurrency: number; round: number; attempted: number; committed: number; failed: number;
  wallTimeMs: number; tps: number; successRate: number; meanLatencyMs: number | null;
  p95LatencyMs: number | null; samples: Sample[];
};

const numberEnv = (key: string, defaultValue: number): number => {
  const raw = process.env[key];
  const value = raw === undefined ? defaultValue : Number(raw);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid integer: ' + key);
  return value;
};
const nearestRank = (xs: number[], proportion: number): number | null => {
  if (!xs.length) return null;
  const values = [...xs].sort((a, b) => a - b);
  return values[Math.max(0, Math.ceil(values.length * proportion) - 1)];
};
const mean = (xs: number[]): number | null => xs.length ? xs.reduce((sum, n) => sum + n, 0) / xs.length : null;
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function main() {
  if (process.env.FABRIC_MODE !== 'fabric') throw new Error('FABRIC_MODE=fabric required');
  const counts = numberEnv('FABRIC_BENCH_TX', 10);
  const rounds = numberEnv('FABRIC_BENCH_ROUNDS', 1);
  const cooldownMs = numberEnv('FABRIC_BENCH_COOLDOWN_MS', 0);
  const levels = (process.env.FABRIC_BENCH_LEVELS || '1,2,5').split(',').map(s => Number(s.trim()));
  if (!counts || !rounds || !levels.length || levels.some(v => !Number.isSafeInteger(v) || v < 1 || v > 100)) {
    throw new Error('FABRIC_BENCH_TX, FABRIC_BENCH_ROUNDS and concurrency levels must be positive');
  }
  if (counts > 10000 || rounds > 100) throw new Error('Use explicit resource limits: max 10000 transactions per round, max 100 rounds');

  const prefix = 'perf-' + randomUUID();
  const gateway = new HyperledgerFabricGateway();
  const output: Round[] = [];

  try {
    for (const concurrency of levels) {
      for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
        const samples: Sample[] = new Array(counts);
        let next = 0;
        const started = performance.now();

        const worker = async () => {
          while (true) {
            const index = next++;
            if (index >= counts) break;
            const recordId = [prefix, concurrency, roundIndex, index].join('-');
            const meta: RecordMeta = {
              recordId,
              patientPseudoId: 'synthetic-benchmark-patient',
              ownerOrgId: process.env.FABRIC_MSP_ID || 'Org1MSP',
              recordType: 'DiagnosticReport',
              contentType: 'application/fhir+json',
              objectUri: 's3://synthetic-benchmark/' + recordId,
              cipherHash: createHash('sha256').update(recordId).digest('hex'),
              createdAt: new Date().toISOString(),
              version: 1,
            };
            const begin = performance.now();
            try {
              // The SDK adapter checks commit status, including invalid commit codes.
              const result = await gateway.registerRecord(meta);
              if (!/^[a-f0-9]{64}$/i.test(result.txId)) throw new Error('Unexpected Fabric transaction ID');
              samples[index] = { index, committed: true, txId: result.txId, latencyMs: performance.now() - begin };
            } catch (err) {
              samples[index] = {
                index, committed: false, latencyMs: performance.now() - begin,
                error: err instanceof Error ? err.message : String(err),
              };
            }
          }
        };

        await Promise.all(Array.from({ length: Math.min(concurrency, counts) }, worker));
        const wallTimeMs = performance.now() - started;
        const good = samples.filter(s => s.committed);
        const latencies = good.map(s => s.latencyMs);
        const measurement: Round = {
          concurrency, round: roundIndex + 1, attempted: counts, committed: good.length,
          failed: counts - good.length, wallTimeMs,
          tps: good.length / (wallTimeMs / 1000),
          successRate: good.length / counts,
          meanLatencyMs: mean(latencies), p95LatencyMs: nearestRank(latencies, .95), samples,
        };
        output.push(measurement);
        console.log(JSON.stringify({
          concurrency, round: measurement.round, committed: measurement.committed, failed: measurement.failed,
          tps: measurement.tps, meanLatencyMs: measurement.meanLatencyMs, p95LatencyMs: measurement.p95LatencyMs,
        }));
        if (roundIndex < rounds - 1 && cooldownMs) await delay(cooldownMs);
      }
    }
  } finally {
    gateway.onModuleDestroy();

    // Save even a failed run for diagnosis. Do not include enrollment credentials in artifacts.
    const folder = process.env.FABRIC_BENCH_OUTPUT || '../benchmarks/results';
    mkdirSync(folder, { recursive: true });
    const aggregated = levels.map(concurrency => {
      const group = output.filter(r => r.concurrency === concurrency);
      const samples = group.flatMap(r => r.samples);
      const commits = samples.filter(s => s.committed);
      const durations = commits.map(s => s.latencyMs);
      const totalTimeMs = group.reduce((sum, r) => sum + r.wallTimeMs, 0);
      return {
        concurrency, attempted: samples.length, committed: commits.length,
        failed: samples.length - commits.length,
        successRate: samples.length ? commits.length / samples.length : 0,
        throughputTps: totalTimeMs ? commits.length / (totalTimeMs / 1000) : null,
        meanCommitLatencyMs: mean(durations), p95CommitLatencyMs: nearestRank(durations, .95),
      };
    });
    const report = {
      schemaVersion: 1, workload: 'RegistryContract:RegisterRecord', timestamp: new Date().toISOString(),
      environment: 'GitHub Actions or local Fabric 2.5 test network',
      declaredFabricVersion: process.env.FABRIC_VERSION || 'not recorded',
      experimentalLabel: process.env.FABRIC_BENCH_LABEL || 'uncontrolled-test-network',
      gitSha: process.env.GITHUB_SHA || 'local-unrecorded',
      evidence: 'Measured committed transactions only; NOT paper reproduction or Caliper results',
      parameters: { concurrencyLevels: levels, transactionsPerRound: counts, rounds, cooldownMs },
      summary: aggregated, roundsDetail: output,
    };
    writeFileSync(folder + '/fabric-live-' + prefix + '.json', JSON.stringify(report, null, 2) + '\n');
    const rows = [['concurrency','round','index','committed','latency_ms','tx_id','error'].join(',')];
    const csv = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""').replace(/[\r\n]/g, ' ') + '"';
    for (const item of output) for (const sample of item.samples) {
      rows.push([item.concurrency,item.round,sample.index,sample.committed,sample.latencyMs,sample.txId,sample.error].map(csv).join(','));
    }
    writeFileSync(folder + '/fabric-live-' + prefix + '.csv', rows.join('\n') + '\n');
    console.log('Results saved to ' + folder);
  }
  if (output.length !== levels.length * rounds || output.some(x => x.failed)) {
    throw new Error('Fabric benchmark did not commit all transactions: inspect preserved raw results');
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
