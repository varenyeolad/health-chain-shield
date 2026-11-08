import { randomUUID, createHash } from 'node:crypto';

// The mock driver is intended ONLY for smoke testing harness calculations.
export function createMockDriver() {
  const records = new Map();
  return {
    kind: 'mock',
    async register(record) {
      if (records.has(record.recordId)) throw new Error('duplicate ID');
      const txId = 'mock-' + randomUUID();
      records.set(record.recordId, { ...record, txId });
      return { committed: true, txId };
    },
    async read(recordId) { return records.get(recordId) ?? null; },
  };
}

// Real performance figures require a separately deployed, authenticated Fabric-backed
// bridge that waits for the commit status before returning. An HTTP 200 alone is not proof.
export function createHttpDriver({ url, token, timeoutMs = 30000 }) {
  if (!url) throw new Error('BENCHMARK_URL is required for BENCHMARK_DRIVER=http');
  const base = url.replace(/\/$/, '');
  if (!/^https?:\/\//.test(base)) throw new Error('BENCHMARK_URL must be an http(s) URL');
  async function request(path, options = {}) {
    const response = await fetch(base + path, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers },
    });
    if (!response.ok) throw new Error('HTTP ' + response.status + ' ' + (await response.text()).slice(0, 200));
    return response.json();
  }
  return {
    kind: 'http',
    async register(record) {
      const value = await request('/benchmarks/register-record', { method: 'POST', body: JSON.stringify(record) });
      if (value?.committed !== true || !value?.txId || value.txId.startsWith('mock-') || value.txId.startsWith('fabric-reg-'))
        throw new Error('Bridge did not prove a real commit; expected {committed:true,txId:<real transaction ID>}');
      return value;
    },
    async read(recordId) { return request('/benchmarks/records/' + encodeURIComponent(recordId)); },
  };
}

export function makeRecord(runId, round, index, payloadBytes = 350) {
  const recordId = [runId, round, index].join('-');
  return {
    recordId,
    patientPseudoId: 'patient-' + String(index % 1000).padStart(4, '0'),
    ownerOrgId: 'provider-org-1',
    recordType: 'DiagnosticReport',
    contentType: 'application/fhir+json',
    objectUri: 's3://synthetic-records/' + recordId,
    cipherHash: createHash('sha256').update(recordId).digest('hex'),
    createdAt: new Date().toISOString(),
    version: 1,
    syntheticPayloadBytes: payloadBytes,
  };
}
