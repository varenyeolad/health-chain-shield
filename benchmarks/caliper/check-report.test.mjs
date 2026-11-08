import test from 'node:test';
import assert from 'node:assert/strict';
import { expectedRounds, parseRows, validateCaliper } from './check-report.mjs';

const yaml = `test:
  rounds:
    - label: public-write
      txNumber: 100
      rateControl:
        type: fixed-rate
    - label: pdc-write
      txNumber: 6
`;
const log = `| Name         | Succ | Fail | Send Rate (TPS) | Max Latency (s) | Min Latency (s) | Avg Latency (s) | Throughput (TPS) |
| public-write | 100  | 0    | 10.0            | 0.4             | 0.01            | 0.2             | 10.0             |
| pdc-write    | 6    | 0    | 3.0             | 2.0             | 0.01            | 1.0             | 3.0              |
Benchmark successfully finished!`;
test('recognizes rounds and exact target counts', () => {
  assert.deepEqual([...expectedRounds(yaml).values()], [100, 6]);
  assert.equal(parseRows(log).get('public-write').succeeded,100);
  assert.equal(validateCaliper(yaml, log).length,2);
});
test('fails when Caliper drops submitted transactions but reports zero explicit failures', () => {
  const actual = log.replace('| 100  | 0', '| 96   | 0');
  assert.throws(()=>validateCaliper(yaml,actual), /96 of 100 expected/);
});
test('fails when private data endorsement is rejected', () => {
  const actual = log.replace('| 6    | 0', '| 0    | 6');
  assert.throws(()=>validateCaliper(yaml,actual), /FAILED transactions/);
});
test('fails when Caliper did not finish', () => {
  assert.throws(()=>validateCaliper(yaml, log.replace('Benchmark successfully finished!','')), /successful benchmark finish/);
});
