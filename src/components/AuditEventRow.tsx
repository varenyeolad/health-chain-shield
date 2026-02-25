import { cn } from "@/lib/utils";
import type { AccessLogEntry } from "@/types/medical";
import { Eye, Download, CheckCircle2, Share2 } from "lucide-react";

const ACTION_ICONS: Record<string, React.ElementType> = {
  VIEW: Eye,
  DOWNLOAD: Download,
  VERIFY: CheckCircle2,
  SHARE: Share2,
};

interface AuditEventRowProps {
  entry: AccessLogEntry;
  className?: string;
}

export function AuditEventRow({ entry, className }: AuditEventRowProps) {
  const Icon = ACTION_ICONS[entry.action] || Eye;
  const time = new Date(entry.timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={cn("flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-sm", className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{entry.record_title}</p>
        <p className="text-xs text-muted-foreground">
          {entry.grantee_org} · {entry.purpose}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{entry.action}</span>
        <p className="text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
