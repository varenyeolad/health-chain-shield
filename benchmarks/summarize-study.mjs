#!/usr/bin/env node
/**
 * Convert verified live-network benchmark JSON into a publication-ready table,
 * without modifying raw measurements or substituting manuscript values.
 *
 * Example:
 *   node benchmarks/summarize-study.mjs benchmarks/results/fabric-live-*.json
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function readStudyReport(value, source = 'unknown') {
  if (!value || value.schemaVersion !== 1 || value.workload !== 'RegistryContract:RegisterRecord' || !Array.isArray(value.summary)) {
    throw new Error(source + ' is not an expected Fabric SDK measurement report');
  }
  if (value.evidence?.includes('SIMULATED') || value.environment?.includes('mock')) {
    throw new Error('Mock measurements are not valid study evidence: ' + source);
  }
  return value.summary.map(item => {
    const { concurrency, attempted, committed, failed, throughputTps, meanCommitLatencyMs, p95CommitLatencyMs } = item;
    if (![concurrency, attempted, committed, failed].every(Number.isInteger)) {
      throw new Error('Invalid counters in ' + source);
    }
    if (attempted !== committed + failed) throw new Error('Inconsistent transaction counts in ' + source);
    return {
      source, gitSha: value.gitSha || 'unknown',
      label: value.experimentalLabel || 'not specified',
      levels: value.parameters?.concurrencyLevels?.join(',') || 'unknown',
      rounds: value.parameters?.rounds ?? null,
      transactionsPerRound: value.parameters?.transactionsPerRound ?? null,
      concurrency, attempted, committed, failed,
      successPercent: attempted > 0 ? 100 * committed / attempted : null,
      tps: throughputTps,
      meanLatencyMs: meanCommitLatencyMs,
      p95LatencyMs: p95CommitLatencyMs,
    };
  });
}
const decimal = (value, n=2) => value === null || value === undefined ? '-' : Number(value).toFixed(n);
export function toMarkdown(rows) {
  return [
    '| Run | Clients | Tx committed / attempted | Success | TPS | Mean latency (ms) | P95 (ms) |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map(r => '| ' + [r.label + ' (' + r.gitSha.slice(0,8) + ')', r.concurrency,
      r.committed + ' / ' + r.attempted, decimal(r.successPercent,1) + '%',
      decimal(r.tps), decimal(r.meanLatencyMs), decimal(r.p95LatencyMs)].join(' | ') + ' |'),
  ].join('\n');
}
function cli() {
  const paths = process.argv.slice(2);
  if (!paths.length) throw new Error('Pass one or more actual fabric-live-*.json files as arguments');
  const rows = paths.flatMap(path => readStudyReport(JSON.parse(readFileSync(path, 'utf8')), path));
  console.log(toMarkdown(rows));
  const fullRows = rows.filter(r => r.transactionsPerRound === 100 && r.rounds === 10);
  console.error(JSON.stringify({
    verifiedReports: paths.length,
    studyShapeRows: fullRows.length,
    notice: 'Only reports matching 10x100 are study-shaped; hardware, channel settings and payload profile still require verification.',
  }));
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { cli(); } catch (error) { console.error(error); process.exitCode = 1; }
}
