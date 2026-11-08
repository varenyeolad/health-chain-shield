#!/usr/bin/env node
/**
 * Validate Hyperledger Caliper's final result table independently of Caliper CLI exit status.
 * Caliper can report successful rounds despite failed or missing transactions.
 *
 * node check-report.mjs <benchmark.yaml> <caliper.log>
 */
import { readFileSync } from 'node:fs';

export function expectedRounds(config) {
  const entries = [...config.matchAll(/^\s*- label:\s*(\S+)\s*\r?\n\s*txNumber:\s*(\d+)\s*$/gm)];
  if (!entries.length) throw new Error('No labeled rounds with txNumber in workload configuration');
  return new Map(entries.map(x => [x[1], Number(x[2])]));
}

export function parseRows(log) {
  const rows = new Map();
  // Caliper outputs interim per-round tables and a final combined table; last occurrence wins.
  for (const line of log.split(/\r?\n/)) {
    const columns = line.split('|').map(s => s.trim());
    if (columns.length < 10 || columns[0] !== '') continue;
    const [label, succeeded, failed] = columns.slice(1, 4);
    if (!/^[a-z][a-z0-9-]*$/.test(label ?? '')) continue;
    if (!/^\d+$/.test(succeeded ?? '') || !/^\d+$/.test(failed ?? '')) continue;
    rows.set(label, { succeeded: Number(succeeded), failed: Number(failed) });
  }
  return rows;
}

export function validateCaliper(config, log) {
  if (!log.includes('Benchmark successfully finished!')) {
    throw new Error('Caliper did not report a successful benchmark finish');
  }
  const expected = expectedRounds(config);
  const reported = parseRows(log);
  const result = [];
  for (const [label, txNumber] of expected) {
    const observed = reported.get(label);
    if (!observed) throw new Error('Missing final Caliper result: ' + label);
    if (observed.failed > 0) {
      throw new Error('Caliper workload ' + label + ' had ' + observed.failed + ' FAILED transactions');
    }
    if (observed.succeeded !== txNumber) {
      throw new Error('Caliper workload ' + label + ' completed ' + observed.succeeded +
        ' of ' + txNumber + ' expected transactions (missing: ' + (txNumber - observed.succeeded) + ')');
    }
    result.push({ label, requested: txNumber, successful: observed.succeeded, failed: observed.failed });
  }
  return result;
}

if (process.argv[1]?.endsWith('/check-report.mjs') || process.argv[1] === 'check-report.mjs') {
  const [configPath, logPath] = process.argv.slice(2);
  if (!configPath || !logPath) {
    console.error('Usage: node check-report.mjs <benchmark.yaml> <caliper.log>');
    process.exitCode = 2;
  } else {
    try {
      const rows = validateCaliper(readFileSync(configPath, 'utf8'), readFileSync(logPath, 'utf8'));
      console.log(JSON.stringify({ caliperValid: true, rounds: rows }, null, 2));
    } catch (err) {
      console.error('Caliper validation failed:', err.message);
      process.exitCode = 1;
    }
  }
}
