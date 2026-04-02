/**
 * ConsumerAudit — Org-level: requests made, successful retrievals, rejections, purpose log.
 * Primary: "Export" | Filters: action, patient, date
 * Columns: Record, Patient, Action, Purpose, Status, Timestamp
 * Widgets: Requests made, Granted, Retrieval success rate, Rejected
 */
import { useState, useMemo } from "react";
import { mockAuditLog, mockAccessRequests } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, ScrollText, Shield, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export default function ConsumerAudit() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exportOpen, setExportOpen] = useState(false);

  // Consumer sees accesses their org made
  const consumerOrg = "Metro Health Network";
  const consumerAudit = mockAuditLog.filter(a => a.grantee_org === consumerOrg);
  const orgRequests = mockAccessRequests.filter(r => r.requester_org === consumerOrg);

  const filtered = useMemo(() => consumerAudit.filter(a => {
    if (search && !a.record_title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.action && filters.action !== "all" && a.action !== filters.action) return false;
    return true;
  }), [search, filters, consumerAudit]);

  const approvedRequests = orgRequests.filter(r => r.status === "approved").length;
  const deniedRequests = orgRequests.filter(r => r.status === "denied").length;
  const downloads = consumerAudit.filter(a => a.action === "DOWNLOAD").length;
  const successRate = consumerAudit.length > 0 ? Math.round((consumerAudit.length / (consumerAudit.length + deniedRequests)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Consumer Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Records your organization ({consumerOrg}) has accessed, including purpose and consent basis.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <Shield className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{orgRequests.length}</p>
          <p className="text-xs text-muted-foreground">Total requests made</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <CheckCircle2 className="h-4 w-4 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{approvedRequests}</p>
          <p className="text-xs text-muted-foreground">Granted requests</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <TrendingUp className="h-4 w-4 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{successRate}%</p>
          <p className="text-xs text-muted-foreground">Retrieval success rate</p>
        </div>
        <div className={`rounded-lg border p-4 ${deniedRequests > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <XCircle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{deniedRequests}</p>
          <p className="text-xs text-muted-foreground">Rejected requests</p>
        </div>
      </div>

      {/* Purpose log */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Access purposes used by your organization</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(consumerAudit.map(a => a.purpose))].map(p => (
            <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{p}</span>
          ))}
        </div>
      </div>

      <AdvancedFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search records…"
        chips={[
          { key: "action", label: "Action", options: [{ value: "VIEW", label: "View" }, { value: "DOWNLOAD", label: "Download" }, { value: "VERIFY", label: "Verify" }] },
        ]}
        chipValues={filters} onChipChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} />

      <div className="space-y-2">
        {filtered.map(a => <AuditEventRow key={a.access_id} entry={a} />)}
        {filtered.length === 0 && <EmptyState icon={ScrollText} title="No events" description="Your organization has no access events recorded." />}
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Consumer Audit" recordCount={filtered.length} />
    </div>
  );
}
