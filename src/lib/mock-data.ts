import type { RecordMeta, ConsentPolicy, AccessLogEntry, LedgerEvent, Organization, User } from "@/types/medical";

export const mockUser: User = {
  id: "pat-001",
  name: "Sarah Chen",
  email: "sarah.chen@email.com",
  role: "patient",
};

export const mockUsers: Record<string, User> = {
  patient: { id: "pat-001", name: "Sarah Chen", email: "sarah.chen@email.com", role: "patient" },
  provider: { id: "prov-001", name: "Dr. James Wilson", email: "j.wilson@mercy.org", role: "provider", orgId: "org-001", orgName: "Mercy General Hospital" },
  consumer: { id: "con-001", name: "Dr. Lisa Park", email: "l.park@metro.org", role: "consumer", orgId: "org-002", orgName: "Metro Health Network" },
  regulator: { id: "reg-001", name: "Robert Hayes", email: "r.hayes@hhs.gov", role: "regulator", orgId: "org-003", orgName: "Health Oversight Agency" },
  admin: { id: "adm-001", name: "System Admin", email: "admin@medchain.io", role: "admin" },
};

export const mockOrganizations: Organization[] = [
  { id: "org-001", name: "Mercy General Hospital", type: "hospital", verified: true, node_status: "active" },
  { id: "org-002", name: "Metro Health Network", type: "clinic", verified: true, node_status: "active" },
  { id: "org-003", name: "Health Oversight Agency", type: "regulator", verified: true, node_status: "active" },
  { id: "org-004", name: "BioGenomics Lab", type: "lab", verified: true, node_status: "syncing" },
  { id: "org-005", name: "CareFirst Insurance", type: "insurer", verified: false, node_status: "offline" },
  { id: "org-006", name: "City Medical Center", type: "hospital", verified: true, node_status: "active" },
  { id: "org-007", name: "National Research Institute", type: "research", verified: true, node_status: "active" },
];

export const mockRecords: RecordMeta[] = [
  {
    record_id: "rec-a1b2c3", patient_id: "pat-001", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "lab_result", title: "Complete Blood Count (CBC)", created_at: "2025-12-15T09:30:00Z",
    hash_offchain: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    uri_offchain: "ipfs://QmXk8fLc...", status: "COMMITTED", fhir_resource: "DiagnosticReport", tags: ["routine", "annual"],
  },
  {
    record_id: "rec-d4e5f6", patient_id: "pat-001", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "imaging", title: "Chest X-Ray (PA/Lateral)", created_at: "2025-11-28T14:15:00Z",
    hash_offchain: "sha256:7d793037a0760186574b0282f2f435e7cee592c2e6cd23e9c04f1a3",
    uri_offchain: "ipfs://QmYp9dHn...", status: "COMMITTED", fhir_resource: "ImagingStudy", tags: ["emergency"],
  },
  {
    record_id: "rec-g7h8i9", patient_id: "pat-001", owner_id: "prov-002", owner_org: "Metro Health Network",
    type: "clinical_note", title: "Follow-up Consultation Note", created_at: "2026-01-10T11:00:00Z",
    hash_offchain: "sha256:abc123def456789abc123def456789abc123def456789abc12",
    uri_offchain: "ipfs://QmZr7eFp...", status: "COMMITTED", fhir_resource: "DocumentReference",
  },
  {
    record_id: "rec-j1k2l3", patient_id: "pat-001", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "prescription", title: "Lisinopril 10mg Daily", created_at: "2026-02-01T16:45:00Z",
    hash_offchain: "sha256:def789ghi012345def789ghi012345def789ghi012345def78",
    uri_offchain: "ipfs://QmAb3cDe...", status: "PENDING_ENDORSEMENT", fhir_resource: "MedicationRequest",
  },
  {
    record_id: "rec-m4n5o6", patient_id: "pat-001", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "immunization", title: "COVID-19 Booster (Moderna)", created_at: "2026-02-20T10:00:00Z",
    hash_offchain: "sha256:999888777666555444333222111000999888777666555444",
    uri_offchain: "ipfs://QmFg4hIj...", status: "COMMITTED", fhir_resource: "Immunization", tags: ["vaccination"],
  },
  {
    record_id: "rec-p7q8r9", patient_id: "pat-002", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "lab_result", title: "Lipid Panel", created_at: "2026-02-18T08:00:00Z",
    hash_offchain: "sha256:aabbccdd11223344aabbccdd11223344aabbccdd11223344",
    uri_offchain: "ipfs://QmLm5nOp...", status: "COMMITTED", fhir_resource: "DiagnosticReport",
  },
  {
    record_id: "rec-s1t2u3", patient_id: "pat-002", owner_id: "prov-001", owner_org: "Mercy General Hospital",
    type: "allergy_list", title: "Allergy & Intolerance List", created_at: "2026-01-05T12:00:00Z",
    hash_offchain: "sha256:eeff0011eeff0011eeff0011eeff0011eeff0011eeff0011",
    uri_offchain: "ipfs://QmAl9bCd...", status: "COMMITTED", fhir_resource: "AllergyIntolerance",
  },
];

