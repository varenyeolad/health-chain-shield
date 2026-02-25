/**
 * RegulatorCompliance — Policy compliance checks + anomalies + report export.
 */
import { useState } from "react";
import { mockPolicyTemplates, mockOrganizations } from "@/lib/mock-data";
import { ExportDialog } from "@/components/ExportDialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const mockCompliance = [
  { org: "Mercy General Hospital", score: 98, issues: 0, status: "compliant" },
  { org: "Metro Health Network", score: 95, issues: 1, status: "compliant" },
  { org: "BioGenomics Lab", score: 87, issues: 2, status: "warning" },
  { org: "CareFirst Insurance", score: 72, issues: 5, status: "non-compliant" },
];

export default function RegulatorCompliance() {
  const [exportOpen, setExportOpen] = useState(false);
  const statusIcon = (s: string) => s === "compliant" ? <CheckCircle2 className="h-4 w-4 text-success" /> : s === "warning" ? <AlertTriangle className="h-4 w-4 text-warning-foreground" /> : <XCircle className="h-4 w-4 text-destructive" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">Policy compliance checks and organizational audit.</p></div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-2" /> Export Report</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50"><th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issues</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
          <tbody>{mockCompliance.map(c => (
            <tr key={c.org} className="border-t border-border">
              <td className="px-4 py-3 text-foreground font-medium">{c.org}</td>
              <td className="px-4 py-3"><span className={c.score >= 90 ? "text-success" : c.score >= 80 ? "text-warning-foreground" : "text-destructive"}>{c.score}%</span></td>
              <td className="px-4 py-3 text-muted-foreground">{c.issues}</td>
              <td className="px-4 py-3"><span className="flex items-center gap-1.5 capitalize">{statusIcon(c.status)} {c.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h2 className="text-lg font-display font-semibold text-foreground">Active Policy Templates</h2>
      <div className="space-y-3">{mockPolicyTemplates.map(p => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-foreground">{p.name}{p.isDefault && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p></div>
            <span className="text-xs text-muted-foreground capitalize">{p.type}</span>
          </div>
          <ul className="mt-2 space-y-1">{p.rules.map(r => <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success shrink-0" />{r}</li>)}</ul>
        </div>
      ))}</div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export Compliance Report" recordCount={mockCompliance.length} />
    </div>
  );
}
