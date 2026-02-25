/**
 * ProviderRequests — Incoming access requests from consumers.
 * Primary: "Approve" | Secondary: "Deny" | Columns: Consumer, Patient, Records, Purpose, Status
 * Empty state: "No pending requests"
 */
import { useState } from "react";
import { mockProviderRequests } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Inbox, CheckCircle2, XCircle } from "lucide-react";

export default function ProviderRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(mockProviderRequests);

  const handleResolve = async (id: string, action: "approve" | "deny") => {
    await api.resolveProviderRequest(id, action);
    setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: action === "approve" ? "approved" as const : "denied" as const } : r));
    toast({ title: action === "approve" ? "Request approved" : "Request denied" });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-foreground">Access Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Incoming requests requiring provider mediation.</p></div>
      {requests.length === 0 ? <EmptyState icon={Inbox} title="No requests" description="No pending access requests." /> : (
        <div className="space-y-3">{requests.map(req => (
          <div key={req.request_id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{req.consumer_org}</p>
                <p className="text-xs text-muted-foreground mt-1">Patient: {req.patient_pseudonym} · {req.purpose}</p>
                <p className="text-xs text-muted-foreground">Records: {req.record_ids.join(", ")}</p>
              </div>
              <div className="flex items-center gap-2">
                {req.status === "pending_mediation" ? (
                  <>
                    <Button size="sm" onClick={() => handleResolve(req.request_id, "approve")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(req.request_id, "deny")}><XCircle className="h-3.5 w-3.5 mr-1" /> Deny</Button>
                  </>
                ) : req.status === "auto_approved" ? (
                  <span className="text-xs text-success font-medium">Auto-approved</span>
                ) : (
                  <span className={`text-xs font-medium capitalize ${req.status === "approved" ? "text-success" : "text-destructive"}`}>{req.status}</span>
                )}
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
