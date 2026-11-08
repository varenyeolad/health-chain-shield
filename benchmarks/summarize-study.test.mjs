import test from 'node:test';
import assert from 'node:assert/strict';
import { readStudyReport, toMarkdown } from './summarize-study.mjs';

const fixture = {
  schemaVersion: 1,
  workload: 'RegistryContract:RegisterRecord',
  evidence: 'Measured committed transactions only; NOT paper reproduction or Caliper results',
  gitSha: '0123456789abcdef',
  experimentalLabel: 'verified-orderer-batch-100ms',
  environment: 'GitHub Actions or local Fabric 2.5 test network',
  parameters: { concurrencyLevels:[10], rounds: 10, transactionsPerRound: 100 },
  summary: [{ concurrency:10, attempted:1000, committed:999, failed:1,
    throughputTps:5.55,meanCommitLatencyMs:315,p95CommitLatencyMs:1925 }],
};
test('preserves actual results rather than manuscript reference figures', () => {
  const [item] = readStudyReport(fixture);
  assert.equal(item.attempted, 1000);
  assert.equal(item.committed, 999);
  assert.equal(item.successPercent,99.9);
  assert.match(toMarkdown([item]), /5\.55/);
});
test('rejects mock and inconsistent transaction counters', () => {
  assert.throws(() => readStudyReport({...fixture,evidence:'SIMULATED'}), /Mock/);
  assert.throws(() => readStudyReport({...fixture,summary:[{...fixture.summary[0],failed:2}]}), /Inconsistent/);
});
