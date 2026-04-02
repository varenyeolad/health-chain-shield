/**
 * Enhanced PatientDashboard — KPIs, suspicious events, recent providers, pending actions.
 */
import { mockRecords, mockConsents, mockAuditLog, mockLedgerEvents, mockAnomalies, mockNotifications } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { RecordCard } from "@/components/RecordCard";
import { ConsentCard } from "@/components/ConsentCard";
import { AuditEventRow } from "@/components/AuditEventRow";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { Link } from "react-router-dom";
import { FileText, Shield, ScrollText, Clock, AlertTriangle, Eye, Zap } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const records = mockRecords.filter(r => r.patient_id === "pat-001").slice(0, 3);
  const activeConsents = mockConsents.filter(c => c.status === "ACTIVE");
  const pendingConsents = mockConsents.filter(c => c.status === "PENDING");
  const recentAudit = mockAuditLog.slice(0, 3);
  const recentEvents = mockLedgerEvents.slice(0, 3);
  const suspiciousCount = mockAnomalies.filter(a => !a.resolved).length;
  const unreadNotifs = mockNotifications.filter(n => !n.read).length;
  const recentProviders = [...new Set(mockAuditLog.slice(0, 10).map(a => a.grantee_org))];
  const afterHoursCount = mockAuditLog.filter(a => { const h = new Date(a.timestamp).getHours(); return h < 6 || h > 22; }).length;

  const stats = [
    { label: "Total Records", value: mockRecords.filter(r => r.patient_id === "pat-001").length, icon: FileText, trend: "+2 this month", color: "" },
    { label: "Active Consents", value: activeConsents.length, icon: Shield, trend: "All reviewed", color: "" },
    { label: "Access Events", value: mockAuditLog.length, icon: ScrollText, trend: "Last 30 days", color: "" },
    { label: "Pending Requests", value: pendingConsents.length, icon: Clock, trend: "Action needed", color: pendingConsents.length > 0 ? "border-warning/30 bg-warning/5" : "" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your health data is secure. Here's an overview of your records and activity.
        </p>
      </div>

      {/* Alert banners */}
      {suspiciousCount > 0 && (
        <Link to="/patient/audit" className="block rounded-lg border border-destructive/30 bg-destructive/5 p-4 hover:bg-destructive/10 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">{suspiciousCount} suspicious event{suspiciousCount > 1 ? "s" : ""} detected</p>
              <p className="text-xs text-muted-foreground">{afterHoursCount} after-hours access{afterHoursCount > 1 ? "es" : ""} in recent activity. Review your audit log.</p>
            </div>
          </div>
        </Link>
      )}

      {pendingConsents.length > 0 && (
        <Link to="/patient/consents" className="block rounded-lg border border-warning/30 bg-warning/5 p-4 hover:bg-warning/10 transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-warning-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{pendingConsents.length} consent request{pendingConsents.length > 1 ? "s" : ""} awaiting your review</p>
              <p className="text-xs text-muted-foreground">Organizations are requesting access to your records.</p>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-lg border border-border bg-card p-4 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent providers */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Recent organizations accessing your data</h3>
        <div className="flex flex-wrap gap-2">
          {recentProviders.map(p => (
            <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{p}</span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Records</h2>
          <div className="space-y-3">
            {records.map(r => <RecordCard key={r.record_id} record={r} />)}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Active Consents</h2>
          <div className="space-y-3">
            {activeConsents.map(c => <ConsentCard key={c.policy_id} consent={c} />)}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Access Activity</h2>
        <div className="space-y-2">
          {recentAudit.map(a => <AuditEventRow key={a.access_id} entry={a} />)}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Ledger Activity</h2>
        <LedgerTimeline events={recentEvents} />
      </div>
    </div>
  );
}
