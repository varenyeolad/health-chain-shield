/**
 * ProviderAudit — Org-level: records anchored, access served, failed retrievals, integration status.
 * Primary: "Export" | Filters: action, record, date
 * Columns: Record, Consumer Org, Action, Purpose, Status, Timestamp
 * Widgets: Records anchored, Access served, Failed attempts, Integration delivery
 */
import { useState, useMemo } from "react";
import { mockAuditLog, mockRecords, mockIntegrations } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, ScrollText, FileText, CheckCircle2, XCircle, Settings2 } from "lucide-react";

export default function ProviderAudit() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exportOpen, setExportOpen] = useState(false);

  // Provider sees access to records owned by their org
  const providerOrg = "Mercy General Hospital";
  const orgRecordIds = mockRecords.filter(r => r.owner_org === providerOrg).map(r => r.record_id);
  const providerAudit = mockAuditLog.filter(a => orgRecordIds.includes(a.record_id));

  const filtered = useMemo(() => providerAudit.filter(a => {
    if (search && !a.record_title.toLowerCase().includes(search.toLowerCase()) && !a.grantee_org.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.action && filters.action !== "all" && a.action !== filters.action) return false;
    return true;
  }), [search, filters, providerAudit]);

  const committedRecords = mockRecords.filter(r => r.owner_org === providerOrg && r.status === "COMMITTED").length;
  const pendingRecords = mockRecords.filter(r => r.owner_org === providerOrg && r.status === "PENDING_ENDORSEMENT").length;
  const failedIntegrations = mockIntegrations.filter(i => i.failed > 0).reduce((acc, i) => acc + i.failed, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Provider Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access events for records anchored by {providerOrg}. Track who accessed data your organization registered.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <FileText className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{committedRecords}</p>
          <p className="text-xs text-muted-foreground">Records anchored</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <CheckCircle2 className="h-4 w-4 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{providerAudit.length}</p>
          <p className="text-xs text-muted-foreground">Access events served</p>
        </div>
        <div className={`rounded-lg border p-4 ${pendingRecords > 0 ? "border-warning/30 bg-warning/5" : "border-border bg-card"}`}>
          <ScrollText className="h-4 w-4 text-warning-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingRecords}</p>
          <p className="text-xs text-muted-foreground">Pending endorsement</p>
        </div>
        <div className={`rounded-lg border p-4 ${failedIntegrations > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <XCircle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{failedIntegrations}</p>
          <p className="text-xs text-muted-foreground">Failed delivery jobs</p>
        </div>
      </div>

      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search records or consumer orgs…"
        chips={[
          { key: "action", label: "Action", options: [{ value: "VIEW", label: "View" }, { value: "DOWNLOAD", label: "Download" }, { value: "VERIFY", label: "Verify" }, { value: "SHARE", label: "Share" }] },
        ]}
        chipValues={filters} onChipChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} />

      <div className="space-y-2">
        {filtered.map(a => <AuditEventRow key={a.access_id} entry={a} />)}
        {filtered.length === 0 && <EmptyState icon={ScrollText} title="No events" description="No access events for your organization's records." />}
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Provider Audit" recordCount={filtered.length} />
    </div>
  );
}
