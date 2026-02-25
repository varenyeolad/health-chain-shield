import { cn } from "@/lib/utils";
import type { ConsentPolicy } from "@/types/medical";
import { RECORD_TYPE_LABELS } from "@/types/medical";
import { StatusBadge } from "./StatusBadge";
import { Shield, Building2, Calendar } from "lucide-react";

interface ConsentCardProps {
  consent: ConsentPolicy;
  onClick?: () => void;
  className?: string;
}

export function ConsentCard({ consent, onClick, className }: ConsentCardProps) {
  const validFrom = new Date(consent.valid_from).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const validTo = new Date(consent.valid_to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const scopeLabels = consent.data_scope.types.map(t => RECORD_TYPE_LABELS[t]).join(", ");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm text-foreground">{consent.grantee_org}</h3>
        </div>
        <StatusBadge status={consent.status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{consent.purpose}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {scopeLabels}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {validFrom} — {validTo}
        </span>
      </div>
    </button>
  );
}
