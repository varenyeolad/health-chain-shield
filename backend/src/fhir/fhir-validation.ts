/** Lightweight structural checks for selected FHIR R4 resources.
 * This is not a substitute for full FHIR R4 terminology/profile validation.
 */
export const SUPPORTED_FHIR_RESOURCES = [
  'Patient', 'Observation', 'DiagnosticReport', 'DocumentReference', 'ImagingStudy',
  'MedicationRequest', 'Immunization', 'AllergyIntolerance',
] as const;

export interface FhirValidationResult {
  valid: boolean;
  resourceType: string;
  issues: string[];
}

export function validateFhirResource(value: unknown): FhirValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, resourceType: 'Unknown', issues: ['Expected a FHIR JSON resource object'] };
  }
  const record = value as Record<string, unknown>;
  const resourceType = typeof record.resourceType === 'string' ? record.resourceType : 'Unknown';
  const issues: string[] = [];
  if (!SUPPORTED_FHIR_RESOURCES.includes(resourceType as typeof SUPPORTED_FHIR_RESOURCES[number])) {
    issues.push('Unsupported FHIR R4 resourceType');
  }
  if (record.id !== undefined && (typeof record.id !== 'string' || !/^[A-Za-z0-9\-.]{1,64}$/.test(record.id))) {
    issues.push('Resource id must be a valid FHIR id');
  }
  if (resourceType === 'Patient' && !Array.isArray(record.name) && !Array.isArray(record.identifier)) {
    issues.push('Patient requires a name or identifier for this project profile');
  }
  const subjectResources = ['Observation', 'DiagnosticReport', 'ImagingStudy', 'MedicationRequest', 'Immunization'];
  if (subjectResources.includes(resourceType)) {
    const subject = record.subject ?? record.patient;
    if (!subject || typeof subject !== 'object' || typeof (subject as Record<string, unknown>).reference !== 'string') {
      issues.push('Expected a subject/patient Reference');
    }
  }
  if (['Observation', 'DiagnosticReport', 'MedicationRequest', 'Immunization'].includes(resourceType) && typeof record.status !== 'string') {
    issues.push('Resource status is required');
  }
  if (resourceType === 'DocumentReference' && typeof record.status !== 'string') {
    issues.push('DocumentReference.status is required');
  }
  return { valid: issues.length === 0, resourceType, issues };
}
