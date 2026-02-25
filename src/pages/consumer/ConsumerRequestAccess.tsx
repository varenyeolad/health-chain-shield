/**
 * ConsumerRequestAccess — Create access request wizard + status tracking.
 * Primary: "Submit Request" | Wizard: scope + purpose + urgency
 * Toasts: "Request submitted" | Table: existing requests with status
 */
import { useState } from "react";
import { mockAccessRequests } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { ConsentScopeBuilder, type ConsentScope } from "@/components/ConsentScopeBuilder";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Plus, Loader2, Shield, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_ICONS: Record<string, React.ElementType> = { pending: Clock, approved: CheckCircle2, denied: XCircle, expired: Clock };
const STATUS_COLORS: Record<string, string> = { pending: "text-warning-foreground", approved: "text-success", denied: "text-destructive", expired: "text-muted-foreground" };

export default function ConsumerRequestAccess() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [pseudonym, setPseudonym] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [scope, setScope] = useState<ConsentScope>({ types: [], from: "", to: "", purpose: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.createAccessRequest({ patientPseudonym: pseudonym, scopeTypes: scope.types, purpose: scope.purpose, urgency });
      toast({ title: "Request submitted", description: "The patient will be notified to review your request." });
      setShowForm(false); setPseudonym(""); setScope({ types: [], from: "", to: "", purpose: "" });
    } catch { toast({ title: "Failed to submit", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Request Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Create access requests and track their status.</p></div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> New Request</Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground">New Access Request</h2>
          <div className="space-y-2"><Label>Patient Pseudonym</Label>
            <Input value={pseudonym} onChange={e => setPseudonym(e.target.value)} placeholder="e.g., PAT-A7X9K2" /></div>
          <ConsentScopeBuilder value={scope} onChange={setScope} />
          <div className="space-y-2"><Label>Urgency</Label>
            <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
            </select></div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading || !pseudonym || scope.types.length === 0 || !scope.purpose}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Submit Request
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <h2 className="text-lg font-display font-semibold text-foreground">Request History</h2>
      {mockAccessRequests.length === 0 ? <EmptyState icon={Shield} title="No requests" description="You haven't submitted any access requests yet." /> : (
        <div className="space-y-3">{mockAccessRequests.map(req => {
          const Icon = STATUS_ICONS[req.status] || Clock;
          return (
            <div key={req.request_id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-foreground">{req.patient_pseudonym}</p>
                  <p className="text-xs text-muted-foreground mt-1">{req.purpose}</p>
                  <div className="flex gap-1.5 mt-2">{req.scope_types.map(t => (
                    <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">{RECORD_TYPE_LABELS[t as RecordType] || t}</span>
                  ))}</div></div>
                <span className={`flex items-center gap-1 text-xs font-medium capitalize ${STATUS_COLORS[req.status]}`}>
                  <Icon className="h-3.5 w-3.5" /> {req.status}
                </span>
              </div>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
