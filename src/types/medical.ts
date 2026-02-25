export type UserRole = "patient" | "provider" | "consumer" | "regulator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;
  orgName?: string;
  avatar?: string;
}

export interface RecordMeta {
  record_id: string;
  patient_id: string;
  owner_id: string;
  owner_org: string;
  type: RecordType;
  title: string;
  created_at: string;
  hash_offchain: string;
  uri_offchain: string;
  status: RecordStatus;
  fhir_resource?: string;
  tags?: string[];
}

export type RecordType =
  | "lab_result"
  | "imaging"
  | "clinical_note"
  | "prescription"
  | "discharge_summary"
  | "referral"
  | "immunization"
  | "allergy_list";

export type RecordStatus =
  | "DRAFT"
  | "PENDING_ENDORSEMENT"
  | "ORDERED"
  | "COMMITTED"
  | "FAILED";

export interface ConsentPolicy {
  policy_id: string;
  patient_id: string;
  grantee_id: string;
  grantee_org: string;
  data_scope: {
    types: RecordType[];
    from?: string;
    to?: string;
  };
  purpose: string;
  valid_from: string;
  valid_to: string;
  status: ConsentStatus;
  created_at: string;
}

export type ConsentStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "PENDING";

export interface AccessLogEntry {
  access_id: string;
  record_id: string;
  record_title: string;
  grantee_id: string;
  grantee_org: string;
  timestamp: string;
  purpose: string;
  action: "VIEW" | "DOWNLOAD" | "VERIFY" | "SHARE";
  consent_id?: string;
}

export interface LedgerEvent {
  event_id: string;
  type: "RECORD_REGISTERED" | "CONSENT_GRANTED" | "CONSENT_REVOKED" | "ACCESS_LOGGED" | "RECORD_VERIFIED";
  actor: string;
  actor_org: string;
  target_id: string;
  timestamp: string;
  description: string;
  tx_hash: string;
  block_number: number;
}

export interface Organization {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "lab" | "insurer" | "research" | "regulator";
  verified: boolean;
  node_status?: "active" | "syncing" | "offline";
}

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  lab_result: "Lab Result",
  imaging: "Imaging",
  clinical_note: "Clinical Note",
  prescription: "Prescription",
  discharge_summary: "Discharge Summary",
  referral: "Referral",
  immunization: "Immunization",
  allergy_list: "Allergy List",
};

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
  ACTIVE: "Active",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
  PENDING: "Pending",
};
