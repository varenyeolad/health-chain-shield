import { cn } from "@/lib/utils";
import type { Organization } from "@/types/medical";
import { Building2, BadgeCheck } from "lucide-react";

interface OrgBadgeProps {
  org: Pick<Organization, "name" | "verified">;
  className?: string;
}

export function OrgBadge({ org, className }: OrgBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground">{org.name}</span>
      {org.verified && <BadgeCheck className="h-3.5 w-3.5 text-verified" />}
    </span>
  );
}
