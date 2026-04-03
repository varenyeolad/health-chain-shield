/**
 * TransactionReceiptModal — Shows receipt after a ledger transaction.
 * Displayed after: record registration, consent grant/revoke, emergency access, access logging.
 * Shows: tx id, committed timestamp, endorsing orgs, status, block, cert badge.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, FileText, Shield, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  committedAt: string;
  status: "COMMITTED" | "PENDING_ENDORSEMENT" | "ORDERED" | "FAILED";
  type: "record_registration" | "consent_grant" | "consent_revoke" | "emergency_access" | "access_log";
  endorsingOrgs: string[];
  targetId: string;
  description: string;
}

interface TransactionReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: TransactionReceipt | null;
}

const TYPE_LABELS: Record<TransactionReceipt["type"], string> = {
  record_registration: "Record Registration",
  consent_grant: "Consent Grant",
  consent_revoke: "Consent Revocation",
  emergency_access: "Emergency Access",
  access_log: "Access Log Entry",
};

const STATUS_STYLES: Record<string, { icon: React.ElementType; color: string }> = {
  COMMITTED: { icon: CheckCircle2, color: "text-success" },
  PENDING_ENDORSEMENT: { icon: Clock, color: "text-warning-foreground" },
  ORDERED: { icon: Clock, color: "text-info" },
  FAILED: { icon: AlertTriangle, color: "text-destructive" },
};

export function TransactionReceiptModal({ open, onOpenChange, receipt }: TransactionReceiptModalProps) {
  const { toast } = useToast();
  if (!receipt) return null;

  const statusCfg = STATUS_STYLES[receipt.status] || STATUS_STYLES.COMMITTED;
  const StatusIcon = statusCfg.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby="tx-receipt-desc">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-verified/10">
            <FileText className="h-6 w-6 text-verified" />
          </div>
          <DialogTitle className="text-center">Ledger Transaction Receipt</DialogTitle>
          <p id="tx-receipt-desc" className="text-center text-sm text-muted-foreground">{TYPE_LABELS[receipt.type]}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            <StatusIcon className={`h-4 w-4 ${statusCfg.color}`} />
            <Badge variant={receipt.status === "COMMITTED" ? "default" : receipt.status === "FAILED" ? "destructive" : "secondary"}>
              {receipt.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Hash</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground">{receipt.txHash}</span>
                <button onClick={() => { navigator.clipboard.writeText(receipt.txHash); toast({ title: "Tx hash copied" }); }} className="p-0.5 hover:bg-muted rounded">
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Block Number</span>
              <span className="font-mono text-xs text-foreground">#{receipt.blockNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Committed</span>
              <span className="text-foreground">{new Date(receipt.committedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground">{receipt.targetId}</span>
                <button onClick={() => { navigator.clipboard.writeText(receipt.targetId); toast({ title: "ID copied" }); }} className="p-0.5 hover:bg-muted rounded">
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center">{receipt.description}</p>

          {/* Endorsing Orgs */}
          {receipt.endorsingOrgs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Endorsing Organizations</p>
              <div className="flex flex-wrap gap-1.5">
                {receipt.endorsingOrgs.map(org => (
                  <Badge key={org} variant="outline" className="text-xs gap-1">
                    <Shield className="h-3 w-3 text-verified" /> {org}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            This receipt is a tamper-evident record of the ledger transaction. It cannot be modified or deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(receipt, null, 2)); toast({ title: "Receipt copied to clipboard" }); }}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
