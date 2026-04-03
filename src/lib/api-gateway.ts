/**
 * API Gateway Contract — Interface-based API layer.
 * Defines the contract for all API operations. Currently backed by mock implementation.
 * Can be swapped to a real backend by implementing IMedChainGateway.
 */
import type { RecordMeta, ConsentPolicy, AccessLogEntry, LedgerEvent, RecordStatus, UserRole } from "@/types/medical";
import type { TransactionReceipt } from "@/components/TransactionReceiptModal";
import type { VerificationData } from "@/components/VerificationDrawer";

// =================== Gateway Interface ===================

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  error?: string;
  traceId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface IMedChainGateway {
  // Auth
  login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>>;

  // Records
  getRecords(params?: { patientId?: string; type?: string; status?: string }): Promise<ApiResponse<RecordMeta[]>>;
  getRecord(recordId: string): Promise<ApiResponse<RecordMeta | null>>;
  registerRecord(data: { patientId: string; type: string; title: string; file?: File }): Promise<ApiResponse<{ recordId: string; hash: string; uri: string; status: RecordStatus }>>;
  advanceRecordStatus(recordId: string, currentStatus: RecordStatus): Promise<ApiResponse<RecordStatus>>;

  // Consents
  getConsents(patientId: string): Promise<ApiResponse<ConsentPolicy[]>>;
  getConsent(policyId: string): Promise<ApiResponse<ConsentPolicy | null>>;
  grantConsent(requestId: string): Promise<ApiResponse<{ policyId: string; receipt: TransactionReceipt }>>;
  revokeConsent(policyId: string): Promise<ApiResponse<{ receipt: TransactionReceipt }>>;

  // Verification
  verifyRecord(recordId: string): Promise<ApiResponse<VerificationData>>;
  getTransactionReceipt(txHash: string): Promise<ApiResponse<TransactionReceipt>>;

  // Access
  getAccessRequests(patientId?: string): Promise<ApiResponse<any[]>>;
  createAccessRequest(data: { patientPseudonym: string; scopeTypes: string[]; purpose: string; urgency: string }): Promise<ApiResponse<{ requestId: string }>>;
  retrieveRecord(recordId: string): Promise<ApiResponse<{ verified: boolean; receipt: TransactionReceipt }>>;

  // Audit
  getAuditLog(filters?: { patientId?: string; orgId?: string; from?: string; to?: string }): Promise<ApiResponse<AccessLogEntry[]>>;
  getLedgerEvents(): Promise<ApiResponse<LedgerEvent[]>>;

  // Organizations
  getOrganizations(): Promise<ApiResponse<any[]>>;
  addOrganization(data: { name: string; type: string }): Promise<ApiResponse<{ id: string }>>;

  // Admin
  getAdminUsers(): Promise<ApiResponse<any[]>>;
  inviteUser(data: { name: string; email: string; role: string; orgId: string }): Promise<ApiResponse<{ userId: string }>>;

  // System
  getSystemHealth(): Promise<ApiResponse<{ degraded: string[]; healthy: string[] }>>;
  setFailureRate(rate: number): void;
}

// =================== Mock Implementation ===================

import { api } from "./mock-api";
import { mockOrganizations, mockLedgerEvents } from "./mock-data";

