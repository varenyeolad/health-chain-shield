# MedChain Backend Architecture & Implementation Skeleton

## 1) Architecture Overview

MedChain backend is a **layered gateway** that shields frontend domains (Patient, Provider, Consumer, Regulator, Admin) from blockchain internals.

### Layers
1. **API Layer (NestJS REST)**
   - AuthN/AuthZ, validation, RBAC guards, rate-limits, Swagger.
2. **Application Layer**
   - Workflow orchestration (records registration, access retrieval, consent checks, audit handling).
3. **Infrastructure Layer**
   - PostgreSQL read models (Prisma), Redis/BullMQ jobs, MinIO object storage, Fabric adapter, KMS abstraction.
4. **Trust Layer (Fabric)**
   - Registry metadata anchors, consent truth, immutable access audit logs.

### Data Placement
- **On-chain**: RecordMeta anchors, ConsentPolicy state, AccessLogEntry, tx anchors.
- **Off-chain object storage**: encrypted payloads (FHIR JSON / docs / imaging artifacts).
- **PostgreSQL**: read models, users/orgs/sessions/workflow/notification/compliance aggregates.

## 2) NestJS Modules

- `auth`: login/logout/refresh/MFA/session/me.
- `organizations`: admin organization CRUD-lite.
- `users`: user listing/invite/role patch.
- `records`: register/list/detail/verify/version history placeholders.
- `consents`: request/grant/decline/revoke/check.
- `access`: request/retrieve/emergency and audit emission.
- `audit`: patient/provider/consumer/regulator views + export + log-access.
- `fhir`: validate/map/list mappings/retry.
- `notifications`: delivery/preferences scaffold.
- `compliance`: anomaly scans/scaffold.
- `fabric`: pluggable gateway (`MockFabricGateway`, `HyperledgerFabricGateway`).
- `storage`: S3-compatible adapter (MinIO now).
- `kms`: pluggable KMS port with local prototype wrapper.

## 3) Folder Tree

```text
backend/
  src/
    app.module.ts
    main.ts
    auth/
    users/
    organizations/
    patients/
    records/
    consents/
    access/
    audit/
    notifications/
    fhir/
    compliance/
    fabric/
      contracts/
      gateway/
      mappers/
    storage/
    kms/
    jobs/
    metrics/
    common/
    config/
    prisma/
  prisma/
    schema.prisma
  chaincode/
    registry-contract/
    consent-contract/
    audit-contract/
  docker/
    docker-compose.yml
  Dockerfile
```

## 4) DTOs (initial)

- `records/dto/register-record.dto.ts`
  - `patientId`, `recordType`, `payload`, optional `sourceSystem`, optional `tags`.
- `records/dto/verify-record.dto.ts`
  - `recordId`.
- Extend similarly for auth, consent grant/revoke/check, retrieval request.

## 5) Entity / Schema Definitions

Implemented in Prisma (`backend/prisma/schema.prisma`):
- `Organization`, `User`, `Patient`
- `RecordIndex` (read model for screen queries)
- `FileObject` (encrypted object metadata + wrapped key envelope metadata)
- `ConsentRequest`, `ConsentIndex`
- `AuditIndex`, `SecurityEvent`, `Notification`

## 6) Migration Plan

1. `001_init_core`
   - orgs, users, patients, notifications.
2. `002_records`
   - record_index, file_objects with index on patient/type.
3. `003_consents_audit`
   - consent_requests, consent_index, audit_index.
4. `004_security`
   - security_events, session/refresh models.
5. `005_compliance_jobs`
   - anomaly result tables, export artifacts, dashboard aggregates.

Run:
```bash
cd backend
npm install
npx prisma migrate dev --name init
```

## 7) Fabric Adapter Design

Port contract: `FabricGatewayPort` with methods:
- `registerRecord`, `getRecord`, `queryRecordsByScope`
- `grantConsent`, `revokeConsent`, `checkAccess`
- `logAccess`

Implementations:
- `MockFabricGateway`: in-memory for local integration and tests.
- `HyperledgerFabricGateway`: SDK call sites for registry/consent/audit contracts.

