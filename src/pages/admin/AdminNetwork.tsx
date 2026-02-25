/**
 * AdminNetwork — Consortium node status, channels/private data concept.
 * Columns: Node, Organization, Status, Block Height, Peers | Primary: "Refresh"
 */
import { useState } from "react";
import { mockOrganizations } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Network, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2, Sliders } from "lucide-react";

const mockNodes = mockOrganizations.map((org, i) => ({
  id: `node-${i}`, org: org.name, status: org.node_status || "active",
  blockHeight: 48300 - i * 5, peers: Math.max(1, mockOrganizations.length - 1 - i),
  channel: "medchain-main",
}));

export default function AdminNetwork() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [failureRate, setFailureRate] = useState(0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
    toast({ title: "Network status refreshed" });
  };

  const handleFailureRate = (rate: number) => {
    setFailureRate(rate);
    api.setFailureRate(rate / 100);
    toast({ title: `Failure rate set to ${rate}%`, description: rate > 0 ? "API calls may now randomly fail for testing." : "Failure injection disabled." });
  };

  const statusIcon = (s: string) => s === "active" ? <CheckCircle2 className="h-4 w-4 text-success" /> : s === "syncing" ? <AlertTriangle className="h-4 w-4 text-warning-foreground" /> : <XCircle className="h-4 w-4 text-destructive" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Consortium node status and channel overview.</p></div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Refresh
        </Button>
      </div>

      {/* Dev panel: failure injection */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2"><Sliders className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Dev Panel: Failure Injection</span></div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">API Failure Rate:</Label>
          <Input type="number" min={0} max={100} value={failureRate} onChange={e => handleFailureRate(Number(e.target.value))} className="w-20 text-xs" />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50"><th className="px-4 py-3 text-left font-medium text-muted-foreground">Node</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Block Height</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peers</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Channel</th></tr></thead>
          <tbody>{mockNodes.map(n => (
            <tr key={n.id} className="border-t border-border"><td className="px-4 py-3 font-mono text-xs text-foreground">{n.id}</td>
              <td className="px-4 py-3 text-foreground">{n.org}</td>
              <td className="px-4 py-3"><span className="flex items-center gap-1.5 capitalize">{statusIcon(n.status)} {n.status}</span></td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{n.blockHeight}</td>
              <td className="px-4 py-3 text-muted-foreground">{n.peers}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{n.channel}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
