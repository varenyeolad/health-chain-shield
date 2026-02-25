import { mockRecords, mockConsents, mockAuditLog, mockLedgerEvents } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { RecordCard } from "@/components/RecordCard";
import { ConsentCard } from "@/components/ConsentCard";
import { AuditEventRow } from "@/components/AuditEventRow";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Shield, ScrollText, Activity, TrendingUp, Clock } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const records = mockRecords.slice(0, 3);
  const activeConsents = mockConsents.filter(c => c.status === "ACTIVE");
  const recentAudit = mockAuditLog.slice(0, 3);
  const recentEvents = mockLedgerEvents.slice(0, 3);

  const stats = [
    { label: "Total Records", value: mockRecords.length, icon: FileText, trend: "+2 this month" },
    { label: "Active Consents", value: activeConsents.length, icon: Shield, trend: "All reviewed" },
    { label: "Access Events", value: mockAuditLog.length, icon: ScrollText, trend: "Last 30 days" },
    { label: "Pending", value: mockConsents.filter(c => c.status === "PENDING").length, icon: Clock, trend: "Action needed" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your health data is secure. Here's an overview of your records and consents.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Records */}
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Records</h2>
          <div className="space-y-3">
            {records.map(r => (
              <RecordCard key={r.record_id} record={r} />
            ))}
          </div>
        </div>

        {/* Active Consents */}
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Active Consents</h2>
          <div className="space-y-3">
            {activeConsents.map(c => (
              <ConsentCard key={c.policy_id} consent={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Access Activity */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Access Activity</h2>
        <div className="space-y-2">
          {recentAudit.map(a => (
            <AuditEventRow key={a.access_id} entry={a} />
          ))}
        </div>
      </div>

      {/* Ledger Timeline */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Ledger Activity</h2>
        <LedgerTimeline events={recentEvents} />
      </div>
    </div>
  );
}
