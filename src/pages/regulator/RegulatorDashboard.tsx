import { LedgerTimeline } from "@/components/LedgerTimeline";
import { mockLedgerEvents, mockAuditLog } from "@/lib/mock-data";
import { ScrollText, AlertTriangle, BarChart3 } from "lucide-react";

export default function RegulatorDashboard() {
  const stats = [
    { label: "Total Audit Events", value: 1248, icon: ScrollText },
    { label: "Anomalies Detected", value: 3, icon: AlertTriangle },
    { label: "Organizations Monitored", value: 67, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Regulator Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Read-only oversight of consortium activity and compliance</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Ledger Activity</h2>
        <LedgerTimeline events={mockLedgerEvents} />
      </div>
    </div>
  );
}
