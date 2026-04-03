import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ConsentsService } from '../consents/consents.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT, StoragePort } from '../storage/storage.port';
import { KMS_PORT, KmsPort } from '../kms/kms.port';
import { EncryptionService } from '../records/encryption.service';
import { FABRIC_GATEWAY, FabricGatewayPort } from '../fabric/gateway/fabric-gateway.port';

@Injectable()
export class AccessService {
  constructor(
    private readonly consents: ConsentsService,
    private readonly prisma: PrismaService,
    private readonly cryptoService: EncryptionService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    @Inject(KMS_PORT) private readonly kms: KmsPort,
    @Inject(FABRIC_GATEWAY) private readonly fabric: FabricGatewayPort,
  ) {}

  async retrieve(input: { recordId: string; patientPseudoId: string; granteeOrgId: string; purpose: string }) {
    const record = await this.prisma.recordIndex.findUnique({ where: { recordId: input.recordId } });
    if (!record) throw new NotFoundException('record not found');

    const consent = await this.consents.checkAccess({
      patientPseudoId: input.patientPseudoId,
      granteeOrgId: input.granteeOrgId,
      recordType: record.recordType,
      purpose: input.purpose,
    });

    if (!consent.allowed) {
      await this.fabric.logAccess({
        eventId: `evt_${uuidv4()}`,
        recordId: input.recordId,
        patientPseudoId: input.patientPseudoId,
        requesterOrgId: input.granteeOrgId,
        purpose: input.purpose,
        outcome: 'DENY',
        at: new Date().toISOString(),
      });
      throw new ForbiddenException('consent denied');
    }

    const fo = await this.prisma.fileObject.findFirst({ where: { recordId: input.recordId }, orderBy: { version: 'desc' } });
    if (!fo) throw new NotFoundException('file object missing');

    const cipher = await this.storage.getObject({ bucket: fo.bucket, objectKey: fo.objectKey });
    const hash = createHash('sha256').update(cipher).digest('hex');
    if (hash !== fo.sha256) {
      throw new ForbiddenException('integrity mismatch');
    }

    const dataKey = await this.kms.unwrapDataKey(
      { wrappedKeyB64: fo.wrappedKey, keyVersion: fo.keyVersion, wrappingAlg: fo.wrappingAlg },
      fo.orgId,
    );
    const plain = this.cryptoService.decryptAesGcm(cipher, dataKey, fo.ivB64, fo.tagB64).toString('utf-8');

    await this.fabric.logAccess({
      eventId: `evt_${uuidv4()}`,
      recordId: input.recordId,
      patientPseudoId: input.patientPseudoId,
      requesterOrgId: input.granteeOrgId,
      purpose: input.purpose,
      outcome: 'ALLOW',
      at: new Date().toISOString(),
    });

    return { recordId: input.recordId, payload: JSON.parse(plain), consentPolicyId: consent.policyId };
  }
}
