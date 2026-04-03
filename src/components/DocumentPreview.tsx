/**
 * DocumentPreview — Medical file handling with encryption badge, version history,
 * duplicate detection warning, secure download receipt.
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Download, Clock, FileText, AlertTriangle, CheckCircle2, Copy, Loader2, ShieldCheck } from "lucide-react";
import type { RecordMeta } from "@/types/medical";

interface DocumentPreviewProps {
  record: RecordMeta;
  onVerify?: () => void;
  className?: string;
}

const mockVersions = [
  { version: "1.0", date: "2025-12-15T09:30:00Z", author: "Dr. James Wilson", status: "current" },
  { version: "0.9", date: "2025-12-14T16:00:00Z", author: "Dr. James Wilson", status: "superseded" },
];

export function DocumentPreview({ record, onVerify, className }: DocumentPreviewProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const hasDuplicate = record.record_id === "rec-a1b2c3"; // mock

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 1200));
    setDownloading(false);
    toast({
      title: "Secure download complete",
      description: `Download receipt: DL-${Date.now().toString(36).toUpperCase()}. This access has been logged.`,
    });
  };

  return (
    <div className={`rounded-lg border border-border bg-card space-y-0 ${className || ""}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{record.title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Lock className="h-2.5 w-2.5" /> AES-256 Encrypted
            </Badge>
            <Badge variant="secondary" className="text-[10px]">{record.status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-muted-foreground">Type</span><p className="text-foreground capitalize">{record.type.replace(/_/g, " ")}</p></div>
          <div><span className="text-muted-foreground">Origin</span><p className="text-foreground">{record.owner_org}</p></div>
          <div><span className="text-muted-foreground">Created</span><p className="text-foreground">{new Date(record.created_at).toLocaleDateString()}</p></div>
        </div>
      </div>

      {/* Document Body (simulated) */}
      <div className="p-4 bg-muted/30 min-h-[120px] flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Encrypted document content</p>
          <p className="text-xs text-muted-foreground mt-1">Decrypt and verify to view contents</p>
        </div>
      </div>

      {/* Duplicate Warning */}
      {hasDuplicate && (
        <div className="px-4 py-2 bg-warning/5 border-t border-warning/20 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />
          <span className="text-xs text-warning-foreground">Potential duplicate detected: similar CBC record from same date exists</span>
        </div>
      )}

      {/* Version History */}
      <div className="p-4 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Version History</p>
        <div className="space-y-1.5">
          {mockVersions.map(v => (
            <div key={v.version} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">v{v.version}</span>
                <span className="text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                <span className="text-muted-foreground">by {v.author}</span>
              </div>
              <Badge variant={v.status === "current" ? "default" : "secondary"} className="text-[10px]">{v.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Hash & Actions */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-verified" />
          <span className="text-muted-foreground">Hash:</span>
          <span className="font-mono text-foreground truncate flex-1">{record.hash_offchain}</span>
          <button onClick={() => { navigator.clipboard.writeText(record.hash_offchain); toast({ title: "Hash copied" }); }} className="p-1 hover:bg-muted rounded">
            <Copy className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
        <div className="flex gap-2">
          {onVerify && (
            <Button size="sm" variant="outline" onClick={onVerify}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify Integrity
            </Button>
          )}
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
            Secure Download
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          ⚠ Downloading will create an immutable access log entry. Do not share sensitive data outside authorized channels.
        </p>
      </div>
    </div>
  );
}
