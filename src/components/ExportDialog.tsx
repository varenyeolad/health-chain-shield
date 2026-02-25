/**
 * ExportDialog — CSV/PDF export for audit data (simulated).
 * Primary button: "Export"
 * Secondary: "Cancel"
 * Toasts: "Export started" (success)
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileText, Table2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  recordCount?: number;
}

export function ExportDialog({ open, onOpenChange, title = "Export Audit Data", recordCount = 0 }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    toast({ title: "Export complete", description: `${recordCount} records exported as ${format.toUpperCase()}.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" aria-describedby="export-desc">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="export-desc">
            Choose a format to export {recordCount > 0 ? `${recordCount} records` : "your data"}.
            Exported data respects your role permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {([["csv", Table2, "CSV Spreadsheet"], ["pdf", FileText, "PDF Report"]] as const).map(([f, Icon, label]) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                  format === f ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠ Exported files may contain sensitive access information. Handle according to your organization's data policy.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
