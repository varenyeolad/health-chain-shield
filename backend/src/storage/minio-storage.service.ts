import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { StoragePort, StoredObjectResult } from './storage.port';

@Injectable()
export class MinioStorageService implements StoragePort {
  private readonly client: Minio.Client;

  constructor(private readonly config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('S3_ENDPOINT', 'localhost'),
      port: Number(this.config.get<string>('S3_PORT', '9000')),
      useSSL: this.config.get<string>('S3_SSL', 'false') === 'true',
      accessKey: this.config.get<string>('S3_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get<string>('S3_SECRET_KEY', 'minioadmin'),
    });
  }

  async putObject(input: { bucket: string; objectKey: string; body: Buffer; contentType: string }): Promise<StoredObjectResult> {
    const exists = await this.client.bucketExists(input.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(input.bucket, 'us-east-1');
    }

    await this.client.putObject(input.bucket, input.objectKey, input.body, input.body.length, {
      'Content-Type': input.contentType,
    });

    return {
      uri: `s3://${input.bucket}/${input.objectKey}`,
      bucket: input.bucket,
      objectKey: input.objectKey,
      size: input.body.length,
    };
  }

  async getObject(input: { bucket: string; objectKey: string }): Promise<Buffer> {
    const stream = await this.client.getObject(input.bucket, input.objectKey);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
