import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
import { ConsentsModule } from './consents/consents.module';
import { AccessModule } from './access/access.module';
import { AuditModule } from './audit/audit.module';
import { FhirModule } from './fhir/fhir.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ComplianceModule } from './compliance/compliance.module';
import { StorageModule } from './storage/storage.module';
import { KmsModule } from './kms/kms.module';
import { FabricModule } from './fabric/fabric.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    OrganizationsModule,
    UsersModule,
    RecordsModule,
    ConsentsModule,
    AccessModule,
    AuditModule,
    FhirModule,
    NotificationsModule,
    ComplianceModule,
    StorageModule,
    KmsModule,
    FabricModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
