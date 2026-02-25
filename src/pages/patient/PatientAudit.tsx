/**
 * PatientAudit — Audit log with filters, drill-down, export.
 * Primary button: "Export" (ExportDialog)
 * Filters: organization (dropdown), record type (dropdown), action (dropdown), date range
 * Table columns: Record, Organization, Action, Purpose, Date/Time, Consent ID
 * Modals: ExportDialog
 * Toasts: "Export complete"
 * Empty state: "No access events match your filters"
 * Error state: "Failed to load audit log"
 */
import { useState, useMemo } from "react";
import { mockAuditLog } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, ScrollText } from "lucide-react";

export default function PatientAudit() {
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return mockAuditLog.filter(a => {
      if (search && !a.record_title.toLowerCase().includes(search.toLowerCase()) && !a.grantee_org.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.org && filters.org !== "all" && a.grantee_org !== filters.org) return false;
      if (filters.action && filters.action !== "all" && a.action !== filters.action) return false;
      return true;
    });
  }, [search, filters]);

  const uniqueOrgs = [...new Set(mockAuditLog.map(a => a.grantee_org))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every access to your records is permanently recorded on the immutable ledger.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <AdvancedFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search records or organizations…"
        chips={[
          { key: "org", label: "Organization", options: uniqueOrgs.map(o => ({ value: o, label: o })) },
          { key: "action", label: "Action", options: [
            { value: "VIEW", label: "View" },
            { value: "DOWNLOAD", label: "Download" },
            { value: "VERIFY", label: "Verify" },
            { value: "SHARE", label: "Share" },
          ]},
        ]}
        chipValues={filters}
        onChipChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
      />

      <div className="space-y-2">
        {filtered.map(a => (
          <AuditEventRow key={a.access_id} entry={a} />
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={ScrollText} title="No access events" description="No access events match your current filters." />
        )}
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Audit Log" recordCount={filtered.length} />
    </div>
  );
}
