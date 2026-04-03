/**
 * AdminNetwork — Consortium visualization, certificate status, channel participation,
 * recent network events, failure injection dev panel.
 * Primary: "Refresh" | Secondary: "View Certificates"
 * Table columns: Node, Organization, Status, Block Height, Peers, Channel
 * Filters: Status (all/active/syncing/offline)
 * Toasts: "Network refreshed", "Failure rate set"
 * Empty state: n/a (always shows nodes)
 * Error state: "Failed to load network status"
 */
import { useState, useEffect } from "react";
import { mockOrganizations, mockLedgerEvents } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { useToast } from "@/hooks/use-toast";
import {
  Network, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2, Sliders,
  Shield, Clock, Globe, Lock, Server,
} from "lucide-react";

const mockNodes = mockOrganizations.map((org, i) => ({
  id: `node-${i}`, org: org.name, orgId: org.id, status: org.node_status || "active",
  blockHeight: 48300 - i * 5, peers: Math.max(1, mockOrganizations.length - 1 - i),
  channel: "medchain-main", certValid: org.verified,
  certExpiry: new Date(Date.now() + (365 - i * 40) * 86400000).toISOString(),
  uptime: `${99.9 - i * 0.3}%`,
}));

const mockChannels = [
  { name: "medchain-main", members: 7, blockHeight: 48300, txCount: 12480, description: "Primary clinical data channel" },
  { name: "medchain-consent", members: 5, blockHeight: 46100, txCount: 3240, description: "Consent policy management" },
  { name: "medchain-audit", members: 7, blockHeight: 48295, txCount: 8900, description: "Audit log channel" },
];

type StatusFilter = "all" | "active" | "syncing" | "offline";

export default function AdminNetwork() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [failureRate, setFailureRate] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCerts, setShowCerts] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
    toast({ title: "Network status refreshed" });
  };

  const handleFailureRate = (rate: number) => {
    setFailureRate(rate);
    api.setFailureRate(rate / 100);
    toast({ title: `Failure rate set to ${rate}%`, description: rate > 0 ? "API calls may now randomly fail." : "Failure injection disabled." });
  };

  const statusIcon = (s: string) =>
    s === "active" ? <CheckCircle2 className="h-4 w-4 text-success" /> :
    s === "syncing" ? <AlertTriangle className="h-4 w-4 text-warning-foreground" /> :
    <XCircle className="h-4 w-4 text-destructive" />;

  const filteredNodes = statusFilter === "all" ? mockNodes : mockNodes.filter(n => n.status === statusFilter);

  const activeCount = mockNodes.filter(n => n.status === "active").length;
  const syncingCount = mockNodes.filter(n => n.status === "syncing").length;
  const offlineCount = mockNodes.filter(n => n.status === "offline").length;

  if (error) return <ErrorState title="Failed to load network status" description="Could not reach consortium nodes." traceId="TRC-NETWORK" onRetry={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Consortium Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Node status, channel participation, and network health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCerts(!showCerts)}>
            <Shield className="h-4 w-4 mr-1" /> {showCerts ? "Hide" : "Show"} Certificates
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Refresh
          </Button>
        </div>
      </div>

      {/* Network Summary */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : [
          { label: "Total Nodes", value: mockNodes.length, icon: Server },
          { label: "Active", value: activeCount, icon: CheckCircle2 },
          { label: "Syncing", value: syncingCount, icon: Clock },
          { label: "Offline", value: offlineCount, icon: XCircle },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1"><card.icon className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{card.label}</span></div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Channel Participation */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="h-4 w-4" /> Channels</h2>
        <div className="grid grid-cols-3 gap-3">
          {mockChannels.map(ch => (
            <div key={ch.name} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground font-mono">{ch.name}</span>
                <Badge variant="outline" className="text-[10px]">{ch.members} members</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{ch.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Block Height</span><p className="font-mono text-foreground">{ch.blockHeight.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Transactions</span><p className="font-mono text-foreground">{ch.txCount.toLocaleString()}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Status Filter */}
      <div className="flex gap-2">
        {(["all", "active", "syncing", "offline"] as StatusFilter[]).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {f === "all" ? `All (${mockNodes.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${mockNodes.filter(n => n.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Node Table */}
      {loading ? <Skeleton className="h-64 w-full rounded-lg" /> : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Node</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Block Height</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peers</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uptime</th>
                {showCerts && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Certificate</th>}
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map(n => (
                <tr key={n.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{n.id}</td>
                  <td className="px-4 py-3 text-foreground">{n.org}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5 capitalize">{statusIcon(n.status)} {n.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{n.blockHeight}</td>
                  <td className="px-4 py-3 text-muted-foreground">{n.peers}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{n.uptime}</td>
                  {showCerts && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {n.certValid ? <Lock className="h-3 w-3 text-verified" /> : <AlertTriangle className="h-3 w-3 text-destructive" />}
                        <span className="text-xs">{n.certValid ? "Valid" : "Expired"}</span>
                        <span className="text-[10px] text-muted-foreground">until {new Date(n.certExpiry).toLocaleDateString()}</span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Network Events */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Ledger Events</h2>
        <LedgerTimeline events={mockLedgerEvents.slice(0, 4)} />
      </div>

      {/* Dev Panel */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2"><Sliders className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Dev Panel: Failure Injection</span></div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">API Failure Rate:</Label>
          <Input type="number" min={0} max={100} value={failureRate} onChange={e => handleFailureRate(Number(e.target.value))} className="w-20 text-xs" />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}
