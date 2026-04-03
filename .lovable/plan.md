## Plan: MedChain Architecture-Ready Upgrade

### Phase 1: Core Infrastructure (Items 3, 4)
1. **Route Guards & Permission System** — Create `PermissionGuard` component, `ForbiddenPage`, role-permission map, and wrap all routes
2. **API Layer Refactor** — Create gateway-shaped API contract with interface, mock implementation, and 403 handling

### Phase 2: Verification & Trust (Items 1, 8)
3. **Verification Drawer & Transaction Receipt** — `VerificationDrawer` (hash details, anchor status, cert badge), `TransactionReceiptModal` (tx id, timestamp, endorsing orgs)
4. **Degraded/Resilience States** — `DegradedBanner`, `MaintenanceMode`, partial retrieval states, delayed confirmation UI

### Phase 3: Clinical Realism (Items 2, 5)
5. **FHIR Interoperability Views** — Resource preview panel, schema version, mapping completeness, validation warnings, transformation history, retry actions
6. **Medical File Handling** — Document preview, encrypted badge, version history, duplicate detection, download receipt

### Phase 4: Security & Identity (Items 6, 7)
7. **Identity & Security Management** — Trusted devices, MFA management, recovery flow, suspicious activity log, session control
8. **Notification System Upgrade** — Filters, severity levels, preferences panel, critical pinned alerts

### Phase 5: Admin & Research (Items 9, 10)
9. **Admin Network Upgrade** — Consortium visualization, certificate status cards, channel participation, network events timeline
10. **Research/Evaluation Metrics Page** — Latency charts, success rates, anomaly counts, compliance KPIs, emergency access stats

Each component includes loading/empty/success/error states.