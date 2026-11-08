import { randomBytes, createHash } from 'crypto';
import { EncryptionService } from './encryption.service';

describe('EncryptionService — AES-256-GCM integrity', () => {
  const service = new EncryptionService();
  it('encrypts/decrypts a synthetic clinical payload and hashes the ciphertext', () => {
    const key = randomBytes(32);
    const payload = Buffer.from(JSON.stringify({ resourceType: 'DiagnosticReport', id: 'synthetic-1' }));
    const encrypted = service.encryptAesGcm(payload, key);
    expect(encrypted.cipherText.equals(payload)).toBe(false);
    expect(encrypted.hashHex).toBe(createHash('sha256').update(encrypted.cipherText).digest('hex'));
    expect(service.decryptAesGcm(encrypted.cipherText, key, encrypted.ivB64, encrypted.tagB64)).toEqual(payload);
  });
  it('rejects tampered ciphertext', () => {
    const key = randomBytes(32);
    const encrypted = service.encryptAesGcm(Buffer.from('synthetic-data'), key);
    const modified = Buffer.from(encrypted.cipherText);
    modified[0] ^= 1;
    expect(() => service.decryptAesGcm(modified, key, encrypted.ivB64, encrypted.tagB64)).toThrow();
  });
  it('rejects an incorrect decryption key', () => {
    const encrypted = service.encryptAesGcm(Buffer.from('synthetic-data'), randomBytes(32));
    expect(() => service.decryptAesGcm(encrypted.cipherText, randomBytes(32), encrypted.ivB64, encrypted.tagB64)).toThrow();
  });
});
