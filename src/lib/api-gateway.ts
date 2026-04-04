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

export interface IMedChainGateway {
  login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>>;
  getRecords(params?: { patientId?: string; type?: string; status?: string }): Promise<ApiResponse<RecordMeta[]>>;
  getRecord(recordId: string): Promise<ApiResponse<RecordMeta | null>>;
  registerRecord(data: { patientId: string; type: string; title: string; file?: File }): Promise<ApiResponse<{ recordId: string; hash: string; uri: string; status: RecordStatus }>>;
  advanceRecordStatus(recordId: string, currentStatus: RecordStatus): Promise<ApiResponse<RecordStatus>>;
  getConsents(patientId: string): Promise<ApiResponse<ConsentPolicy[]>>;
  getConsent(policyId: string): Promise<ApiResponse<ConsentPolicy | null>>;
  grantConsent(requestId: string): Promise<ApiResponse<{ policyId: string; receipt: TransactionReceipt }>>;
  revokeConsent(policyId: string): Promise<ApiResponse<{ receipt: TransactionReceipt }>>;
  verifyRecord(recordId: string): Promise<ApiResponse<VerificationData>>;
  getTransactionReceipt(txHash: string): Promise<ApiResponse<TransactionReceipt>>;
  getAccessRequests(patientId?: string): Promise<ApiResponse<any[]>>;
  createAccessRequest(data: { patientPseudonym: string; scopeTypes: string[]; purpose: string; urgency: string }): Promise<ApiResponse<{ requestId: string }>>;
  retrieveRecord(recordId: string): Promise<ApiResponse<{ verified: boolean; receipt: TransactionReceipt }>>;
  getAuditLog(filters?: { patientId?: string; orgId?: string; from?: string; to?: string }): Promise<ApiResponse<AccessLogEntry[]>>;
  getLedgerEvents(): Promise<ApiResponse<LedgerEvent[]>>;
  getOrganizations(): Promise<ApiResponse<any[]>>;
  addOrganization(data: { name: string; type: string }): Promise<ApiResponse<{ id: string }>>;
  getAdminUsers(): Promise<ApiResponse<any[]>>;
  inviteUser(data: { name: string; email: string; role: string; orgId: string }): Promise<ApiResponse<{ userId: string }>>;
  getSystemHealth(): Promise<ApiResponse<{ degraded: string[]; healthy: string[] }>>;
  setFailureRate(rate: number): void;
}

// =================== Mock Implementation ===================

import { api } from "./mock-api";
import { mockOrganizations } from "./mock-data";

function makeTraceId(): string {
  return "TRC-" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function ok<T>(data: T): ApiResponse<T> {
  return { data, status: 200, ok: true, traceId: makeTraceId() };
}

function err<T>(error: string, status = 500): ApiResponse<T> {
  return { data: null as unknown as T, status, ok: false, error, traceId: makeTraceId() };
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
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    try { const res = await api.login(email, password); return ok({ user: res.user, token: res.token || "" }); }
    catch (e: any) { return err(e.message); }
  }
  async getRecords(params?: { patientId?: string }): Promise<ApiResponse<RecordMeta[]>> {
    try { return ok(await api.getRecords(params?.patientId)); } catch (e: any) { return err(e.message); }
  }
  async getRecord(recordId: string): Promise<ApiResponse<RecordMeta | null>> {
    try { return ok(await api.getRecord(recordId)); } catch (e: any) { return err(e.message); }
  }
  async registerRecord(data: { patientId: string; type: string; title: string }): Promise<ApiResponse<{ recordId: string; hash: string; uri: string; status: RecordStatus }>> {
    try { return ok(await api.registerRecord(data)); } catch (e: any) { return err(e.message); }
  }
  async advanceRecordStatus(recordId: string, currentStatus: RecordStatus): Promise<ApiResponse<RecordStatus>> {
    try { return ok(await api.advanceRecordStatus(recordId, currentStatus)); } catch (e: any) { return err(e.message); }
  }
  async getConsents(patientId: string): Promise<ApiResponse<ConsentPolicy[]>> {
    try { return ok(await api.getConsents(patientId)); } catch (e: any) { return err(e.message); }
  }
  async getConsent(policyId: string): Promise<ApiResponse<ConsentPolicy | null>> {
    try { return ok(await api.getConsent(policyId)); } catch (e: any) { return err(e.message); }
  }
  async grantConsent(requestId: string): Promise<ApiResponse<{ policyId: string; receipt: TransactionReceipt }>> {
    try {
      const res = await api.grantConsent(requestId);
      return ok({ policyId: res.policyId, receipt: makeReceipt("consent_grant", res.policyId, "Consent policy created on immutable ledger") });
    } catch (e: any) { return err(e.message); }
  }
  async revokeConsent(policyId: string): Promise<ApiResponse<{ receipt: TransactionReceipt }>> {
    try {
      await api.revokeConsent(policyId);
      return ok({ receipt: makeReceipt("consent_revoke", policyId, "Consent policy revoked on immutable ledger") });
    } catch (e: any) { return err(e.message); }
  }
  async verifyRecord(recordId: string): Promise<ApiResponse<VerificationData>> {
    try {
      const record = await api.getRecord(recordId);
      if (!record) return err("Record not found", 404);
      const hashMatch = Math.random() > 0.1;
      return ok({
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
      });
    } catch (e: any) { return err(e.message); }
  }
  async getTransactionReceipt(txHash: string): Promise<ApiResponse<TransactionReceipt>> {
    const receipt = makeReceipt("record_registration", "rec-mock", "Transaction receipt retrieved");
    receipt.txHash = txHash;
    return ok(receipt);
  }
  async getAccessRequests(patientId?: string): Promise<ApiResponse<any[]>> {
    try { return ok(await api.getAccessRequests(patientId)); } catch (e: any) { return err(e.message); }
  }
  async createAccessRequest(data: { patientPseudonym: string; scopeTypes: string[]; purpose: string; urgency: string }): Promise<ApiResponse<{ requestId: string }>> {
    try { return ok(await api.createAccessRequest(data)); } catch (e: any) { return err(e.message); }
  }
  async retrieveRecord(recordId: string): Promise<ApiResponse<{ verified: boolean; receipt: TransactionReceipt }>> {
    try {
      await api.retrieveRecord(recordId);
      return ok({ verified: true, receipt: makeReceipt("access_log", recordId, "Record retrieved and access logged on immutable ledger") });
    } catch (e: any) {
      if (e.message === "HASH_MISMATCH") return err("Hash verification failed — possible data tampering", 409);
      return err(e.message);
    }
  }
  async getAuditLog(filters?: any): Promise<ApiResponse<AccessLogEntry[]>> {
    try { return ok(await api.getAuditLog(filters?.patientId)); } catch (e: any) { return err(e.message); }
  }
  async getLedgerEvents(): Promise<ApiResponse<LedgerEvent[]>> {
    try { return ok(await api.getLedgerEvents()); } catch (e: any) { return err(e.message); }
  }
  async getOrganizations(): Promise<ApiResponse<any[]>> {
    try { return ok(await api.getOrganizations()); } catch (e: any) { return err(e.message); }
  }
  async addOrganization(data: { name: string; type: string }): Promise<ApiResponse<{ id: string }>> {
    try { return ok(await api.addOrganization(data)); } catch (e: any) { return err(e.message); }
  }
  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    try { return ok(await api.getAdminUsers()); } catch (e: any) { return err(e.message); }
  }
  async inviteUser(data: { name: string; email: string; role: string; orgId: string }): Promise<ApiResponse<{ userId: string }>> {
    try { return ok(await api.inviteUser(data)); } catch (e: any) { return err(e.message); }
  }
  async getSystemHealth(): Promise<ApiResponse<{ degraded: string[]; healthy: string[] }>> {
    const degraded = mockOrganizations.filter(o => o.node_status !== "active").map(o => o.name);
    const healthy = mockOrganizations.filter(o => o.node_status === "active").map(o => o.name);
    return ok({ degraded, healthy });
  }
  setFailureRate(rate: number) { api.setFailureRate(rate); }
}

