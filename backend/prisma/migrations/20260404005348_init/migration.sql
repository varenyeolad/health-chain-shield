-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'PROVIDER', 'CONSUMER', 'REGULATOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "externalPatientId" TEXT NOT NULL,
    "pseudoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordIndex" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientPseudoId" TEXT NOT NULL,
    "ownerOrgId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "fabricTxId" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL,
    "latestHash" TEXT NOT NULL,
    "latestObjectUri" TEXT NOT NULL,
    "sourceSystem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecordIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileObject" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectUri" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "wrappedKey" TEXT NOT NULL,
    "keyVersion" TEXT NOT NULL,
    "wrappingAlg" TEXT NOT NULL,
    "ivB64" TEXT NOT NULL,
    "tagB64" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "patientPseudoId" TEXT NOT NULL,
    "granteeOrgId" TEXT NOT NULL,
    "recordTypes" TEXT[],
    "purposes" TEXT[],
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentIndex" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "patientPseudoId" TEXT NOT NULL,
    "granteeOrgId" TEXT NOT NULL,
    "dataScope" TEXT NOT NULL,
    "recordTypes" TEXT[],
    "purpose" TEXT[],
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "fabricTxId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditIndex" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "patientPseudoId" TEXT NOT NULL,
    "requesterOrgId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "fabricTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_externalPatientId_key" ON "Patient"("externalPatientId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_pseudoId_key" ON "Patient"("pseudoId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordIndex_recordId_key" ON "RecordIndex"("recordId");

-- CreateIndex
CREATE INDEX "RecordIndex_patientId_recordType_idx" ON "RecordIndex"("patientId", "recordType");

-- CreateIndex
CREATE INDEX "RecordIndex_patientPseudoId_idx" ON "RecordIndex"("patientPseudoId");

-- CreateIndex
CREATE UNIQUE INDEX "FileObject_objectUri_key" ON "FileObject"("objectUri");

-- CreateIndex
CREATE UNIQUE INDEX "FileObject_recordId_version_key" ON "FileObject"("recordId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRequest_requestId_key" ON "ConsentRequest"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentIndex_policyId_key" ON "ConsentIndex"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditIndex_eventId_key" ON "AuditIndex"("eventId");

-- CreateIndex
CREATE INDEX "AuditIndex_patientPseudoId_createdAt_idx" ON "AuditIndex"("patientPseudoId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileObject" ADD CONSTRAINT "FileObject_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "RecordIndex"("recordId") ON DELETE RESTRICT ON UPDATE CASCADE;
