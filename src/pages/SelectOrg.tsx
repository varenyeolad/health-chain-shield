/**
 * SelectOrg — Multi-org user selects their active organization.
 * Primary button: "Continue" (per org card)
 * Secondary: "Sign out"
 * Filters: search organizations
 * Empty state: "No organizations found"
 * Error state: "Failed to load organizations"
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockOrganizations } from "@/lib/mock-data";
import { OrgBadge } from "@/components/OrgBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, ArrowRight, LogOut, Clock } from "lucide-react";

const ROLE_ROUTES: Record<string, string> = {
  patient: "/patient/dashboard",
  provider: "/provider/dashboard",
  consumer: "/consumer/dashboard",
  regulator: "/regulator/dashboard",
  admin: "/admin/dashboard",
};

export default function SelectOrg() {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const orgs = mockOrganizations.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (orgId: string) => {
    navigate(ROLE_ROUTES[user?.role || "patient"] || "/patient/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg trust-gradient flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">MedChain</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Sign out</Button>
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Select Organization</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose which organization context to work in.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search organizations…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="space-y-2">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <OrgBadge org={org} />
                <span className="text-xs text-muted-foreground capitalize">{org.type}</span>
              </div>
              <div className="flex items-center gap-2">
                {org.id === "org-001" && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> Last used
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
          {orgs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No organizations found matching "{search}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
