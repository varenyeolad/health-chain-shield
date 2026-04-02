/**
 * RegulatorCompliance — Compliance center: checks, anomalies, org scores, remediation, export.
 * Primary: "Export Report" | Tabs: Compliance Checks, Org Scores, Policy Templates
 * Severity cards: low/medium/high/critical | Issue list with remediation status
 */
import { useState } from "react";
import { mockComplianceChecks, mockOrgCompliance, mockPolicyTemplates, mockAnomalies } from "@/lib/mock-data";
import { ExportDialog } from "@/components/ExportDialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, BarChart3, BookOpen } from "lucide-react";

const CHECK_ICONS = { pass: CheckCircle2, warning: AlertTriangle, fail: XCircle };
const CHECK_COLORS = { pass: "text-success", warning: "text-warning-foreground", fail: "text-destructive" };

export default function RegulatorCompliance() {
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState<"checks" | "orgs" | "policies">("checks");

  const passCount = mockComplianceChecks.filter(c => c.status === "pass").length;
  const warnCount = mockComplianceChecks.filter(c => c.status === "warning").length;
  const failCount = mockComplianceChecks.filter(c => c.status === "fail").length;
  const unresolvedAnomalies = mockAnomalies.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Compliance Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Policy compliance verification, organizational scoring, and anomaly remediation tracking.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-2" /> Export Report</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="h-4 w-4 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{passCount}</p>
          <p className="text-xs text-muted-foreground">Checks passing</p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="h-4 w-4 text-warning-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{warnCount}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{failCount}</p>
          <p className="text-xs text-muted-foreground">Failing checks</p>
        </div>
        <div className={`rounded-lg border p-4 ${unresolvedAnomalies > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <ShieldCheck className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{unresolvedAnomalies}</p>
          <p className="text-xs text-muted-foreground">Unresolved anomalies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "checks" as const, label: "Compliance Checks", icon: ShieldCheck },
          { key: "orgs" as const, label: "Organization Scores", icon: BarChart3 },
          { key: "policies" as const, label: "Policy Templates", icon: BookOpen },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "checks" && (
        <div className="space-y-3">
          {mockComplianceChecks.map(c => {
            const Icon = CHECK_ICONS[c.status];
            return (
              <div key={c.id} className={`rounded-lg border bg-card p-4 ${c.status === "fail" ? "border-destructive/20" : c.status === "warning" ? "border-warning/20" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${CHECK_COLORS[c.status]}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{c.rule}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${c.status === "pass" ? "bg-success/15 text-success" : c.status === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/15 text-destructive"}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    <p className="text-xs text-foreground mt-2 bg-muted/50 rounded px-2 py-1">{c.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "orgs" && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issues</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Anomalies</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accesses</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Audit</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>{mockOrgCompliance.map(c => (
              <tr key={c.orgId} className="border-t border-border">
                <td className="px-4 py-3 text-foreground font-medium">{c.org}</td>
                <td className="px-4 py-3"><span className={c.score >= 90 ? "text-success font-bold" : c.score >= 80 ? "text-warning-foreground font-bold" : "text-destructive font-bold"}>{c.score}%</span></td>
                <td className="px-4 py-3 text-muted-foreground">{c.issues}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.anomalyCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.accessCount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.lastAudit).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${c.status === "compliant" ? "bg-success/15 text-success" : c.status === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/15 text-destructive"}`}>{c.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === "policies" && (
        <div className="space-y-3">{mockPolicyTemplates.map(p => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-foreground">{p.name}{p.isDefault && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p></div>
              <span className="text-xs text-muted-foreground capitalize">{p.type}</span>
            </div>
            <ul className="mt-2 space-y-1">{p.rules.map(r => <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success shrink-0" />{r}</li>)}</ul>
          </div>
        ))}</div>
      )}

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Compliance Report" recordCount={mockComplianceChecks.length} />
    </div>
  );
}
