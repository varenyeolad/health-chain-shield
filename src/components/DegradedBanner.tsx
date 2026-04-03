/**
 * DegradedBanner — System-wide banner for degraded states.
 * Types: ledger_delayed, storage_failure, connector_outage, partial_retrieval, maintenance.
 */
import { useState } from "react";
import { AlertTriangle, X, Clock, HardDrive, Wifi, Wrench, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type DegradedType = "ledger_delayed" | "storage_failure" | "connector_outage" | "partial_retrieval" | "maintenance";

interface DegradedBannerProps {
  type: DegradedType;
  message?: string;
  dismissible?: boolean;
}

const CONFIG: Record<DegradedType, { icon: React.ElementType; defaultMsg: string; severity: "warning" | "error" | "info" }> = {
  ledger_delayed: { icon: Clock, defaultMsg: "Ledger confirmation is delayed. Transactions may take longer to finalize.", severity: "warning" },
  storage_failure: { icon: HardDrive, defaultMsg: "Off-chain storage is experiencing issues. Some records may be temporarily unavailable.", severity: "error" },
  connector_outage: { icon: Wifi, defaultMsg: "An external connector is currently unavailable. Some integrations may be affected.", severity: "warning" },
  partial_retrieval: { icon: CloudOff, defaultMsg: "Some records could not be fully retrieved. Partial data is displayed.", severity: "warning" },
  maintenance: { icon: Wrench, defaultMsg: "Scheduled maintenance is in progress. Some features may be temporarily unavailable.", severity: "info" },
};

export function DegradedBanner({ type, message, dismissible = true }: DegradedBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  const severityStyles = {
    warning: "bg-warning/10 border-warning/30 text-warning-foreground",
    error: "bg-destructive/10 border-destructive/30 text-destructive",
    info: "bg-info/10 border-info/30 text-info",
  };

  return (
    <div className={cn("rounded-lg border px-4 py-3 flex items-center gap-3", severityStyles[cfg.severity])} role="alert">
      <Icon className="h-4 w-4 shrink-0" />
      <p className="text-sm flex-1">{message || cfg.defaultMsg}</p>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-background/20 rounded" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
