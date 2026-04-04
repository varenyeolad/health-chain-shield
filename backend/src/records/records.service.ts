import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { KMS_PORT, KmsPort } from '../kms/kms.port';
import { STORAGE_PORT, StoragePort } from '../storage/storage.port';
import { FABRIC_GATEWAY, FabricGatewayPort, RecordMeta } from '../fabric/gateway/fabric-gateway.port';
import { RegisterRecordDto } from './dto/register-record.dto';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    @Inject(KMS_PORT) private readonly kms: KmsPort,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    @Inject(FABRIC_GATEWAY) private readonly fabric: FabricGatewayPort,
  ) {}

  async register(dto: RegisterRecordDto, actorOrgId: string): Promise<{
    txId: string;
    recordId: string;
    hash: string;
    uri: string;
  }> {
    const plain = Buffer.from(JSON.stringify(dto.payload), 'utf-8');
    if (plain.length > 20 * 1024 * 1024) {
      throw new BadRequestException('Payload too large for synchronous register flow');
    }

    const recordId = `rec_${uuidv4()}`;
    const versionId = `ver_${uuidv4()}`;
    const patientPseudoId = this.pseudonymizePatientId(dto.patientId);

    const dataKey = this.kms.generateDataKey();
    const encrypted = this.encryption.encryptAesGcm(plain, dataKey);
    const envelope = await this.kms.wrapDataKey(dataKey, actorOrgId);

    const objectKey = `${patientPseudoId}/${recordId}/${versionId}.enc`;
    const object = await this.storage.putObject({
      bucket: process.env.RECORDS_BUCKET ?? 'medchain-records',
      objectKey,
      body: encrypted.cipherText,
      contentType: 'application/octet-stream',
    });

    const meta: RecordMeta = {
      recordId,
      patientPseudoId,
      ownerOrgId: actorOrgId,
      recordType: dto.recordType,
      contentType: 'application/fhir+json',
      objectUri: object.uri,
      cipherHash: encrypted.hashHex,
      createdAt: new Date().toISOString(),
      version: 1,
    };

    const tx = await this.fabric.registerRecord(meta);

    try {
      await this.prisma.$transaction([
        this.prisma.recordIndex.create({
          data: {
            recordId,
            patientId: dto.patientId,
            patientPseudoId,
            ownerOrgId: actorOrgId,
            recordType: dto.recordType,
            fabricTxId: tx.txId,
            currentVersion: 1,
            latestHash: encrypted.hashHex,
            latestObjectUri: object.uri,
            sourceSystem: dto.sourceSystem,
          },
        }),
        this.prisma.fileObject.create({
          data: {
            objectUri: object.uri,
            bucket: object.bucket,
            objectKey: object.objectKey,
            contentType: 'application/octet-stream',
            byteSize: object.size,
            sha256: encrypted.hashHex,
            wrappedKey: envelope.wrappedKeyB64,
            keyVersion: envelope.keyVersion,
            wrappingAlg: envelope.wrappingAlg,
            ivB64: encrypted.ivB64,
            tagB64: encrypted.tagB64,
            orgId: actorOrgId,
            recordId,
            version: 1,
          },
        }),
      ]);
    } catch (error) {
      this.rethrowDbBootstrapError(error);
    }

    return { txId: tx.txId, recordId, hash: encrypted.hashHex, uri: object.uri };
  }

  async getById(recordId: string) {
    let row;
    try {
      row = await this.prisma.recordIndex.findUnique({ where: { recordId } });
    } catch (error) {
      this.rethrowDbBootstrapError(error);
    }
    if (!row) throw new NotFoundException('record not found');
    return row;
  }

  async list(patientId?: string) {
    try {
      return await this.prisma.recordIndex.findMany({
        where: patientId ? { patientId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    } catch (error) {
      this.rethrowDbBootstrapError(error);
    }
  }

  async verify(recordId: string): Promise<{ valid: boolean; computedHash: string; expectedHash: string }> {
    let fo;
    try {
      fo = await this.prisma.fileObject.findFirst({ where: { recordId }, orderBy: { createdAt: 'desc' } });
    } catch (error) {
      this.rethrowDbBootstrapError(error);
    }
    if (!fo) throw new NotFoundException('record file object not found');

    const cipherText = await this.storage.getObject({ bucket: fo.bucket, objectKey: fo.objectKey });
    const computedHash = createHash('sha256').update(cipherText).digest('hex');
    return { valid: computedHash === fo.sha256, computedHash, expectedHash: fo.sha256 };
  }

  private pseudonymizePatientId(patientId: string): string {
    return `ppid_${createHash('sha256').update(`medchain:${patientId}`).digest('hex').slice(0, 24)}`;
  }

  private rethrowDbBootstrapError(error: unknown): never {
    const code = (error as { code?: string })?.code;
    if (code === 'P2021' || code === 'P2022') {
      throw new ServiceUnavailableException(
        'Database schema is not initialized. Run `npx prisma migrate dev --name init` or `npx prisma db push`.',
      );
    }

    throw error;
  }
}
