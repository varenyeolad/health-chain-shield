/**
 * VerificationDrawer — Slide-out panel showing cryptographic trust details.
 * Shows: off-chain hash, on-chain anchor, verification status, cert badge,
 * endorsing organizations, mismatch guidance.
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface VerificationData {
  offchainHash: string;
  onchainAnchor: string;
  status: "verified" | "mismatch" | "pending";
  lastVerified?: string;
  certIssuer?: string;
  certValid?: boolean;
  endorsingOrgs?: string[];
  txHash?: string;
  blockNumber?: number;
  committedAt?: string;
}

interface VerificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: VerificationData | null;
  title?: string;
}

export function VerificationDrawer({ open, onOpenChange, data, title = "Verification Details" }: VerificationDrawerProps) {
  const { toast } = useToast();
  if (!data) return null;

  const statusConfig = {
    verified: { icon: CheckCircle2, label: "Integrity Verified", color: "text-success", bg: "bg-success/10 border-success/30" },
    mismatch: { icon: XCircle, label: "Integrity Failed", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
    pending: { icon: Clock, label: "Verification Pending", color: "text-warning-foreground", bg: "bg-warning/10 border-warning/30" },
  };

  const cfg = statusConfig[data.status];
  const StatusIcon = cfg.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[440px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Status Banner */}
          <div className={`rounded-lg border p-4 ${cfg.bg}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.status === "verified" && "The off-chain document matches the tamper-evident anchor stored on the immutable ledger."}
              {data.status === "mismatch" && "The computed hash does not match the ledger anchor. This document may have been altered. Contact your administrator immediately."}
              {data.status === "pending" && "Verification is in progress. The ledger confirmation may be delayed."}
            </p>
          </div>

          {/* Hash Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hash Comparison</h3>
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Off-chain File Hash</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono text-xs text-foreground break-all flex-1">{data.offchainHash}</p>
                  <button onClick={() => { navigator.clipboard.writeText(data.offchainHash); toast({ title: "Hash copied" }); }} className="p-1 hover:bg-muted rounded">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">On-chain Verified Anchor</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono text-xs text-foreground break-all flex-1">{data.onchainAnchor}</p>
                  <button onClick={() => { navigator.clipboard.writeText(data.onchainAnchor); toast({ title: "Anchor copied" }); }} className="p-1 hover:bg-muted rounded">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {(data.txHash || data.blockNumber) && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ledger Transaction</h3>
              <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-xs">
                {data.txHash && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Tx Hash</span><span className="font-mono text-foreground">{data.txHash}</span></div>
                )}
                {data.blockNumber && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Block</span><span className="font-mono text-foreground">#{data.blockNumber}</span></div>
                )}
                {data.committedAt && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Committed</span><span className="text-foreground">{new Date(data.committedAt).toLocaleString()}</span></div>
                )}
                {data.lastVerified && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Verified</span><span className="text-foreground">{new Date(data.lastVerified).toLocaleString()}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Certificate Badge */}
          {data.certIssuer && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization Certificate</h3>
              <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                <Shield className={`h-5 w-5 ${data.certValid ? "text-verified" : "text-destructive"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{data.certIssuer}</p>
                  <Badge variant={data.certValid ? "default" : "destructive"} className="text-[10px] mt-0.5">
                    {data.certValid ? "Certificate Valid" : "Certificate Expired"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Endorsing Orgs */}
          {data.endorsingOrgs && data.endorsingOrgs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Endorsing Organizations</h3>
              <div className="space-y-1.5">
                {data.endorsingOrgs.map(org => (
                  <div key={org} className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-verified" />
                    <span className="text-sm text-foreground">{org}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mismatch Guidance */}
          {data.status === "mismatch" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">What to do next</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                <li>Do not use or trust this document for clinical decisions</li>
                <li>Report this incident to your organization's data integrity officer</li>
                <li>A tamper-evident audit event has been logged automatically</li>
                <li>Request the originating provider to re-verify and re-anchor the record</li>
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
