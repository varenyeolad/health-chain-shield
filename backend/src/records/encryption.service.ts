import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

export interface EncryptedPayload {
  cipherText: Buffer;
  ivB64: string;
  tagB64: string;
  hashHex: string;
}

@Injectable()
export class EncryptionService {
  encryptAesGcm(plain: Buffer, dataKey: Buffer): EncryptedPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', dataKey, iv);
    const cipherText = Buffer.concat([cipher.update(plain), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      cipherText,
      ivB64: iv.toString('base64'),
      tagB64: tag.toString('base64'),
      hashHex: createHash('sha256').update(cipherText).digest('hex'),
    };
  }

  decryptAesGcm(cipherText: Buffer, dataKey: Buffer, ivB64: string, tagB64: string): Buffer {
    const decipher = createDecipheriv('aes-256-gcm', dataKey, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([decipher.update(cipherText), decipher.final()]);
  }
}
