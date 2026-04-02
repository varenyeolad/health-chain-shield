/**
 * EmergencyAccessPage — Break-glass emergency access workflow.
 * Accessible from Consumer and Provider consoles.
 * Flow: request → reason entry → warning → confirmation → time-limited access → audit flag.
 */
import { useState } from "react";
import { mockEmergencyAccess } from "@/lib/mock-data";
import { SecureActionModal } from "@/components/SecureActionModal";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Zap, AlertTriangle, Clock, Shield, CheckCircle2, Loader2 } from "lucide-react";

const ALL_TYPES = Object.keys(RECORD_TYPE_LABELS) as RecordType[];

export default function EmergencyAccess() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [pseudonym, setPseudonym] = useState("");
  const [reason, setReason] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([]);
  const [secureOpen, setSecureOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=form, 1=warning, 2=processing, 3=done
  const [processing, setProcessing] = useState(false);

  const toggleType = (t: RecordType) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleInitiate = () => {
    if (!pseudonym || !reason || selectedTypes.length === 0) return;
    setStep(1);
  };

  const handleConfirmWarning = () => {
    setSecureOpen(true);
  };

  const executeEmergencyAccess = async () => {
    setStep(2);
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    setProcessing(false);
    setStep(3);
    toast({ title: "Emergency access granted", description: "Time-limited access (72 hours) has been activated. This event has been flagged for regulatory review." });
  };

  const resetForm = () => {
    setShowForm(false);
    setStep(0);
    setPseudonym("");
    setReason("");
    setSelectedTypes([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-destructive" /> Emergency Access
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Break-glass access for urgent care situations. All emergency access is time-limited, audited, and flagged for regulatory review.
          </p>
        </div>
        <Button variant="destructive" onClick={() => { resetForm(); setShowForm(true); }}>
          <Zap className="h-4 w-4 mr-1" /> Request Emergency Access
        </Button>
      </div>

      {/* Educational block */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" /> Important: Emergency access policy
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
          <li>Emergency access bypasses normal consent requirements</li>
          <li>Maximum duration: <strong className="text-foreground">72 hours</strong></li>
          <li>Patient is notified immediately after access</li>
          <li>Regulator is notified within 24 hours</li>
          <li>Mandatory post-access audit within 7 days</li>
          <li>Only predefined record classes may be accessed</li>
          <li>All actions are permanently logged on the immutable ledger</li>
        </ul>
      </div>

      {showForm && (
        <div className="rounded-lg border border-destructive/30 bg-card p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground">Emergency Access Request</h2>

          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Patient Pseudonym</Label>
                <Input value={pseudonym} onChange={e => setPseudonym(e.target.value)} placeholder="e.g., PAT-A7X9K2" />
              </div>
              <div className="space-y-2">
                <Label>Emergency Reason <span className="text-destructive">*</span></Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe the clinical emergency requiring immediate access (e.g., 'Patient arrived unconscious, need medication history for safe treatment')" rows={3} />
                <p className="text-xs text-muted-foreground">This reason will be logged permanently and reviewed during post-access audit.</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Record Types Needed</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                      <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => toggleType(type)} />
                      <span className="text-xs text-foreground">{RECORD_TYPE_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleInitiate} disabled={!pseudonym || !reason || selectedTypes.length === 0}>
                  Continue to Review
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="text-sm font-bold text-destructive">HIGH-RISK ACTION: Emergency Override</h3>
                </div>
                <p className="text-sm text-foreground">You are about to invoke emergency break-glass access. This action:</p>
                <ul className="text-xs text-foreground space-y-1 ml-4 list-disc">
                  <li>Grants immediate access without patient consent</li>
                  <li>Notifies the patient and their care team</li>
                  <li>Creates a high-severity audit event</li>
                  <li>Triggers mandatory regulatory review</li>
                  <li>Expires automatically after 72 hours</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="text-foreground font-medium">{pseudonym}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Records:</span><span className="text-foreground">{selectedTypes.map(t => RECORD_TYPE_LABELS[t]).join(", ")}</span></div>
                <div><span className="text-muted-foreground">Reason:</span><p className="text-foreground mt-1">{reason}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmWarning}>
                  Confirm Emergency Access
                </Button>
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-destructive mx-auto" />
              <p className="text-sm font-medium text-foreground">Processing emergency access…</p>
              <p className="text-xs text-muted-foreground">Creating audit event, notifying patient, and granting temporary access.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-center space-y-3">
                <Zap className="h-8 w-8 text-warning-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">Emergency Access Granted</p>
                <p className="text-xs text-muted-foreground">Time-limited access for 72 hours. Patient and regulator have been notified.</p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Expires: {new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleString()}</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Access ID:</span><span className="text-foreground font-mono text-xs">emg-{Math.random().toString(36).substr(2, 6)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Post-audit deadline:</span><span className="text-foreground">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></div>
              </div>
              <Button variant="outline" onClick={resetForm}>Done</Button>
            </div>
          )}
        </div>
      )}

      {/* Previous emergency access events */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Emergency Access History</h2>
        {mockEmergencyAccess.length === 0 ? (
          <EmptyState icon={Zap} title="No emergency access events" description="No break-glass access has been invoked." />
        ) : (
          <div className="space-y-3">
            {mockEmergencyAccess.map(e => (
              <div key={e.id} className="rounded-lg border border-warning/30 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-warning-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.requester_org} — {e.requester_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Patient: {e.patient_pseudonym}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reason: {e.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(e.timestamp).toLocaleString()} — Expired: {new Date(e.expires_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${e.status === "active" ? "bg-destructive/15 text-destructive" : e.status === "expired" ? "bg-muted text-muted-foreground" : "bg-warning/15 text-warning-foreground"}`}>{e.status}</span>
                    {e.post_audit_complete ? (
                      <span className="text-[10px] text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Audit complete</span>
                    ) : (
                      <span className="text-[10px] text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Audit pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SecureActionModal
        open={secureOpen}
        onOpenChange={setSecureOpen}
        title="Emergency Access Override"
        description="This is a high-risk action. You are bypassing normal consent controls. Enter your PIN to confirm your identity and authorize emergency access. This action is permanently recorded."
        confirmLabel="Authorize Emergency Access"
        onConfirm={executeEmergencyAccess}
        destructive
      />
    </div>
  );
}
