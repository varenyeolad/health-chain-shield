import { validateFhirResource } from './fhir-validation';

describe('FHIR R4 structural screening', () => {
  it('accepts a minimal synthetic diagnostic report', () => {
    expect(validateFhirResource({
      resourceType: 'DiagnosticReport', id: 'synthetic-1', status: 'final',
      subject: { reference: 'Patient/synthetic-1' }
    }).valid).toBe(true);
  });
  it('rejects missing subject', () => {
    const result = validateFhirResource({ resourceType: 'Observation', status: 'final' });
    expect(result.valid).toBe(false);
    expect(result.issues).toContain('Expected a subject/patient Reference');
  });
  it('rejects unknown resource types and malformed identifiers', () => {
    const result = validateFhirResource({ resourceType: 'NonFHIR', id: 'bad id!' });
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(2);
  });
  it('rejects non-object payloads', () => {
    expect(validateFhirResource(null).valid).toBe(false);
  });
});
