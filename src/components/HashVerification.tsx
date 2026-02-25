import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface HashVerificationProps {
  expected: string;
  actual?: string;
  status?: "match" | "mismatch" | "verifying";
  className?: string;
}

export function HashVerification({ expected, actual, status = "match", className }: HashVerificationProps) {
  return (
    <div className={cn("rounded-lg border p-4", {
      "border-success/30 bg-success/5": status === "match",
      "border-destructive/30 bg-destructive/5": status === "mismatch",
      "border-border bg-muted/30": status === "verifying",
    }, className)}>
      <div className="flex items-center gap-2 mb-3">
        {status === "match" && <CheckCircle2 className="h-4 w-4 text-success" />}
        {status === "mismatch" && <XCircle className="h-4 w-4 text-destructive" />}
        {status === "verifying" && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
        <span className="text-sm font-medium text-foreground">
          {status === "match" && "Integrity Verified"}
          {status === "mismatch" && "Integrity Check Failed"}
          {status === "verifying" && "Verifying Integrity…"}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ledger Anchor</span>
          <p className="font-mono text-xs text-foreground break-all mt-0.5">{expected}</p>
        </div>
        {actual && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Computed Hash</span>
            <p className="font-mono text-xs text-foreground break-all mt-0.5">{actual}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {status === "match" && "The off-chain document matches the tamper-evident anchor stored on the immutable ledger."}
        {status === "mismatch" && "Warning: The computed hash does not match the ledger anchor. This document may have been altered."}
        {status === "verifying" && "Computing cryptographic hash and comparing with the ledger anchor…"}
      </p>
    </div>
  );
}
