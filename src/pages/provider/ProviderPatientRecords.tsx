/**
 * ProviderPatientRecords — Patient records + create/register wizard with tx timeline.
 * Primary: "Register New Record" | Wizard steps: type → upload → encrypt → submit → confirm
 * Tx statuses: DRAFT → PENDING_ENDORSEMENT → ORDERED → COMMITTED
 * Modals: none (inline wizard) | Toasts: "Record registered", "Registration failed"
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockRecords } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { RecordCard } from "@/components/RecordCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RECORD_TYPE_LABELS, type RecordType, type RecordStatus, type LedgerEvent } from "@/types/medical";
import { ArrowLeft, Plus, Upload, Loader2, Copy, CheckCircle2, XCircle, RefreshCw, FileText } from "lucide-react";

const STEPS = ["Select Type", "Upload File", "Encrypting", "Submit Transaction", "Confirmation"];
const STATUS_FLOW: RecordStatus[] = ["DRAFT", "PENDING_ENDORSEMENT", "ORDERED", "COMMITTED"];

export default function ProviderPatientRecords() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const records = mockRecords.filter(r => r.patient_id === patientId);

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [recordType, setRecordType] = useState<RecordType>("lab_result");
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [txStatus, setTxStatus] = useState<RecordStatus>("DRAFT");
  const [resultData, setResultData] = useState<{ recordId: string; hash: string; uri: string } | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [txEvents, setTxEvents] = useState<LedgerEvent[]>([]);

  const addTxEvent = (status: RecordStatus) => {
    setTxEvents(prev => [...prev, {
      event_id: `evt-tx-${prev.length}`, type: "RECORD_REGISTERED",
      actor: "Dr. James Wilson", actor_org: "Mercy General Hospital",
      target_id: resultData?.recordId || "new", timestamp: new Date().toISOString(),
      description: `Record status: ${status.replace(/_/g, " ")}`,
      tx_hash: "0x" + Math.random().toString(16).substr(2, 12) + "...",
      block_number: 48300 + prev.length,
    }]);
  };

  const runRegistration = async () => {
    setProcessing(true); setError(""); setStep(2);
    try {
      // Encrypt step
      await new Promise(r => setTimeout(r, 1500));
      setStep(3); setTxStatus("DRAFT"); addTxEvent("DRAFT");

      const result = await api.registerRecord({ patientId: patientId!, type: recordType, title });
      setResultData({ recordId: result.recordId, hash: result.hash, uri: result.uri });

      // Advance through statuses
      for (const status of STATUS_FLOW.slice(1)) {
        await new Promise(r => setTimeout(r, 1200));
        setTxStatus(status);
        addTxEvent(status);
      }
      setStep(4);
      toast({ title: "Record registered", description: "Metadata committed to the immutable ledger." });
    } catch {
      setError("Transaction failed. Please retry.");
      toast({ title: "Registration failed", description: "An error occurred during the transaction.", variant: "destructive" });
    } finally { setProcessing(false); }
  };

  const resetWizard = () => {
    setShowWizard(false); setStep(0); setTitle(""); setFileName("");
    setTxStatus("DRAFT"); setResultData(null); setError(""); setTxEvents([]);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/provider/patients")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </button>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Patient Records</h1>
          <p className="text-sm text-muted-foreground mt-1">Patient {patientId} · {records.length} records</p></div>
        <Button onClick={() => { resetWizard(); setShowWizard(true); }}><Plus className="h-4 w-4 mr-1" /> Register Record</Button>
      </div>

      {showWizard && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Register New Record</h2>
            <div className="flex gap-1">{STEPS.map((s, i) => (
              <div key={s} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}</div>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Record Type</Label>
                <select value={recordType} onChange={e => setRecordType(e.target.value as RecordType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  {(Object.entries(RECORD_TYPE_LABELS) as [RecordType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">FHIR Resource hint: {recordType === "lab_result" ? "DiagnosticReport" : recordType === "imaging" ? "ImagingStudy" : "DocumentReference"}</p>
              </div>
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Complete Blood Count (CBC)" /></div>
              <Button onClick={() => setStep(1)} disabled={!title}>Next: Upload File</Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">Upload medical document</p>
                <p className="text-xs text-muted-foreground mb-3">PDF, DICOM, or HL7 file (max 50MB)</p>
                <Button variant="outline" size="sm" onClick={() => setFileName("patient_report.pdf")}>
                  {fileName ? `✓ ${fileName}` : "Choose File (Mock)"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">The file will be encrypted client-side before upload. Only the hash anchor is stored on the ledger.</p>
              <div className="flex gap-2">
                <Button onClick={runRegistration} disabled={!fileName}>Encrypt & Register</Button>
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              </div>
            </div>
          )}
          {(step === 2 || step === 3) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{step === 2 ? "Encrypting document…" : "Submitting transaction…"}</p>
                <Progress value={step === 2 ? 40 : (STATUS_FLOW.indexOf(txStatus) + 1) / STATUS_FLOW.length * 100} className="h-2" />
              </div>
              {step === 3 && (
                <div className="flex flex-wrap gap-2">{STATUS_FLOW.map((s, i) => (
                  <div key={s} className={`flex items-center gap-1.5 text-xs ${STATUS_FLOW.indexOf(txStatus) >= i ? "text-foreground" : "text-muted-foreground"}`}>
                    {STATUS_FLOW.indexOf(txStatus) >= i ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground" />}
                    {s.replace(/_/g, " ")}
                  </div>
                ))}</div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={runRegistration}><RefreshCw className="h-3 w-3 mr-1" /> Retry</Button>
                </div>
              )}
              {txEvents.length > 0 && <LedgerTimeline events={txEvents} />}
            </div>
          )}
          {step === 4 && resultData && (
            <div className="space-y-4">
              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Record successfully registered</p>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                {[["Record ID", resultData.recordId], ["Hash", resultData.hash], ["URI", resultData.uri]].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span>
                    <span className="font-mono text-xs text-foreground flex items-center gap-1">{(v as string).substring(0, 30)}…
                      <button onClick={() => { navigator.clipboard.writeText(v as string).catch(() => {}); }} className="text-primary"><Copy className="h-3 w-3" /></button>
                    </span></div>
                ))}
              </div>
              {txEvents.length > 0 && <LedgerTimeline events={txEvents} />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetWizard}>Back to Records</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {records.length === 0 ? <EmptyState icon={FileText} title="No records" description="No records registered for this patient yet." actionLabel="Register Record" onAction={() => { resetWizard(); setShowWizard(true); }} /> :
          records.map(r => <RecordCard key={r.record_id} record={r} />)}
      </div>
    </div>
  );
}
