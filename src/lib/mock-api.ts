import { mockRecords, mockConsents, mockAuditLog, mockLedgerEvents, mockUsers, mockOrganizations, mockPatients, mockAccessRequests, mockProviderRequests, mockIntegrations, mockAdminUsers, mockPolicyTemplates, mockShareLinks } from "./mock-data";
import type { UserRole, RecordStatus } from "@/types/medical";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Failure injection: set to > 0 to simulate random failures
let failureRate = 0.0;

function mayFail() {
  if (Math.random() < failureRate) throw new Error("SIMULATED_FAILURE");
}

export const api = {
  setFailureRate(rate: number) { failureRate = Math.max(0, Math.min(1, rate)); },
  getFailureRate() { return failureRate; },

  // Auth
  async login(email: string, _password: string) {
    await delay(800);
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user) return { success: true, user, token: "mock-jwt-token" };
    return { success: true, user: mockUsers.patient, token: "mock-jwt-token" };
  },

  // Records
  async getRecords(patientId?: string) {
    await delay(400); mayFail();
    return patientId ? mockRecords.filter(r => r.patient_id === patientId) : mockRecords;
  },

  async getRecord(recordId: string) {
    await delay(300); mayFail();
    return mockRecords.find(r => r.record_id === recordId) || null;
  },

  // Record registration flow (provider)
  async registerRecord(data: { patientId: string; type: string; title: string; file?: File }) {
    // Step 1: upload & encrypt
    await delay(1200); mayFail();
    const hash = "sha256:" + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const uri = "ipfs://Qm" + Array.from({ length: 8 }, () => String.fromCharCode(65 + Math.random() * 26)).join("");

    // Step 2: submit tx
    await delay(800); mayFail();
    const recordId = "rec-" + Math.random().toString(36).substr(2, 6);

    return { recordId, hash, uri, status: "DRAFT" as RecordStatus };
  },

  async advanceRecordStatus(recordId: string, currentStatus: RecordStatus): Promise<RecordStatus> {
    await delay(1000); mayFail();
    const flow: Record<string, RecordStatus> = {
      DRAFT: "PENDING_ENDORSEMENT",
      PENDING_ENDORSEMENT: "ORDERED",
      ORDERED: "COMMITTED",
    };
    return flow[currentStatus] || "COMMITTED";
  },

  // Consents
  async getConsents(patientId: string) {
    await delay(400); mayFail();
    return mockConsents.filter(c => c.patient_id === patientId);
  },

  async getConsent(policyId: string) {
    await delay(300); mayFail();
    return mockConsents.find(c => c.policy_id === policyId) || null;
  },

  async grantConsent(requestId: string) {
    await delay(1000); mayFail();
    return { success: true, policyId: "cns-" + Math.random().toString(36).substr(2, 3) };
  },

  async revokeConsent(policyId: string) {
    await delay(800); mayFail();
    return { success: true };
  },

  // Access requests
  async getAccessRequests(patientId?: string) {
    await delay(400); mayFail();
    return patientId ? mockAccessRequests.filter(r => r.patient_id === patientId) : mockAccessRequests;
  },

  async createAccessRequest(data: { patientPseudonym: string; scopeTypes: string[]; purpose: string; urgency: string }) {
    await delay(800); mayFail();
    return { success: true, requestId: "req-" + Math.random().toString(36).substr(2, 3) };
  },

  // Audit
  async getAuditLog(_patientId?: string) {
    await delay(500); mayFail();
    return mockAuditLog;
  },

  async getLedgerEvents() {
    await delay(400); mayFail();
    return mockLedgerEvents;
  },

  // Organizations
  async getOrganizations() {
    await delay(300); mayFail();
    return mockOrganizations;
  },

  async addOrganization(data: { name: string; type: string }) {
    await delay(600); mayFail();
    return { success: true, id: "org-" + Math.random().toString(36).substr(2, 3) };
  },

  // Users
  async getUserByRole(role: UserRole) {
    await delay(200);
    return mockUsers[role];
  },

  // Patients (provider view)
  async getPatients() {
    await delay(400); mayFail();
    return mockPatients;
  },

  // Provider requests
  async getProviderRequests() {
    await delay(400); mayFail();
    return mockProviderRequests;
  },

  async resolveProviderRequest(requestId: string, action: "approve" | "deny") {
    await delay(600); mayFail();
    return { success: true };
  },

  // Integrations
  async getIntegrations() {
    await delay(300); mayFail();
    return mockIntegrations;
  },

  async retryIntegration(name: string) {
    await delay(1500); mayFail();
    return { success: true };
  },

  // Consumer retrieve flow
  async retrieveRecord(recordId: string) {
    // Step 1: Fetch ciphertext
    await delay(800); mayFail();
    // Step 2: Verify hash
    await delay(600); mayFail();
    const hashMatch = Math.random() > 0.1; // 10% chance of mismatch
    if (!hashMatch) throw new Error("HASH_MISMATCH");
    // Step 3: Request decryption key
    await delay(500); mayFail();
    // Step 4: Decrypt
    await delay(400);
    return { success: true, verified: true };
  },

  // Admin users
  async getAdminUsers() {
    await delay(400); mayFail();
    return mockAdminUsers;
  },

  async inviteUser(data: { name: string; email: string; role: string; orgId: string }) {
    await delay(600); mayFail();
    return { success: true, userId: "u-" + Math.random().toString(36).substr(2, 3) };
  },

  // Policies
  async getPolicyTemplates() {
    await delay(300); mayFail();
    return mockPolicyTemplates;
  },

  // Share links
  async getShareLinks() {
    await delay(300); mayFail();
    return mockShareLinks;
  },

  async createShareLink(data: { scopeTypes: string[]; purpose: string; duration: string; isEmergency: boolean }) {
    await delay(600); mayFail();
    return { success: true, url: "https://medchain.io/s/" + Math.random().toString(36).substr(2, 6), id: "shr-" + Math.random().toString(36).substr(2, 3) };
  },

  async revokeShareLink(linkId: string) {
    await delay(400); mayFail();
    return { success: true };
  },
};
