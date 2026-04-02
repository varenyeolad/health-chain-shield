/**
 * PatientAudit — Patient-specific audit: who accessed MY data, linked consents, normal hours check.
 * Primary button: "Export" (ExportDialog)
 * Filters: organization, record type, action, date range
 * Columns: Record, Organization, Action, Purpose, Consent, Time, Hours Flag
 * Modals: ExportDialog
 * Toasts: "Export complete"
 * Empty state: "No access events match your filters"
 */
import { useState, useMemo } from "react";
import { mockAuditLog, mockConsents, mockAnomalies } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download, ScrollText, AlertTriangle, Shield, Clock, Eye } from "lucide-react";

function isAfterHours(ts: string) {
  const h = new Date(ts).getHours();
  return h < 6 || h > 22;
}

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
  const afterHoursCount = mockAuditLog.filter(a => isAfterHours(a.timestamp)).length;
  const noConsentCount = mockAuditLog.filter(a => !a.consent_id).length;
  const recentProviders = [...new Set(mockAuditLog.slice(0, 5).map(a => a.grantee_org))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Access Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every access to your records is permanently logged on the immutable ledger. Review who accessed your data, when, and under which consent.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Patient-specific insight widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <Eye className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockAuditLog.length}</p>
          <p className="text-xs text-muted-foreground">Total access events</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <Shield className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockAuditLog.length - noConsentCount}</p>
          <p className="text-xs text-muted-foreground">With linked consent</p>
        </div>
        <div className={`rounded-lg border p-4 ${afterHoursCount > 0 ? "border-warning/30 bg-warning/5" : "border-border bg-card"}`}>
          <Clock className="h-4 w-4 text-warning-foreground mb-2" />
          <p className="text-2xl font-bold text-foreground">{afterHoursCount}</p>
          <p className="text-xs text-muted-foreground">After-hours accesses</p>
        </div>
        <div className={`rounded-lg border p-4 ${noConsentCount > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <AlertTriangle className="h-4 w-4 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{noConsentCount}</p>
          <p className="text-xs text-muted-foreground">Without consent link</p>
        </div>
      </div>

      {/* Recent providers accessing data */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Recent organizations accessing your data</h3>
        <div className="flex flex-wrap gap-2">
          {recentProviders.map(p => (
            <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{p}</span>
          ))}
        </div>
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
          <div key={a.access_id} className="relative">
            <AuditEventRow entry={a} className={isAfterHours(a.timestamp) ? "border-warning/40" : undefined} />
            <div className="absolute top-2 right-2 flex gap-1">
              {isAfterHours(a.timestamp) && (
                <span className="text-[9px] font-medium bg-warning/15 text-warning-foreground px-1.5 py-0.5 rounded">After hours</span>
              )}
              {a.consent_id && (
                <span className="text-[9px] font-medium bg-success/15 text-success px-1.5 py-0.5 rounded">Consent: {a.consent_id}</span>
              )}
              {!a.consent_id && (
                <span className="text-[9px] font-medium bg-destructive/15 text-destructive px-1.5 py-0.5 rounded">No consent</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={ScrollText} title="No access events" description="No access events match your current filters." />
        )}
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Patient Audit Log" recordCount={filtered.length} />
    </div>
  );
}
