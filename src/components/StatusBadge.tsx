import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ConsentStatus, RecordStatus } from "@/types/medical";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        active: "bg-success/15 text-success",
        pending: "bg-warning/15 text-warning-foreground",
        revoked: "bg-destructive/15 text-destructive",
        expired: "bg-muted text-muted-foreground",
        committed: "bg-success/15 text-success",
        draft: "bg-muted text-muted-foreground",
        ordered: "bg-info/15 text-info",
        failed: "bg-destructive/15 text-destructive",
        pending_endorsement: "bg-warning/15 text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "active",
    },
  }
);

const DOT_COLORS: Record<string, string> = {
  active: "bg-success",
  pending: "bg-warning",
  revoked: "bg-destructive",
  expired: "bg-muted-foreground",
  committed: "bg-success",
  draft: "bg-muted-foreground",
  ordered: "bg-info",
  failed: "bg-destructive",
  pending_endorsement: "bg-warning",
};

type BadgeVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

function toVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: "active",
    PENDING: "pending",
    REVOKED: "revoked",
    EXPIRED: "expired",
    COMMITTED: "committed",
    DRAFT: "draft",
    ORDERED: "ordered",
    FAILED: "failed",
    PENDING_ENDORSEMENT: "pending_endorsement",
  };
  return map[status] || "active";
}

interface StatusBadgeProps {
  status: ConsentStatus | RecordStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = toVariant(status);
  const label = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[variant])} />
      {label}
    </span>
  );
}
