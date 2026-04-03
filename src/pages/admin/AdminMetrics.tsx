/**
 * AdminMetrics — Research/evaluation metrics page.
 * Shows: latency, success rate, anomaly count, compliance, emergency KPIs.
 * Primary: "Export Report" | Secondary: "Refresh"
 * Toasts: "Report exported", "Metrics refreshed"
 * Empty state: n/a (always shows metrics)
 * Error state: "Failed to load system metrics"
 */
import { useState, useEffect } from "react";
import { mockMetrics, mockAnomalies, mockOrgCompliance, mockEmergencyAccess, type SystemMetrics } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { ExportDialog } from "@/components/ExportDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, CheckCircle2, AlertTriangle, Zap, Shield, Activity,
  BarChart3, TrendingUp, Download, RefreshCw, Loader2, FileText,
} from "lucide-react";

export default function AdminMetrics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setMetrics(mockMetrics); setLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
    toast({ title: "Metrics refreshed" });
  };

  if (error) return <ErrorState title="Failed to load system metrics" description="Could not retrieve evaluation data." traceId="TRC-METRICS" onRetry={() => { setError(false); setLoading(true); setTimeout(() => { setMetrics(mockMetrics); setLoading(false); }, 500); }} />;

  const anomalyBySeverity = {
    critical: mockAnomalies.filter(a => a.severity === "critical").length,
    high: mockAnomalies.filter(a => a.severity === "high").length,
    medium: mockAnomalies.filter(a => a.severity === "medium").length,
    low: mockAnomalies.filter(a => a.severity === "low").length,
  };

  const avgCompliance = mockOrgCompliance.length > 0
    ? Math.round(mockOrgCompliance.reduce((s, o) => s + o.score, 0) / mockOrgCompliance.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Evaluation Metrics</h1>
          <p className="text-sm text-muted-foreground mt-1">System performance, compliance, and research KPIs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Refresh
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      {/* Performance KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Performance</h2>
        <div className="grid grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : [
            { label: "Avg Record Registration", value: metrics!.avgRegistrationTime, icon: Clock, desc: "End-to-end registration latency" },
            { label: "Avg Retrieval Latency", value: metrics!.avgRetrievalLatency, icon: TrendingUp, desc: "Ciphertext retrieval + verification" },
            { label: "Consent Approval Time", value: metrics!.avgConsentApprovalTime, icon: Shield, desc: "Request to active consent" },
            { label: "Simulated Throughput", value: metrics!.simulatedThroughput, icon: BarChart3, desc: "Peak transaction processing" },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1"><kpi.icon className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{kpi.label}</span></div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Volume KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Data Volume</h2>
        <div className="grid grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : [
            { label: "Total Records", value: metrics!.totalRecords.toLocaleString() },
            { label: "Total Consents", value: metrics!.totalConsents.toLocaleString() },
            { label: "Audit Events", value: metrics!.totalAuditEvents.toLocaleString() },
            { label: "Failed Request Rate", value: metrics!.failedRequestRate },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Anomaly Detection</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(anomalyBySeverity).map(([sev, count]) => (
            <div key={sev} className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground capitalize">{sev} Severity</span>
              <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Summary */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-4 w-4" /> Compliance</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Average Compliance Score</span>
            <p className="text-3xl font-bold text-foreground mt-1">{avgCompliance}%</p>
            <Progress value={avgCompliance} className="h-2 mt-2" />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Audit Log Completeness</span>
            <p className="text-3xl font-bold text-foreground mt-1">{loading ? "—" : metrics!.auditLogCompleteness}</p>
            <Progress value={loading ? 0 : parseFloat(metrics!.auditLogCompleteness)} className="h-2 mt-2" />
          </div>
        </div>
      </div>

      {/* Emergency Access */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4" /> Emergency Access</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Total Emergency Events</span>
            <p className="text-2xl font-bold text-foreground mt-1">{mockEmergencyAccess.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Post-Audit Complete</span>
            <p className="text-2xl font-bold text-foreground mt-1">{mockEmergencyAccess.filter(e => e.post_audit_complete).length}/{mockEmergencyAccess.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Active Now</span>
            <p className="text-2xl font-bold text-foreground mt-1">{mockEmergencyAccess.filter(e => e.status === "active").length}</p>
          </div>
        </div>
      </div>

      {/* Org Compliance Table */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Organization Compliance Ranking</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issues</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Accesses</th>
              </tr>
            </thead>
            <tbody>
              {mockOrgCompliance.sort((a, b) => b.score - a.score).map(org => (
                <tr key={org.orgId} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{org.org}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Progress value={org.score} className="h-1.5 w-16" /><span className="text-xs font-mono">{org.score}%</span></div></td>
                  <td className="px-4 py-3"><Badge variant={org.status === "compliant" ? "default" : org.status === "warning" ? "secondary" : "destructive"} className="text-[10px]">{org.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{org.issues}</td>
                  <td className="px-4 py-3 text-muted-foreground">{org.accessCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Evaluation Report" />
    </div>
  );
}
