import { Injectable, Logger } from '@nestjs/common';
import {
  AccessCheckInput,
  AccessLogEntry,
  ConsentPolicy,
  FabricGatewayPort,
  RecordMeta,
  RecordQuery,
} from './fabric-gateway.port';

@Injectable()
export class HyperledgerFabricGateway implements FabricGatewayPort {
  private readonly logger = new Logger(HyperledgerFabricGateway.name);

  async registerRecord(meta: RecordMeta): Promise<{ txId: string }> {
    this.logger.debug(`submit registry-contract:RegisterRecord ${meta.recordId}`);
    return { txId: `fabric-reg-${meta.recordId}` };
  }

  async getRecord(recordId: string): Promise<RecordMeta | null> {
    this.logger.debug(`evaluate registry-contract:GetRecord ${recordId}`);
    return null;
  }

  async queryRecordsByScope(scope: RecordQuery): Promise<RecordMeta[]> {
    this.logger.debug(`evaluate registry-contract:QueryRecordsByScope ${scope.patientPseudoId}`);
    return [];
  }

  async grantConsent(policy: ConsentPolicy): Promise<{ txId: string }> {
    this.logger.debug(`submit consent-contract:GrantConsent ${policy.policyId}`);
    return { txId: `fabric-consent-${policy.policyId}` };
  }

  async revokeConsent(policyId: string): Promise<{ txId: string }> {
    this.logger.debug(`submit consent-contract:RevokeConsent ${policyId}`);
    return { txId: `fabric-revoke-${policyId}` };
  }

  async checkAccess(input: AccessCheckInput): Promise<{ allowed: boolean; policyId?: string }> {
    this.logger.debug(`evaluate consent-contract:CheckAccess ${input.patientPseudoId}`);
    return { allowed: false };
  }

  async logAccess(entry: AccessLogEntry): Promise<{ txId: string }> {
    this.logger.debug(`submit audit-contract:LogAccess ${entry.eventId}`);
    return { txId: `fabric-audit-${entry.eventId}` };
  }
}
