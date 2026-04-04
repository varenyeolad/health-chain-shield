import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  AccessCheckInput,
  AccessLogEntry,
  ConsentPolicy,
  FabricGatewayPort,
  RecordMeta,
  RecordQuery,
} from './fabric-gateway.port';

@Injectable()
export class MockFabricGateway implements FabricGatewayPort {
  private readonly records = new Map<string, RecordMeta>();
  private readonly consents = new Map<string, ConsentPolicy>();
  private readonly audit: AccessLogEntry[] = [];

  async registerRecord(meta: RecordMeta): Promise<{ txId: string }> {
    this.records.set(meta.recordId, meta);
    return { txId: `mock-reg-${uuidv4()}` };
  }

  async getRecord(recordId: string): Promise<RecordMeta | null> {
    return this.records.get(recordId) ?? null;
  }

  async queryRecordsByScope(scope: RecordQuery): Promise<RecordMeta[]> {
    return Array.from(this.records.values()).filter((item) => {
      if (item.patientPseudoId !== scope.patientPseudoId) return false;
      if (scope.recordTypes?.length && !scope.recordTypes.includes(item.recordType)) return false;
      return true;
    });
  }

  async grantConsent(policy: ConsentPolicy): Promise<{ txId: string }> {
    this.consents.set(policy.policyId, policy);
    return { txId: `mock-consent-${uuidv4()}` };
  }

  async revokeConsent(policyId: string): Promise<{ txId: string }> {
    const policy = this.consents.get(policyId);
    if (policy) {
      policy.status = 'REVOKED';
      this.consents.set(policyId, policy);
    }
    return { txId: `mock-revoke-${uuidv4()}` };
  }

  async checkAccess(input: AccessCheckInput): Promise<{ allowed: boolean; policyId?: string }> {
    const now = new Date(input.recordTime).getTime();
    const policy = Array.from(this.consents.values()).find((c) =>
      c.patientPseudoId === input.patientPseudoId &&
      c.granteeOrgId === input.granteeOrgId &&
      c.recordTypes.includes(input.recordType) &&
      c.purpose.includes(input.purpose) &&
      c.status === 'ACTIVE' &&
      new Date(c.validFrom).getTime() <= now &&
      new Date(c.validTo).getTime() >= now,
    );

    return policy ? { allowed: true, policyId: policy.policyId } : { allowed: false };
  }

  async logAccess(entry: AccessLogEntry): Promise<{ txId: string }> {
    this.audit.push(entry);
    return { txId: `mock-audit-${uuidv4()}` };
  }
}
