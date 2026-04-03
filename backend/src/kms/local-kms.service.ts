import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import { KmsPort, WrappedKeyEnvelope } from './kms.port';

@Injectable()
export class LocalKmsService implements KmsPort {
  generateDataKey(): Buffer {
    return randomBytes(32);
  }

  async wrapDataKey(dataKey: Buffer, orgId: string): Promise<WrappedKeyEnvelope> {
    const wrappingKey = this.deriveOrgMasterKey(orgId);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', wrappingKey, iv);
    const encrypted = Buffer.concat([cipher.update(dataKey), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      wrappedKeyB64: Buffer.concat([iv, tag, encrypted]).toString('base64'),
      keyVersion: 'v1',
      wrappingAlg: 'AES-256-GCM',
    };
  }

  async unwrapDataKey(envelope: WrappedKeyEnvelope, orgId: string): Promise<Buffer> {
    const wrappingKey = this.deriveOrgMasterKey(orgId);
    const blob = Buffer.from(envelope.wrappedKeyB64, 'base64');
    const iv = blob.subarray(0, 12);
    const tag = blob.subarray(12, 28);
    const encrypted = blob.subarray(28);

    const decipher = createDecipheriv('aes-256-gcm', wrappingKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  private deriveOrgMasterKey(orgId: string): Buffer {
    const seed = process.env.KMS_MASTER_SEED ?? 'local-dev-master-seed';
    return createHash('sha256').update(`${seed}:${orgId}`).digest();
  }
}
