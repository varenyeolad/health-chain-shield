import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { EncryptionService } from './encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageModule } from '../storage/storage.module';
import { KmsModule } from '../kms/kms.module';
import { FabricModule } from '../fabric/fabric.module';

@Module({
  imports: [StorageModule, KmsModule, FabricModule],
  controllers: [RecordsController],
  providers: [RecordsService, EncryptionService, PrismaService],
  exports: [RecordsService],
})
export class RecordsModule {}
