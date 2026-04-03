import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { RecordsModule } from '../records/records.module';
import { ConsentsModule } from '../consents/consents.module';
import { StorageModule } from '../storage/storage.module';
import { KmsModule } from '../kms/kms.module';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../records/encryption.service';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [RecordsModule, ConsentsModule, StorageModule, KmsModule, FabricModule],
  controllers: [AccessController],
  providers: [AccessService, PrismaService, EncryptionService],
})
export class AccessModule {}