function makeTraceId(): string {
  return "TRC-" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function wrapResponse<T>(data: T, status = 200): ApiResponse<T> {
  return { data, status, ok: status >= 200 && status < 300, traceId: makeTraceId() };
}

function wrapError<T>(error: string, status = 500): ApiResponse<T> {
  return { data: null as any, status, ok: false, error, traceId: makeTraceId() };
}

function makeReceipt(type: TransactionReceipt["type"], targetId: string, desc: string): TransactionReceipt {
  return {
    txHash: "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...",
    blockNumber: 48300 + Math.floor(Math.random() * 100),
    committedAt: new Date().toISOString(),
    status: "COMMITTED",
    type,
    endorsingOrgs: ["Mercy General Hospital", "Metro Health Network"],
    targetId,
    description: desc,
  };
}

export class MockGateway implements IMedChainGateway {
  async login(email: string, password: string) {
    try {
      const res = await api.login(email, password);
      return wrapResponse({ user: res.user, token: res.token || "" });
    } catch (e: any) { return wrapError(e.message); }
  }

  async getRecords(params?: { patientId?: string }) {
    try {
      const data = await api.getRecords(params?.patientId);
      return wrapResponse(data);
    } catch (e: any) { return wrapError(e.message); }
  }

  async getRecord(recordId: string) {
    try {
      const data = await api.getRecord(recordId);
      return wrapResponse(data);
    } catch (e: any) { return wrapError(e.message); }
  }

  async registerRecord(data: { patientId: string; type: string; title: string }) {
    try {
      const res = await api.registerRecord(data);
      return wrapResponse(res);
    } catch (e: any) { return wrapError(e.message); }
  }

  async advanceRecordStatus(recordId: string, currentStatus: RecordStatus) {
    try {
      const res = await api.advanceRecordStatus(recordId, currentStatus);
      return wrapResponse(res);
    } catch (e: any) { return wrapError(e.message); }
  }

  async getConsents(patientId: string) {
    try {
      const data = await api.getConsents(patientId);
      return wrapResponse(data);
    } catch (e: any) { return wrapError(e.message); }
  }

  async getConsent(policyId: string) {
    try {
      const data = await api.getConsent(policyId);
      return wrapResponse(data);
    } catch (e: any) { return wrapError(e.message); }
  }

  async grantConsent(requestId: string) {
    try {
      const res = await api.grantConsent(requestId);
      const receipt = makeReceipt("consent_grant", res.policyId, "Consent policy created on immutable ledger");
      return wrapResponse({ policyId: res.policyId, receipt });
    } catch (e: any) { return wrapError(e.message); }
  }

  async revokeConsent(policyId: string) {
    try {
      await api.revokeConsent(policyId);
      const receipt = makeReceipt("consent_revoke", policyId, "Consent policy revoked on immutable ledger");
      return wrapResponse({ receipt });
    } catch (e: any) { return wrapError(e.message); }
  }

  async verifyRecord(recordId: string) {
    try {
      const record = await api.getRecord(recordId);
      if (!record) return wrapError("Record not found", 404);
      const hashMatch = Math.random() > 0.1;
      const data: VerificationData = {
        offchainHash: record.hash_offchain,
        onchainAnchor: hashMatch ? record.hash_offchain : record.hash_offchain.slice(0, -4) + "xxxx",
        status: hashMatch ? "verified" : "mismatch",
        lastVerified: new Date().toISOString(),
        certIssuer: record.owner_org,
        certValid: true,
        endorsingOrgs: ["Mercy General Hospital", "Metro Health Network"],
        txHash: "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...",
        blockNumber: 48290,
        committedAt: record.created_at,
      };
      return wrapResponse(data);
    } catch (e: any) { return wrapError(e.message); }
  }

  async getTransactionReceipt(txHash: string) {
    const receipt = makeReceipt("record_registration", "rec-mock", "Transaction receipt retrieved");
    receipt.txHash = txHash;
    return wrapResponse(receipt);
  }

  async getAccessRequests(patientId?: string) {
    try { return wrapResponse(await api.getAccessRequests(patientId)); } catch (e: any) { return wrapError(e.message); }
  }

  async createAccessRequest(data: { patientPseudonym: string; scopeTypes: string[]; purpose: string; urgency: string }) {
    try { return wrapResponse(await api.createAccessRequest(data)); } catch (e: any) { return wrapError(e.message); }
  }

  async retrieveRecord(recordId: string) {
    try {
      await api.retrieveRecord(recordId);
      const receipt = makeReceipt("access_log", recordId, "Record retrieved and access logged on immutable ledger");
      return wrapResponse({ verified: true, receipt });
    } catch (e: any) {
      if (e.message === "HASH_MISMATCH") return wrapError("Hash verification failed — possible data tampering", 409);
      return wrapError(e.message);
    }
  }

  async getAuditLog(filters?: any) {
    try { return wrapResponse(await api.getAuditLog(filters?.patientId)); } catch (e: any) { return wrapError(e.message); }
  }

  async getLedgerEvents() {
    try { return wrapResponse(await api.getLedgerEvents()); } catch (e: any) { return wrapError(e.message); }
  }

  async getOrganizations() {
    try { return wrapResponse(await api.getOrganizations()); } catch (e: any) { return wrapError(e.message); }
  }

  async addOrganization(data: { name: string; type: string }) {
    try { return wrapResponse(await api.addOrganization(data)); } catch (e: any) { return wrapError(e.message); }
  }

  async getAdminUsers() {
    try { return wrapResponse(await api.getAdminUsers()); } catch (e: any) { return wrapError(e.message); }
  }

  async inviteUser(data: { name: string; email: string; role: string; orgId: string }) {
    try { return wrapResponse(await api.inviteUser(data)); } catch (e: any) { return wrapError(e.message); }
  }

  async getSystemHealth() {
    const degraded = mockOrganizations.filter(o => o.node_status !== "active").map(o => o.name);
    const healthy = mockOrganizations.filter(o => o.node_status === "active").map(o => o.name);
    return wrapResponse({ degraded, healthy });
  }

  setFailureRate(rate: number) {
    api.setFailureRate(rate);
  }
}

// =================== Singleton Export ===================
export const gateway: IMedChainGateway = new MockGateway();
