import { mockRecords, mockConsents, mockAuditLog, mockLedgerEvents, mockUsers, mockOrganizations } from "./mock-data";
import type { UserRole } from "@/types/medical";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async login(email: string, _password: string) {
    await delay(800);
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user) return { success: true, user, token: "mock-jwt-token" };
    // Default to patient for demo
    return { success: true, user: mockUsers.patient, token: "mock-jwt-token" };
  },

  async getRecords(patientId?: string) {
    await delay(400);
    return patientId ? mockRecords.filter(r => r.patient_id === patientId) : mockRecords;
  },

  async getRecord(recordId: string) {
    await delay(300);
    return mockRecords.find(r => r.record_id === recordId) || null;
  },

  async getConsents(patientId: string) {
    await delay(400);
    return mockConsents.filter(c => c.patient_id === patientId);
  },

  async getAuditLog(patientId?: string) {
    await delay(500);
    return mockAuditLog;
  },

  async getLedgerEvents() {
    await delay(400);
    return mockLedgerEvents;
  },

  async getOrganizations() {
    await delay(300);
    return mockOrganizations;
  },

  async getUserByRole(role: UserRole) {
    await delay(200);
    return mockUsers[role];
  },
};
