export interface RecordMeta {
  recordId: string;
  patientPseudoId: string;
  ownerOrgId: string;
  recordType: string;
  contentType: string;
  objectUri: string;
  cipherHash: string;
  createdAt: string;
  version: number;
}

export interface RecordQuery {
  patientPseudoId: string;
  recordTypes?: string[];
  from?: string;
  to?: string;
}

export interface ConsentPolicy {
  policyId: string;
  patientPseudoId: string;
  granteeOrgId: string;
  recordTypes: string[];
  purpose: string[];
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'REVOKED' | 'DECLINED' | 'EXPIRED';
}

export interface AccessCheckInput {
  patientPseudoId: string;
  granteeOrgId: string;
  recordType: string;
  recordTime: string;
  purpose: string;
}

export interface AccessLogEntry {
  eventId: string;
  recordId: string;
  patientPseudoId: string;
  requesterOrgId: string;
  purpose: string;
  outcome: 'ALLOW' | 'DENY';
  at: string;
}

export interface FabricGatewayPort {
  registerRecord(meta: RecordMeta): Promise<{ txId: string }>;
  getRecord(recordId: string): Promise<RecordMeta | null>;
  queryRecordsByScope(scope: RecordQuery): Promise<RecordMeta[]>;
  grantConsent(policy: ConsentPolicy): Promise<{ txId: string }>;
  revokeConsent(policyId: string): Promise<{ txId: string }>;
  checkAccess(input: AccessCheckInput): Promise<{ allowed: boolean; policyId?: string }>;
  logAccess(entry: AccessLogEntry): Promise<{ txId: string }>;
}

export const FABRIC_GATEWAY = Symbol('FABRIC_GATEWAY');
