/**
 * Enhanced RegulatorDashboard — KPIs: flagged anomalies, org ranking, emergency access, unresolved, total audited.
 */
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { mockLedgerEvents, mockAnomalies, mockOrgCompliance, mockEmergencyAccess, mockAuditLog } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { ScrollText, AlertTriangle, BarChart3, Zap, ShieldCheck, XCircle } from "lucide-react";

export default function RegulatorDashboard() {
  const unresolvedAnomalies = mockAnomalies.filter(a => !a.resolved).length;
  const criticalAnomalies = mockAnomalies.filter(a => a.severity === "critical" || a.severity === "high").length;
  const emergencyCount = mockEmergencyAccess.length;
  const nonCompliantOrgs = mockOrgCompliance.filter(o => o.status === "non-compliant").length;
  const pendingAudits = mockEmergencyAccess.filter(e => !e.post_audit_complete).length;

  const stats = [
    { label: "Flagged Anomalies", value: unresolvedAnomalies, icon: AlertTriangle, sub: `${criticalAnomalies} high/critical`, link: "/regulator/audit", alert: unresolvedAnomalies > 0 },
    { label: "Non-Compliant Orgs", value: nonCompliantOrgs, icon: XCircle, sub: `of ${mockOrgCompliance.length} monitored`, link: "/regulator/compliance", alert: nonCompliantOrgs > 0 },
    { label: "Emergency Access Events", value: emergencyCount, icon: Zap, sub: `${pendingAudits} pending audit`, link: "/regulator/audit" },
    { label: "Total Audited Events", value: mockAuditLog.length, icon: ScrollText, sub: "Last 30 days", link: "/regulator/audit" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Regulator Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Read-only oversight of consortium activity, anomaly detection, and compliance monitoring.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className={`rounded-lg border bg-card p-4 hover:shadow-md transition-all ${stat.alert ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
            <stat.icon className={`h-4 w-4 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Org compliance ranking */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Organization Compliance Ranking</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Anomalies</th>
            </tr></thead>
            <tbody>{mockOrgCompliance.map(c => (
              <tr key={c.orgId} className="border-t border-border">
                <td className="px-4 py-3 text-foreground font-medium">{c.org}</td>
                <td className="px-4 py-3"><span className={c.score >= 90 ? "text-success font-bold" : c.score >= 80 ? "text-warning-foreground font-bold" : "text-destructive font-bold"}>{c.score}%</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${c.status === "compliant" ? "bg-success/15 text-success" : c.status === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/15 text-destructive"}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{c.anomalyCount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Ledger Activity</h2>
        <LedgerTimeline events={mockLedgerEvents} />
      </div>
    </div>
  );
}
