/**
 * FhirResourcePreview — FHIR resource metadata panel.
 * Shows: resource type, schema version, mapping completeness, validation warnings,
 * source system, transformation history, retry button for failed mappings.
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2, FileText, Clock } from "lucide-react";
import type { FhirMapping } from "@/lib/mock-data";

interface FhirResourcePreviewProps {
  mapping: FhirMapping;
  className?: string;
}

const STATUS_CONFIG = {
  mapped: { icon: CheckCircle2, label: "Fully Mapped", color: "text-success", badge: "default" as const },
  partial: { icon: AlertTriangle, label: "Partially Mapped", color: "text-warning-foreground", badge: "secondary" as const },
  missing: { icon: XCircle, label: "Not Mapped", color: "text-destructive", badge: "destructive" as const },
  validation_failed: { icon: XCircle, label: "Validation Failed", color: "text-destructive", badge: "destructive" as const },
};

export function FhirResourcePreview({ mapping, className }: FhirResourcePreviewProps) {
  const { toast } = useToast();
  const [retrying, setRetrying] = useState(false);
  const cfg = STATUS_CONFIG[mapping.mappingStatus];
  const StatusIcon = cfg.icon;
  const completeness = mapping.totalFields > 0 ? Math.round((mapping.fieldsCovered / mapping.totalFields) * 100) : 0;

  const handleRetry = async () => {
    setRetrying(true);
    await new Promise(r => setTimeout(r, 1500));
    setRetrying(false);
    toast({ title: "Mapping retry initiated", description: `Re-validating ${mapping.fhirResource} mapping.` });
  };

  return (
    <div className={`rounded-lg border border-border bg-card p-4 space-y-3 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{mapping.fhirResource}</span>
          <Badge variant={cfg.badge} className="text-[10px]">{cfg.label}</Badge>
        </div>
        {(mapping.mappingStatus === "missing" || mapping.mappingStatus === "validation_failed") && (
          <Button size="sm" variant="outline" onClick={handleRetry} disabled={retrying}>
            {retrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Retry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Record Type</span>
          <p className="text-foreground capitalize">{mapping.recordType.replace(/_/g, " ")}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Schema Version</span>
          <p className="text-foreground">FHIR R4 (v4.0.1)</p>
        </div>
        <div>
          <span className="text-muted-foreground">Source System</span>
          <p className="text-foreground">MedChain EHR Adapter</p>
        </div>
        <div>
          <span className="text-muted-foreground">Last Validated</span>
          <p className="text-foreground">{new Date(mapping.lastValidated).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Completeness */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Field Coverage</span>
          <span className="text-foreground">{mapping.fieldsCovered}/{mapping.totalFields} ({completeness}%)</span>
        </div>
        <Progress value={completeness} className="h-1.5" />
      </div>

      {/* Validation Issues */}
      {mapping.issues && mapping.issues.length > 0 && (
        <div className="rounded border border-warning/30 bg-warning/5 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-warning-foreground">
            <AlertTriangle className="h-3 w-3" /> Validation Warnings
          </div>
          <ul className="text-xs text-muted-foreground space-y-0.5 pl-5 list-disc">
            {mapping.issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}

      {/* Transformation History */}
      <div className="border-t border-border pt-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Transformation History</p>
        <div className="space-y-1">
          {[
            { time: mapping.lastValidated, action: "Validated against FHIR R4 profile" },
            { time: new Date(new Date(mapping.lastValidated).getTime() - 86400000).toISOString(), action: "Mapped from source schema" },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{new Date(entry.time).toLocaleDateString()}</span>
              <span className="text-foreground">{entry.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
