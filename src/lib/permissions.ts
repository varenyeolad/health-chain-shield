/**
 * Role-based permission system.
 * Maps roles to allowed route prefixes and specific action permissions.
 */
import type { UserRole } from "@/types/medical";

export interface Permission {
  routes: string[];
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  patient: {
    routes: ["/patient", "/settings", "/help"],
    actions: ["view_own_records", "manage_consents", "view_audit", "share_records", "manage_keys", "export_audit"],
  },
  provider: {
    routes: ["/provider", "/emergency-access", "/settings", "/help"],
    actions: ["view_patients", "register_records", "view_requests", "manage_integrations", "view_audit", "export_audit", "emergency_access"],
  },
  consumer: {
    routes: ["/consumer", "/emergency-access", "/settings", "/help"],
    actions: ["search_patients", "request_access", "retrieve_records", "view_audit", "export_audit", "emergency_access"],
  },
  regulator: {
    routes: ["/regulator", "/settings", "/help"],
    actions: ["view_all_audit", "view_compliance", "export_reports", "view_anomalies"],
  },
  admin: {
    routes: ["/admin", "/settings", "/help"],
    actions: ["manage_orgs", "manage_users", "manage_policies", "view_network", "manage_failure_injection"],
  },
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.routes.some(prefix => path.startsWith(prefix));
}

export function hasAction(role: UserRole, action: string): boolean {
  return ROLE_PERMISSIONS[role].actions.includes(action);
}

export function getDefaultRoute(role: UserRole): string {
  const defaults: Record<UserRole, string> = {
    patient: "/patient/dashboard",
    provider: "/provider/dashboard",
    consumer: "/consumer/dashboard",
    regulator: "/regulator/dashboard",
    admin: "/admin/dashboard",
  };
  return defaults[role];
}