export const mockConsents: ConsentPolicy[] = [
  {
    policy_id: "cns-001", patient_id: "pat-001", grantee_id: "org-002", grantee_org: "Metro Health Network",
    data_scope: { types: ["lab_result", "clinical_note"], from: "2025-01-01", to: "2026-06-30" },
    purpose: "Continuity of care — referral follow-up",
    valid_from: "2025-06-01T00:00:00Z", valid_to: "2026-06-30T23:59:59Z", status: "ACTIVE", created_at: "2025-06-01T10:00:00Z",
  },
  {
    policy_id: "cns-002", patient_id: "pat-001", grantee_id: "org-004", grantee_org: "BioGenomics Lab",
    data_scope: { types: ["lab_result"] },
    purpose: "Genomic research study participation",
    valid_from: "2025-09-15T00:00:00Z", valid_to: "2026-03-15T23:59:59Z", status: "ACTIVE", created_at: "2025-09-15T08:00:00Z",
  },
  {
    policy_id: "cns-003", patient_id: "pat-001", grantee_id: "org-005", grantee_org: "CareFirst Insurance",
    data_scope: { types: ["discharge_summary", "prescription"] },
    purpose: "Claims processing",
    valid_from: "2025-03-01T00:00:00Z", valid_to: "2025-12-31T23:59:59Z", status: "EXPIRED", created_at: "2025-03-01T09:00:00Z",
  },
  {
    policy_id: "cns-004", patient_id: "pat-001", grantee_id: "org-002", grantee_org: "Metro Health Network",
    data_scope: { types: ["imaging"] },
    purpose: "Second opinion on chest imaging",
    valid_from: "2026-02-10T00:00:00Z", valid_to: "2026-04-10T23:59:59Z", status: "PENDING", created_at: "2026-02-10T14:00:00Z",
  },
  {
    policy_id: "cns-005", patient_id: "pat-001", grantee_id: "org-006", grantee_org: "City Medical Center",
    data_scope: { types: ["lab_result", "prescription"] },
    purpose: "Emergency department coordination",
    valid_from: "2026-01-01T00:00:00Z", valid_to: "2026-01-15T23:59:59Z", status: "REVOKED", created_at: "2026-01-01T00:00:00Z",
  },
];

