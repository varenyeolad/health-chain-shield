import { mockAuditLog } from "@/lib/mock-data";
import { AuditEventRow } from "@/components/AuditEventRow";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientAudit() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every access to your records is permanently recorded on the immutable ledger.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="space-y-2">
        {mockAuditLog.map(a => (
          <AuditEventRow key={a.access_id} entry={a} />
        ))}
      </div>
    </div>
  );
}
