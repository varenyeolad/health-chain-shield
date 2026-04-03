export interface WrappedKeyEnvelope {
  wrappedKeyB64: string;
  keyVersion: string;
  wrappingAlg: string;
}

export interface KmsPort {
  generateDataKey(): Buffer;
  wrapDataKey(dataKey: Buffer, orgId: string): Promise<WrappedKeyEnvelope>;
  unwrapDataKey(envelope: WrappedKeyEnvelope, orgId: string): Promise<Buffer>;
}

export const KMS_PORT = Symbol('KMS_PORT');
