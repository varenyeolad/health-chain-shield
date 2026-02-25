import { cn } from "@/lib/utils";
import type { LedgerEvent } from "@/types/medical";
import { FileText, Shield, ShieldOff, Eye, CheckCircle2 } from "lucide-react";

const EVENT_ICONS: Record<LedgerEvent["type"], React.ElementType> = {
  RECORD_REGISTERED: FileText,
  CONSENT_GRANTED: Shield,
  CONSENT_REVOKED: ShieldOff,
  ACCESS_LOGGED: Eye,
  RECORD_VERIFIED: CheckCircle2,
};

const EVENT_COLORS: Record<LedgerEvent["type"], string> = {
  RECORD_REGISTERED: "bg-info/15 text-info",
  CONSENT_GRANTED: "bg-success/15 text-success",
  CONSENT_REVOKED: "bg-destructive/15 text-destructive",
  ACCESS_LOGGED: "bg-warning/15 text-warning-foreground",
  RECORD_VERIFIED: "bg-verified/15 text-verified",
};

interface LedgerTimelineProps {
  events: LedgerEvent[];
  className?: string;
}

export function LedgerTimeline({ events, className }: LedgerTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = EVENT_ICONS[event.type];
          const colorClass = EVENT_COLORS[event.type];
          const time = new Date(event.timestamp).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          });

          return (
            <div key={event.event_id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg border border-border bg-card p-3 ledger-glow">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{event.description}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{time}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                  <span>Block #{event.block_number}</span>
                  <span>Tx: {event.tx_hash}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {event.actor} · {event.actor_org}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
