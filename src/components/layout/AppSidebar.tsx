import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/medical";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Shield, ScrollText, Share2, Key,
  Users, Inbox, Settings2, Search, Download,
  Building2, Network, BookOpen, UserCog,
  ChevronLeft, LogOut, Repeat,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  patient: [
    { title: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
    { title: "Records", path: "/patient/records", icon: FileText },
    { title: "Consents", path: "/patient/consents", icon: Shield },
    { title: "Audit Log", path: "/patient/audit", icon: ScrollText },
    { title: "Share", path: "/patient/share", icon: Share2 },
    { title: "Identity & Keys", path: "/patient/identity-keys", icon: Key },
  ],
  provider: [
    { title: "Dashboard", path: "/provider/dashboard", icon: LayoutDashboard },
    { title: "Patients", path: "/provider/patients", icon: Users },
    { title: "Requests", path: "/provider/requests", icon: Inbox },
    { title: "Audit Log", path: "/provider/audit", icon: ScrollText },
    { title: "Integrations", path: "/provider/integrations", icon: Settings2 },
  ],
  consumer: [
    { title: "Dashboard", path: "/consumer/dashboard", icon: LayoutDashboard },
    { title: "Patient Search", path: "/consumer/patient-search", icon: Search },
    { title: "Request Access", path: "/consumer/request-access", icon: Shield },
    { title: "Retrieve", path: "/consumer/retrieve", icon: Download },
    { title: "Audit Log", path: "/consumer/audit", icon: ScrollText },
  ],
  regulator: [
    { title: "Dashboard", path: "/regulator/dashboard", icon: LayoutDashboard },
    { title: "Audit", path: "/regulator/audit", icon: ScrollText },
    { title: "Compliance", path: "/regulator/compliance", icon: BookOpen },
  ],
  admin: [
    { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Organizations", path: "/admin/organizations", icon: Building2 },
    { title: "Network", path: "/admin/network", icon: Network },
    { title: "Policies", path: "/admin/policies", icon: BookOpen },
    { title: "Users", path: "/admin/users", icon: UserCog },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient Portal",
  provider: "Provider Console",
  consumer: "Consumer Console",
  regulator: "Regulator View",
  admin: "Admin Panel",
};

export function AppSidebar() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  if (!user) return null;

  const items = NAV_ITEMS[user.role];
  const roles: UserRole[] = ["patient", "provider", "consumer", "regulator", "admin"];

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg trust-gradient flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-sidebar-primary-foreground">MedChain</span>
              <p className="text-[10px] text-sidebar-muted">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role switcher (demo) */}
      <div className="p-2 border-t border-sidebar-border">
        {!collapsed && (
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs text-sidebar-muted hover:bg-sidebar-accent transition-colors"
            >
              <Repeat className="h-3 w-3" />
              <span>Switch Role (Demo)</span>
            </button>
            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 w-full mb-1 rounded-md bg-sidebar-accent border border-sidebar-border p-1 shadow-lg">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => { switchRole(role); setShowRoleSwitcher(false); }}
                    className={cn(
                      "w-full text-left rounded px-3 py-1.5 text-xs transition-colors",
                      user.role === role
                        ? "text-sidebar-primary bg-sidebar-accent"
                        : "text-sidebar-foreground hover:bg-sidebar-border"
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-primary shrink-0">
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-muted truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
