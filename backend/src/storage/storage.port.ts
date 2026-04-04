export interface StoredObjectResult {
  uri: string;
  bucket: string;
  objectKey: string;
  size: number;
}

export interface StoragePort {
  putObject(input: { bucket: string; objectKey: string; body: Buffer; contentType: string }): Promise<StoredObjectResult>;
  getObject(input: { bucket: string; objectKey: string }): Promise<Buffer>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