export const mockAuditLog: AccessLogEntry[] = [
  { access_id: "acc-001", record_id: "rec-a1b2c3", record_title: "Complete Blood Count (CBC)", grantee_id: "org-002", grantee_org: "Metro Health Network", timestamp: "2026-02-20T14:30:00Z", purpose: "Referral follow-up", action: "VIEW", consent_id: "cns-001" },
  { access_id: "acc-002", record_id: "rec-g7h8i9", record_title: "Follow-up Consultation Note", grantee_id: "org-002", grantee_org: "Metro Health Network", timestamp: "2026-02-19T09:15:00Z", purpose: "Referral follow-up", action: "DOWNLOAD", consent_id: "cns-001" },
  { access_id: "acc-003", record_id: "rec-a1b2c3", record_title: "Complete Blood Count (CBC)", grantee_id: "org-004", grantee_org: "BioGenomics Lab", timestamp: "2026-02-18T11:00:00Z", purpose: "Research study", action: "VIEW", consent_id: "cns-002" },
  { access_id: "acc-004", record_id: "rec-d4e5f6", record_title: "Chest X-Ray (PA/Lateral)", grantee_id: "org-001", grantee_org: "Mercy General Hospital", timestamp: "2026-02-17T16:45:00Z", purpose: "Clinical review", action: "VERIFY" },
  { access_id: "acc-005", record_id: "rec-m4n5o6", record_title: "COVID-19 Booster (Moderna)", grantee_id: "org-001", grantee_org: "Mercy General Hospital", timestamp: "2026-02-15T10:30:00Z", purpose: "Vaccination record", action: "VIEW" },
  { access_id: "acc-006", record_id: "rec-a1b2c3", record_title: "Complete Blood Count (CBC)", grantee_id: "org-006", grantee_org: "City Medical Center", timestamp: "2026-02-14T02:15:00Z", purpose: "Emergency access", action: "VIEW", consent_id: "cns-005" },
  { access_id: "acc-007", record_id: "rec-j1k2l3", record_title: "Lisinopril 10mg Daily", grantee_id: "org-002", grantee_org: "Metro Health Network", timestamp: "2026-02-13T22:45:00Z", purpose: "Medication review", action: "DOWNLOAD" },
];

export const mockLedgerEvents: LedgerEvent[] = [
  { event_id: "evt-001", type: "RECORD_REGISTERED", actor: "Dr. James Wilson", actor_org: "Mercy General Hospital", target_id: "rec-m4n5o6", timestamp: "2026-02-20T10:00:00Z", description: "Immunization record registered on ledger", tx_hash: "0xabc123...def456", block_number: 48291 },
  { event_id: "evt-002", type: "ACCESS_LOGGED", actor: "Metro Health Network", actor_org: "Metro Health Network", target_id: "rec-a1b2c3", timestamp: "2026-02-20T14:30:00Z", description: "Lab result accessed under consent cns-001", tx_hash: "0x789abc...123def", block_number: 48295 },
  { event_id: "evt-003", type: "CONSENT_GRANTED", actor: "Sarah Chen", actor_org: "Patient", target_id: "cns-002", timestamp: "2025-09-15T08:00:00Z", description: "Consent granted to BioGenomics Lab for lab results", tx_hash: "0x456def...789abc", block_number: 42100 },
  { event_id: "evt-004", type: "CONSENT_REVOKED", actor: "Sarah Chen", actor_org: "Patient", target_id: "cns-003", timestamp: "2025-12-31T23:59:59Z", description: "Consent expired for CareFirst Insurance", tx_hash: "0xdef789...abc123", block_number: 46500 },
  { event_id: "evt-005", type: "RECORD_VERIFIED", actor: "System", actor_org: "MedChain", target_id: "rec-d4e5f6", timestamp: "2026-02-17T16:45:00Z", description: "Hash verification passed for Chest X-Ray", tx_hash: "0x123456...789abc", block_number: 47800 },
  { event_id: "evt-006", type: "RECORD_REGISTERED", actor: "Dr. James Wilson", actor_org: "Mercy General Hospital", target_id: "rec-j1k2l3", timestamp: "2026-02-01T16:45:00Z", description: "Prescription record submitted for endorsement", tx_hash: "0xfed987...654cba", block_number: 47200 },
];

