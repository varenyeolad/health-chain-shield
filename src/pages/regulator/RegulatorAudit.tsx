/**
 * RegulatorAudit — Aggregated audit with org/patient/record drilldown + export.
 * Filters: org, action, date | Anomaly widgets | Export dialog
 */
import { useState, useMemo } from "react";
import { mockAuditLog } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Clock, ScrollText } from "lucide-react";

export default function RegulatorAudit() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = useMemo(() => mockAuditLog.filter(a => {
    if (search && !a.record_title.toLowerCase().includes(search.toLowerCase()) && !a.grantee_org.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.org && filters.org !== "all" && a.grantee_org !== filters.org) return false;
    if (filters.action && filters.action !== "all" && a.action !== filters.action) return false;
    return true;
  }), [search, filters]);

  const uniqueOrgs = [...new Set(mockAuditLog.map(a => a.grantee_org))];
  const afterHoursCount = mockAuditLog.filter(a => { const h = new Date(a.timestamp).getHours(); return h < 6 || h > 22; }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Regulatory Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated access logs across the consortium.</p></div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-2" /> Export</Button>
      </div>

      {/* Anomaly widgets */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="h-4 w-4 text-warning-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{afterHoursCount}</p>
          <p className="text-xs text-muted-foreground">After-hours accesses</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-xs text-muted-foreground">Failed access attempts</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <Clock className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockAuditLog.length}</p>
          <p className="text-xs text-muted-foreground">Total events (30 days)</p>
        </div>
      </div>

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
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Regulatory Audit" recordCount={filtered.length} />
    </div>
  );
}
