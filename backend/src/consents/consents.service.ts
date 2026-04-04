import { Inject, Injectable } from '@nestjs/common';
import { FABRIC_GATEWAY, FabricGatewayPort } from '../fabric/gateway/fabric-gateway.port';

@Injectable()
export class ConsentsService {
  constructor(@Inject(FABRIC_GATEWAY) private readonly fabric: FabricGatewayPort) {}

  async checkAccess(input: { patientPseudoId: string; granteeOrgId: string; recordType: string; purpose: string }) {
    return this.fabric.checkAccess({ ...input, recordTime: new Date().toISOString() });
  }
}