// Extended mock data for patients list (provider view)
export interface MockPatient {
  id: string;
  pseudonym: string;
  localName?: string;
  recordCount: number;
  lastActivity: string;
}

export const mockPatients: MockPatient[] = [
  { id: "pat-001", pseudonym: "PAT-A7X9K2", localName: "Sarah Chen", recordCount: 5, lastActivity: "2026-02-20T10:00:00Z" },
  { id: "pat-002", pseudonym: "PAT-B3M8N1", localName: "Michael Torres", recordCount: 2, lastActivity: "2026-02-18T08:00:00Z" },
  { id: "pat-003", pseudonym: "PAT-C5P2Q7", recordCount: 0, lastActivity: "2026-01-15T14:30:00Z" },
  { id: "pat-004", pseudonym: "PAT-D9R4S6", localName: "Emily Watson", recordCount: 3, lastActivity: "2026-02-10T11:00:00Z" },
];

// Access requests (consumer → patient)
export interface AccessRequest {
  request_id: string;
  requester_org: string;
  requester_id: string;
  patient_id: string;
  patient_pseudonym: string;
  scope_types: string[];
  purpose: string;
  urgency: "routine" | "urgent" | "emergency";
  status: "pending" | "approved" | "denied" | "expired";
  created_at: string;
  resolved_at?: string;
}

export const mockAccessRequests: AccessRequest[] = [
  {
    request_id: "req-001", requester_org: "Metro Health Network", requester_id: "org-002",
    patient_id: "pat-001", patient_pseudonym: "PAT-A7X9K2",
    scope_types: ["imaging"], purpose: "Second opinion on chest imaging", urgency: "routine",
    status: "pending", created_at: "2026-02-10T14:00:00Z",
  },
  {
    request_id: "req-002", requester_org: "BioGenomics Lab", requester_id: "org-004",
    patient_id: "pat-001", patient_pseudonym: "PAT-A7X9K2",
    scope_types: ["lab_result"], purpose: "Genomic research — Phase II trial", urgency: "routine",
    status: "approved", created_at: "2025-09-10T08:00:00Z", resolved_at: "2025-09-15T08:00:00Z",
  },
  {
    request_id: "req-003", requester_org: "City Medical Center", requester_id: "org-006",
    patient_id: "pat-001", patient_pseudonym: "PAT-A7X9K2",
    scope_types: ["lab_result", "prescription"], purpose: "Emergency department coordination", urgency: "emergency",
    status: "denied", created_at: "2026-01-20T03:00:00Z", resolved_at: "2026-01-20T04:30:00Z",
  },
];

// Provider incoming requests (for mediation)
export interface ProviderRequest {
  request_id: string;
  consumer_org: string;
  patient_pseudonym: string;
  record_ids: string[];
  purpose: string;
  status: "pending_mediation" | "auto_approved" | "approved" | "denied";
  created_at: string;
}

export const mockProviderRequests: ProviderRequest[] = [
  { request_id: "preq-001", consumer_org: "Metro Health Network", patient_pseudonym: "PAT-A7X9K2", record_ids: ["rec-a1b2c3"], purpose: "Referral follow-up", status: "pending_mediation", created_at: "2026-02-22T09:00:00Z" },
  { request_id: "preq-002", consumer_org: "BioGenomics Lab", patient_pseudonym: "PAT-A7X9K2", record_ids: ["rec-a1b2c3", "rec-d4e5f6"], purpose: "Research study", status: "auto_approved", created_at: "2026-02-21T11:00:00Z" },
  { request_id: "preq-003", consumer_org: "CareFirst Insurance", patient_pseudonym: "PAT-B3M8N1", record_ids: ["rec-p7q8r9"], purpose: "Claims processing", status: "pending_mediation", created_at: "2026-02-20T15:00:00Z" },
];

// FHIR integration status
export interface IntegrationStatus {
  name: string;
  type: "fhir_gateway" | "queue" | "storage";
  status: "healthy" | "degraded" | "down";
  lastChecked: string;
  pending: number;
  failed: number;
}

