/**
 * ProviderIntegrations — FHIR mapping status, gateway health, queue, retries.
 * Primary: "Retry" per failed integration | Columns: Name, Type, Status, Pending, Failed
 * Toasts: "Retry initiated"
 */
import { useState } from "react";
import { mockIntegrations } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export default function ProviderIntegrations() {
  const { toast } = useToast();
  const [retrying, setRetrying] = useState<string | null>(null);

  const handleRetry = async (name: string) => {
    setRetrying(name);
    try { await api.retryIntegration(name); toast({ title: "Retry successful", description: `${name} is now healthy.` }); }
    catch { toast({ title: "Retry failed", variant: "destructive" }); }
    finally { setRetrying(null); }
  };

  const statusIcon = (s: string) => s === "healthy" ? <CheckCircle2 className="h-4 w-4 text-success" /> : s === "degraded" ? <AlertTriangle className="h-4 w-4 text-warning-foreground" /> : <XCircle className="h-4 w-4 text-destructive" />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">FHIR gateway health, message queues, and storage status.</p></div>
      <div className="space-y-3">{mockIntegrations.map(int => (
        <div key={int.name} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusIcon(int.status)}
              <div>
                <p className="text-sm font-medium text-foreground">{int.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{int.type.replace("_", " ")} · Last checked: {new Date(int.lastChecked).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Pending: {int.pending}</span><span>Failed: {int.failed}</span>
              {(int.status !== "healthy" || int.failed > 0) && (
                <Button size="sm" variant="outline" onClick={() => handleRetry(int.name)} disabled={retrying === int.name}>
                  {retrying === int.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />} Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}</div>
    </div>
  );
}