Selection:
- env `FABRIC_MODE=mock|fabric`.

## 8) Chaincode Skeletons

### registry-contract
- `RegisterRecord(meta)`
- `GetRecord(recordId)`
- `QueryRecordsByPatient(patientId)`
- `QueryRecordsByPatientAndType(patientId, type)`
- `QueryRecordsByScope(patientId, scope)`

### consent-contract
- `GrantConsent(policy)`
- `RevokeConsent(policyId)`
- `GetConsent(policyId)`
- `QueryConsentsByPatient(patientId)`
- `CheckAccess(patientId, granteeId, recordType, recordTime, purpose)`

### audit-contract
- `LogAccess(entry)`
- `GetAuditByPatient(patientId)`
- `GetAuditByRecord(recordId)`
- `GetAuditByGrantee(granteeId)`

## 9) REST API Contract (scaffold + milestone)

- `POST /auth/login`
- `POST /auth/mfa/verify`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`
- `GET /me/sessions`
- `DELETE /me/sessions/:id`

- `GET /organizations`
- `POST /organizations`
- `PATCH /organizations/:id`

- `GET /users`
- `POST /users/invite`
- `PATCH /users/:id/role`

- `GET /records`
- `GET /records/:recordId`
- `POST /records/register` ✅ implemented
- `POST /records/:recordId/upload` placeholder
- `GET /records/:recordId/versions` placeholder
- `POST /records/:recordId/verify` ✅ implemented

- `GET /consents`
- `GET /consents/:policyId`
- `GET /consents/requests`
- `POST /consents/request`
- `POST /consents/grant`
- `POST /consents/decline`
- `POST /consents/revoke`
- `POST /consents/check`

- `POST /access/request`
- `POST /access/retrieve` ✅ implemented (consent + hash verify + decrypt + log)
- `POST /access/emergency`
- `POST /audit/log-access`

- `GET /audit/patient`
- `GET /audit/provider`
- `GET /audit/consumer`
- `GET /audit/regulator`
- `POST /audit/export`

- `POST /fhir/validate`
- `POST /fhir/map`
- `GET /fhir/mappings`
- `POST /fhir/mappings/:id/retry`

## 10) First Milestone: working `/records/register`

Implemented pipeline:
1. Validate DTO.
2. Serialize payload.
3. Generate per-record data key.
4. Encrypt with AES-256-GCM.
5. Wrap data key (org scoped key derivation in prototype).
6. Store ciphertext to MinIO (S3 URI).
7. Hash ciphertext (`sha256`).
8. Build `RecordMeta` and submit Fabric `registerRecord`.
9. Persist read model (`record_index`) + key envelope/object metadata (`file_objects`).
10. Return `{ txId, recordId, hash, uri }`.

## 11) Example Services Included

- `records/encryption.service.ts`: AES-256-GCM encrypt/decrypt + SHA256.
- `storage/minio-storage.service.ts`: put/get object against MinIO.
- `fabric/gateway/*`: mock + hyperledger adapter skeleton.
- `records/records.service.ts`: registration + list/get/verify.
- `access/access.service.ts`: consent check + integrity verify + unwrap key + decrypt + log access.

## 12) Security Controls wired in skeleton

- Input validation (`class-validator` + global `ValidationPipe`).
- DTO allow-listing for FHIR record types.
- Payload size guard on sync registration path.
- Pseudonymous patient ID for ledger metadata.
- Ciphertext hash verification before decryption.
- Access denials logged on Fabric audit path.
- Local KMS abstraction to move to Vault/KMS later without service rewrites.
- TLS-ready endpoint/environment pattern and no direct ledger exposure to frontend.

## 13) Production hardening next

- JWT + refresh/session DB and MFA challenge store.
- RBAC guards/interceptors and denied-access security events.
- BullMQ processors (encryption async, export, notifications, anomaly scans).
- Pre-signed download URL route for large binary objects.
- Real Hyperledger Fabric SDK integration + gateway connection profiles.
- Keycloak integration option behind auth provider port.
