import { Module } from '@nestjs/common';
import { KMS_PORT } from './kms.port';
import { LocalKmsService } from './local-kms.service';

@Module({
  providers: [
    LocalKmsService,
    {
      provide: KMS_PORT,
      useExisting: LocalKmsService,
    },
  ],
  exports: [KMS_PORT],
})
export class KmsModule {}