export class BackendGateway extends MockGateway {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

  private async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      return { data, ok: res.ok, status: res.status, error: res.ok ? undefined : data?.message, traceId: makeTraceId() };
    } catch (e: any) {
      return err<T>(e.message ?? "Network error", 503);
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const res = await this.request<{ accessToken: string }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) return err(res.error || "Login failed", res.status);
    return ok({ user: { email }, token: res.data.accessToken || "mock" });
  }

  async getRecords(params?: { patientId?: string }): Promise<ApiResponse<RecordMeta[]>> {
    const qs = params?.patientId ? `?patientId=${encodeURIComponent(params.patientId)}` : "";
    const res = await this.request<RecordMeta[]>(`/records${qs}`);
    return res.ok ? ok(res.data ?? []) : err(res.error || "Failed to fetch records", res.status);
  }

  async getRecord(recordId: string): Promise<ApiResponse<RecordMeta | null>> {
    const res = await this.request<RecordMeta | null>(`/records/${recordId}`);
    return res.ok ? ok(res.data) : err(res.error || "Failed to fetch record", res.status);
  }

  async registerRecord(data: { patientId: string; type: string; title: string }): Promise<ApiResponse<{ recordId: string; hash: string; uri: string; status: RecordStatus }>> {
    const res = await this.request<{ txId: string; recordId: string; hash: string; uri: string }>(`/records/register`, {
      method: "POST",
      body: JSON.stringify({
        patientId: data.patientId,
        recordType: data.type,
        payload: { title: data.title, source: "frontend" },
      }),
    });

    if (!res.ok) return err(res.error || "Failed to register record", res.status);
    return ok({ ...res.data, status: "COMMITTED" });
  }

  async verifyRecord(recordId: string): Promise<ApiResponse<VerificationData>> {
    const res = await this.request<{ valid: boolean; computedHash: string; expectedHash: string }>(`/records/${recordId}/verify`, {
      method: "POST",
      body: JSON.stringify({ recordId }),
    });
    if (!res.ok) return err(res.error || "Verify failed", res.status);

    return ok({
      offchainHash: res.data.expectedHash,
      onchainAnchor: res.data.computedHash,
      status: res.data.valid ? "verified" : "mismatch",
      lastVerified: new Date().toISOString(),
      certIssuer: "MedChain Gateway",
      certValid: res.data.valid,
      endorsingOrgs: ["Org1", "Org2"],
      txHash: "N/A",
      blockNumber: 0,
      committedAt: new Date().toISOString(),
    });
  }
}

// =================== Singleton Export ===================
const useBackend = import.meta.env.VITE_USE_BACKEND === "true";
export const gateway: IMedChainGateway = useBackend ? new BackendGateway() : new MockGateway();
