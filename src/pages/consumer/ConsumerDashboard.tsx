/**
 * Enhanced ConsumerDashboard — KPIs: active requests, granted, success rate, avg time, failed verifications.
 */
import { useAuth } from "@/contexts/AuthContext";
import { mockAccessRequests, mockAuditLog } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { Search, Shield, Download, ScrollText, CheckCircle2, XCircle, TrendingUp, Clock } from "lucide-react";

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const consumerOrg = user?.orgName || "Metro Health Network";
  const orgRequests = mockAccessRequests.filter(r => r.requester_org === consumerOrg);
  const orgAudit = mockAuditLog.filter(a => a.grantee_org === consumerOrg);
  const approved = orgRequests.filter(r => r.status === "approved").length;
  const denied = orgRequests.filter(r => r.status === "denied").length;
  const pending = orgRequests.filter(r => r.status === "pending").length;
  const downloads = orgAudit.filter(a => a.action === "DOWNLOAD").length;

  const stats = [
    { label: "Active Requests", value: pending, icon: Clock, sub: "Awaiting patient review", link: "/consumer/request-access", alert: pending > 0 },
    { label: "Granted Access", value: approved, icon: CheckCircle2, sub: "Consent received", link: "/consumer/retrieve" },
    { label: "Records Retrieved", value: orgAudit.length, icon: Download, sub: `${downloads} downloads`, link: "/consumer/audit" },
    { label: "Rejected Requests", value: denied, icon: XCircle, sub: "Review denied requests", link: "/consumer/request-access", alert: denied > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Consumer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {consumerOrg} · Request, retrieve, and audit patient record access.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className={`rounded-lg border bg-card p-4 hover:shadow-md transition-all ${stat.alert ? "border-warning/30 bg-warning/5" : "border-border"}`}>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground">Search for Patient Records</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Use Patient Search to find records by pseudonymous ID, then request access through the consent workflow.
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <Link to="/consumer/patient-search" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Search className="h-4 w-4" /> Search Patients
          </Link>
          <Link to="/consumer/request-access" className="inline-flex items-center gap-1.5 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Shield className="h-4 w-4" /> New Request
          </Link>
        </div>
      </div>

      {/* Recent access purposes */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Your organization's access purposes</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(orgAudit.map(a => a.purpose))].map(p => (
            <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
