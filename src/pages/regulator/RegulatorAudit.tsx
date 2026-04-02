/**
 * RegulatorAudit — Aggregated: anomaly dashboard, per-org drilldown, suspicious patterns, export.
 * Primary: "Export" | Filters: org, action, severity, date
 * Widgets: after-hours, failed attempts, emergency overrides, hash mismatches
 * Columns: Record, Org, Action, Purpose, Timestamp, Flags
 */
import { useState, useMemo } from "react";
import { mockAuditLog, mockAnomalies, mockOrgCompliance } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Clock, ScrollText, ShieldAlert, Hash, Zap, XCircle } from "lucide-react";

const ANOMALY_LABELS: Record<string, string> = {
  after_hours: "After-hours access",
  excessive_access: "Excessive retrievals",
  consent_mismatch: "Consent scope mismatch",
  hash_mismatch: "Hash integrity failure",
  emergency_override: "Emergency override",
  failed_attempt: "Failed access attempt",
  outside_validity: "Outside consent validity",
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning-foreground",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive/20 text-destructive border border-destructive/30",
};

export default function RegulatorAudit() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState<"events" | "anomalies">("anomalies");

  const filtered = useMemo(() => mockAuditLog.filter(a => {
    if (search && !a.record_title.toLowerCase().includes(search.toLowerCase()) && !a.grantee_org.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.org && filters.org !== "all" && a.grantee_org !== filters.org) return false;
    if (filters.action && filters.action !== "all" && a.action !== filters.action) return false;
    return true;
  }), [search, filters]);

  const uniqueOrgs = [...new Set(mockAuditLog.map(a => a.grantee_org))];
  const afterHoursCount = mockAnomalies.filter(a => a.type === "after_hours").length;
  const failedCount = mockAnomalies.filter(a => a.type === "failed_attempt").length;
  const emergencyCount = mockAnomalies.filter(a => a.type === "emergency_override").length;
  const hashMismatchCount = mockAnomalies.filter(a => a.type === "hash_mismatch").length;
  const unresolvedCount = mockAnomalies.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Regulatory Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated access analysis, anomaly detection, and pattern monitoring across the consortium.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-2" /> Export</Button>
      </div>

      {/* Anomaly summary widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <Clock className="h-4 w-4 text-warning-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{afterHoursCount}</p>
          <p className="text-xs text-muted-foreground">After-hours accesses</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{failedCount}</p>
          <p className="text-xs text-muted-foreground">Failed attempts</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Zap className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{emergencyCount}</p>
          <p className="text-xs text-muted-foreground">Emergency overrides</p>
        </div>
        <div className={`rounded-lg border p-4 ${hashMismatchCount > 0 ? "border-destructive/40 bg-destructive/10" : "border-border bg-card"}`}>
          <Hash className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{hashMismatchCount}</p>
          <p className="text-xs text-muted-foreground">Hash mismatches</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <ScrollText className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockAuditLog.length}</p>
          <p className="text-xs text-muted-foreground">Total events (30d)</p>
        </div>
      </div>

      {/* Unresolved alert */}
      {unresolvedCount > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">{unresolvedCount} unresolved anomalies require attention</p>
            <p className="text-xs text-muted-foreground">Review the anomalies tab for details and recommended actions.</p>
          </div>
        </div>
      )}

      {/* Tabs: Anomalies | All Events */}
      <div className="flex gap-1 border-b border-border">
        {(["anomalies", "events"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "anomalies" ? `Anomalies (${mockAnomalies.length})` : `All Events (${mockAuditLog.length})`}
          </button>
        ))}
      </div>

      {tab === "anomalies" && (
        <div className="space-y-3">
          {/* Org compliance ranking */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Anomalies</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accesses</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>{mockOrgCompliance.map(c => (
                <tr key={c.orgId} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground font-medium">{c.org}</td>
                  <td className="px-4 py-3"><span className={c.score >= 90 ? "text-success" : c.score >= 80 ? "text-warning-foreground" : "text-destructive"}>{c.score}%</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.anomalyCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.accessCount}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${c.status === "compliant" ? "bg-success/15 text-success" : c.status === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/15 text-destructive"}`}>{c.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <h3 className="text-sm font-medium text-foreground mt-4">Detected Anomalies</h3>
          {mockAnomalies.map(a => (
            <div key={a.id} className={`rounded-lg border bg-card p-4 ${a.severity === "critical" ? "border-destructive/40" : a.severity === "high" ? "border-destructive/20" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${a.severity === "critical" || a.severity === "high" ? "text-destructive" : "text-warning-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.org} · {new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${SEVERITY_STYLES[a.severity]}`}>{a.severity}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.resolved ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{a.resolved ? "Resolved" : "Open"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "events" && (
        <>
          <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search records or organizations…"
            chips={[
              { key: "org", label: "Organization", options: uniqueOrgs.map(o => ({ value: o, label: o })) },
              { key: "action", label: "Action", options: [{ value: "VIEW", label: "View" }, { value: "DOWNLOAD", label: "Download" }, { value: "VERIFY", label: "Verify" }, { value: "SHARE", label: "Share" }] },
            ]}
            chipValues={filters} onChipChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} showDateRange />

          <div className="space-y-2">
            {filtered.map(a => <AuditEventRow key={a.access_id} entry={a} />)}
            {filtered.length === 0 && <EmptyState icon={ScrollText} title="No events" description="No events match your filters." />}
          </div>
        </>
      )}

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Regulatory Audit" recordCount={tab === "anomalies" ? mockAnomalies.length : filtered.length} />
    </div>
  );
}
