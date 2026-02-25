/**
 * ErrorState — Shown on API errors, includes trace ID.
 */
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  traceId?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again or contact support if the issue persists.",
  traceId,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      {traceId && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">Trace: {traceId}</p>
      )}
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
}
