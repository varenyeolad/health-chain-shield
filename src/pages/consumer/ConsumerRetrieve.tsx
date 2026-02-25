/**
 * ConsumerRetrieve — Discover metadata + retrieve ciphertext + hash verify + decrypt simulation.
 * Flow: "Fetching ciphertext…" → "Verifying hash…" → "Requesting key…" → "Decrypting…"
 * Toasts: "Record retrieved", "Hash mismatch detected"
 */
import { useState } from "react";
import { mockRecords, mockConsents } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { RecordCard } from "@/components/RecordCard";
import { HashVerification } from "@/components/HashVerification";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const RETRIEVE_STEPS = ["Fetching ciphertext…", "Verifying hash…", "Requesting decryption key…", "Decrypting…", "Complete"];

export default function ConsumerRetrieve() {
  const { toast } = useToast();
  const [retrieving, setRetrieving] = useState<string | null>(null);
  const [retrieveStep, setRetrieveStep] = useState(0);
  const [retrieveError, setRetrieveError] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [hashStatus, setHashStatus] = useState<"match" | "mismatch" | "verifying">("verifying");

  const activeConsent = mockConsents.find(c => c.status === "ACTIVE");
  const coveredRecords = activeConsent ? mockRecords.filter(r =>
    activeConsent.data_scope.types.includes(r.type) && r.patient_id === activeConsent.patient_id
  ) : [];

  const handleRetrieve = async (recordId: string) => {
    setRetrieving(recordId); setRetrieveStep(0); setRetrieveError(""); setHashStatus("verifying");
    try {
      for (let i = 0; i < 4; i++) {
        setRetrieveStep(i);
        await new Promise(r => setTimeout(r, 800));
        if (i === 1) setHashStatus("match");
      }
      setRetrieveStep(4);
      toast({ title: "Record retrieved", description: "Access event has been logged on the immutable ledger." });
    } catch (e: any) {
      if (e.message === "HASH_MISMATCH") {
        setHashStatus("mismatch");
        setRetrieveError("Hash mismatch detected. This document may have been tampered with. Retrieval blocked. An anomaly has been logged.");
        toast({ title: "Hash mismatch", description: "Retrieval blocked for safety.", variant: "destructive" });
      } else {
        setRetrieveError("Retrieval failed. Please try again.");
        toast({ title: "Retrieval failed", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-foreground">Retrieve Records</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover and retrieve records covered by active consent.</p></div>

      {activeConsent && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
          <p className="font-medium text-foreground">Active consent: {activeConsent.grantee_org}</p>
          <p className="text-xs text-muted-foreground">Covered by consent #{activeConsent.policy_id} · {activeConsent.purpose}</p>
        </div>
      )}

      {/* Retrieve flow */}
      {retrieving && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-fade-in">
          <h3 className="text-sm font-medium text-foreground">Retrieving record {retrieving}</h3>
          <Progress value={(retrieveStep + 1) / RETRIEVE_STEPS.length * 100} className="h-2" />
          <div className="space-y-2">{RETRIEVE_STEPS.slice(0, -1).map((step, i) => (
            <div key={step} className={`flex items-center gap-2 text-xs ${retrieveStep >= i ? (retrieveStep > i ? "text-success" : "text-foreground") : "text-muted-foreground"}`}>
              {retrieveStep > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : retrieveStep === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground" />}
              {step}
            </div>
          ))}</div>
          {retrieveStep >= 1 && <HashVerification expected="sha256:e3b0c44..." actual="sha256:e3b0c44..." status={hashStatus} />}
          {retrieveError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{retrieveError}</p>
            </div>
          )}
          {retrieveStep === 4 && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Record successfully retrieved and decrypted</p>
              <p className="text-xs text-muted-foreground mt-1">Access event logged on immutable ledger.</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setRetrieving(null)}>Close</Button>
        </div>
      )}

      {/* Purpose input */}
      {!retrieving && (
        <div className="space-y-2">
          <Label>Access Purpose (required for audit)</Label>
          <Input value={purposeInput} onChange={e => setPurposeInput(e.target.value)} placeholder="State the purpose of this retrieval…" />
        </div>
      )}

      {coveredRecords.length === 0 ? <EmptyState icon={Download} title="No records available" description="No records are currently accessible under your active consents." /> : (
        <div className="space-y-3">{coveredRecords.map(r => (
          <div key={r.record_id} className="flex items-center gap-3">
            <div className="flex-1"><RecordCard record={r} /></div>
            {!retrieving && <Button size="sm" disabled={!purposeInput} onClick={() => handleRetrieve(r.record_id)}>
              <Download className="h-3.5 w-3.5 mr-1" /> Retrieve
            </Button>}
          </div>
        ))}</div>
      )}
    </div>
  );
}