export const mockIntegrations: IntegrationStatus[] = [
  { name: "FHIR R4 Gateway", type: "fhir_gateway", status: "healthy", lastChecked: "2026-02-25T12:00:00Z", pending: 0, failed: 0 },
  { name: "Message Queue", type: "queue", status: "healthy", lastChecked: "2026-02-25T12:00:00Z", pending: 3, failed: 0 },
  { name: "Off-chain Storage (IPFS)", type: "storage", status: "degraded", lastChecked: "2026-02-25T11:55:00Z", pending: 1, failed: 2 },
];

// Admin: mock admin users
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string;
  orgName: string;
  status: "active" | "suspended" | "invited";
  lastLogin?: string;
}

export const mockAdminUsers: AdminUser[] = [
  { id: "u-001", name: "Sarah Chen", email: "sarah.chen@email.com", role: "patient", orgId: "", orgName: "—", status: "active", lastLogin: "2026-02-25T08:00:00Z" },
  { id: "u-002", name: "Dr. James Wilson", email: "j.wilson@mercy.org", role: "provider", orgId: "org-001", orgName: "Mercy General Hospital", status: "active", lastLogin: "2026-02-25T07:30:00Z" },
  { id: "u-003", name: "Dr. Lisa Park", email: "l.park@metro.org", role: "consumer", orgId: "org-002", orgName: "Metro Health Network", status: "active", lastLogin: "2026-02-24T16:00:00Z" },
  { id: "u-004", name: "Robert Hayes", email: "r.hayes@hhs.gov", role: "regulator", orgId: "org-003", orgName: "Health Oversight Agency", status: "active", lastLogin: "2026-02-23T09:00:00Z" },
  { id: "u-005", name: "Pending User", email: "pending@citymedicine.org", role: "provider", orgId: "org-006", orgName: "City Medical Center", status: "invited" },
];

// Policy templates
export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  type: "retention" | "access" | "emergency";
  isDefault: boolean;
  rules: string[];
}

export const mockPolicyTemplates: PolicyTemplate[] = [
  { id: "pol-001", name: "Standard Retention", description: "Records retained for 7 years per regulatory requirement", type: "retention", isDefault: true, rules: ["Minimum 7-year retention", "Annual review required", "Immutable audit trail"] },
  { id: "pol-002", name: "Research Access", description: "Access template for approved research organizations", type: "access", isDefault: false, rules: ["IRB approval required", "De-identified data only", "Time-limited access (12 months max)"] },
  { id: "pol-003", name: "Emergency Override", description: "Break-glass access for emergency situations", type: "emergency", isDefault: true, rules: ["72-hour maximum duration", "Mandatory post-access audit", "Regulator notification within 24h", "Patient notification required"] },
  { id: "pol-004", name: "Insurance Claims", description: "Minimum disclosure for insurance claims processing", type: "access", isDefault: false, rules: ["Discharge summaries and billing only", "No clinical notes", "30-day access window"] },
];

// Share links
export interface ShareLink {
  id: string;
  scope_types: string[];
  purpose: string;
  expires_at: string;
  created_at: string;
  accessCount: number;
  active: boolean;
  isEmergency: boolean;
  url: string;
}

export const mockShareLinks: ShareLink[] = [
  { id: "shr-001", scope_types: ["lab_result"], purpose: "Share with specialist", expires_at: "2026-03-01T00:00:00Z", created_at: "2026-02-20T10:00:00Z", accessCount: 1, active: true, isEmergency: false, url: "https://medchain.io/s/abc123" },
  { id: "shr-002", scope_types: ["lab_result", "imaging", "prescription"], purpose: "Emergency access", expires_at: "2026-02-26T00:00:00Z", created_at: "2026-02-24T18:00:00Z", accessCount: 0, active: true, isEmergency: true, url: "https://medchain.io/s/def456" },
];
