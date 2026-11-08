import { MockFabricGateway } from './mock-fabric.gateway';
import type { ConsentPolicy, RecordMeta } from './fabric-gateway.port';

const consent: ConsentPolicy = {
  policyId: 'consent-1',
  patientPseudoId: 'patient-1',
  granteeOrgId: 'hospital-2',
  recordTypes: ['DiagnosticReport'],
  purpose: ['treatment'],
  validFrom: '2026-01-01T00:00:00Z',
  validTo: '2026-12-31T23:59:59Z',
  status: 'ACTIVE',
};
const req = {
  patientPseudoId: 'patient-1',
  granteeOrgId: 'hospital-2',
  recordType: 'DiagnosticReport',
  purpose: 'treatment',
  recordTime: '2026-06-01T12:00:00Z',
};
describe('MockFabricGateway — functional simulation only (not real chaincode)', () => {
  let gateway: MockFabricGateway;
  beforeEach(() => { gateway = new MockFabricGateway(); });
  it('registers synthetic metadata and queries it', async () => {
    const metadata: RecordMeta = {
      recordId: 'r1', patientPseudoId: 'patient-1', ownerOrgId: 'hospital-1',
      recordType: 'DiagnosticReport', contentType: 'application/fhir+json',
      objectUri: 's3://synthetic/r1', cipherHash: 'fake-test-hash', createdAt: req.recordTime, version: 1,
    };
    await gateway.registerRecord(metadata);
    expect(await gateway.getRecord('r1')).toEqual(metadata);
    expect(await gateway.queryRecordsByScope({ patientPseudoId: 'patient-1', recordTypes: ['DiagnosticReport'] })).toHaveLength(1);
    expect(await gateway.queryRecordsByScope({ patientPseudoId: 'someone-else' })).toHaveLength(0);
  });
  it('denies access when no consent exists', async () => {
    expect((await gateway.checkAccess(req)).allowed).toBe(false);
  });
  it('allows matching active consent, denies different purpose or grantee', async () => {
    await gateway.grantConsent({ ...consent });
    expect((await gateway.checkAccess(req)).allowed).toBe(true);
    expect((await gateway.checkAccess({ ...req, purpose: 'insurance' })).allowed).toBe(false);
    expect((await gateway.checkAccess({ ...req, granteeOrgId: 'unauthorized' })).allowed).toBe(false);
  });
  it('rejects expired or not-yet-valid consent', async () => {
    await gateway.grantConsent({ ...consent });
    expect((await gateway.checkAccess({ ...req, recordTime: '2027-01-01T00:00:00Z' })).allowed).toBe(false);
    expect((await gateway.checkAccess({ ...req, recordTime: '2025-12-31T23:59:59Z' })).allowed).toBe(false);
  });
  it('rejects access after revocation', async () => {
    await gateway.grantConsent({ ...consent });
    await gateway.revokeConsent(consent.policyId);
    expect((await gateway.checkAccess(req)).allowed).toBe(false);
  });
  it('accepts a synthetic audit entry', async () => {
    const result = await gateway.logAccess({
      eventId: 'event-1', recordId: 'r1', patientPseudoId: 'patient-1',
      requesterOrgId: 'hospital-2', purpose: 'treatment', outcome: 'ALLOW', at: req.recordTime,
    });
    expect(result.txId).toMatch(/^mock-audit-/);
  });
});
