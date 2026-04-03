/**
 * ProviderFhirCenter — Full FHIR interoperability view.
 * Primary: "Retry Failed" | Secondary: "Refresh All", "Export Report"
 * Table columns: Record Type, FHIR Resource, Status, Coverage, Issues, Last Validated
 * Filters: Status (all/mapped/partial/missing/failed)
 * Toasts: "Retry initiated", "All mappings refreshed"
 * Empty state: "No FHIR mappings configured"
 * Error state: "Failed to load FHIR mappings"
 */
import { useState, useEffect } from "react";
import { mockFhirMappings, type FhirMapping } from "@/lib/mock-data";
import { FhirResourcePreview } from "@/components/FhirResourcePreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2, FileText, Download } from "lucide-react";

type FilterStatus = "all" | "mapped" | "partial" | "missing" | "validation_failed";

export default function ProviderFhirCenter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mappings, setMappings] = useState<FhirMapping[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<FhirMapping | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setMappings(mockFhirMappings); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = filter === "all" ? mappings : mappings.filter(m => m.mappingStatus === filter);
  const totalMapped = mappings.filter(m => m.mappingStatus === "mapped").length;
  const totalFailed = mappings.filter(m => m.mappingStatus === "validation_failed" || m.mappingStatus === "missing").length;
  const overallCoverage = mappings.length > 0
    ? Math.round(mappings.reduce((sum, m) => sum + (m.fieldsCovered / m.totalFields) * 100, 0) / mappings.length)
    : 0;

  const handleRetryAll = async () => {
    setRetryingAll(true);
    await new Promise(r => setTimeout(r, 2000));
    setRetryingAll(false);
    toast({ title: "All failed mappings retried" });
  };

  if (error) return <ErrorState title="Failed to load FHIR mappings" description="Could not connect to the FHIR gateway." traceId="TRC-FHIR-ERR" onRetry={() => { setError(false); setLoading(true); setTimeout(() => { setMappings(mockFhirMappings); setLoading(false); }, 600); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">FHIR Interoperability Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Resource mapping, schema validation, and transformation status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRetryAll} disabled={retryingAll || totalFailed === 0}>
            {retryingAll ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Retry Failed ({totalFailed})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Mappings", value: mappings.length, icon: FileText },
          { label: "Fully Mapped", value: totalMapped, icon: CheckCircle2 },
          { label: "Failed/Missing", value: totalFailed, icon: XCircle },
          { label: "Avg Coverage", value: `${overallCoverage}%`, icon: AlertTriangle },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4">
            {loading ? <Skeleton className="h-10 w-full" /> : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "mapped", "partial", "missing", "validation_failed"] as FilterStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {f === "all" ? "All" : f === "validation_failed" ? "Failed" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Mapping List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No mappings found" description="No FHIR resource mappings match the current filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.recordType} className="cursor-pointer hover:ring-1 hover:ring-primary/20 rounded-lg transition-all" onClick={() => setSelected(selected?.recordType === m.recordType ? null : m)}>
              <FhirResourcePreview mapping={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
