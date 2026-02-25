/**
 * PatientConsents — Consent management with tabs, approve/decline pending, consent builder.
 * Primary button: "Approve" (pending requests), "Create Consent" (wizard)
 * Secondary: "Decline", "View Details"
 * Table columns: Organization, Purpose, Scope, Duration, Status, Actions
 * Filters: status tabs
 * Modals: SecureActionModal for approve, ConsentScopeBuilder wizard
 * Toasts: "Consent approved", "Request declined"
 * Empty state: "No consent policies in this category"
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockConsents, mockAccessRequests } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { ConsentCard } from "@/components/ConsentCard";
import { OrgBadge } from "@/components/OrgBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SecureActionModal } from "@/components/SecureActionModal";
import { EmptyState } from "@/components/EmptyState";
import { ConsentScopeBuilder, type ConsentScope } from "@/components/ConsentScopeBuilder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ConsentStatus, RecordType } from "@/types/medical";
import { RECORD_TYPE_LABELS } from "@/types/medical";
import { Shield, Plus, CheckCircle2, XCircle, AlertTriangle, Loader2, Building2, Calendar } from "lucide-react";

const TABS: { label: string; filter: ConsentStatus | "all" }[] = [
  { label: "All", filter: "all" },
  { label: "Active", filter: "ACTIVE" },
  { label: "Pending", filter: "PENDING" },
  { label: "Revoked", filter: "REVOKED" },
  { label: "Expired", filter: "EXPIRED" },
];

export default function PatientConsents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<ConsentStatus | "all">("all");
  const [secureOpen, setSecureOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardScope, setWizardScope] = useState<ConsentScope>({ types: [], from: "", to: "", purpose: "" });
  const [wizardOrg, setWizardOrg] = useState("");

  const filtered = tab === "all" ? mockConsents : mockConsents.filter(c => c.status === tab);
  const pendingRequests = mockAccessRequests.filter(r => r.status === "pending" && !approvedIds.includes(r.request_id) && !declinedIds.includes(r.request_id));

  const handleApprove = (requestId: string, orgName: string) => {
    setSecureOpen(true);
    setProcessing(requestId);
  };

  const confirmApprove = async () => {
    if (processing) {
      await api.grantConsent(processing);
      setApprovedIds(prev => [...prev, processing]);
      toast({ title: "Consent approved", description: "Access has been granted. A new ledger event has been recorded." });
      setProcessing(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setDeclinedIds(prev => [...prev, requestId]);
    toast({ title: "Request declined", description: "The organization has been notified." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Consent Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage who can access your medical records and for what purpose.</p>
        </div>
        <Button onClick={() => { setShowWizard(true); setWizardStep(0); setWizardScope({ types: [], from: "", to: "", purpose: "" }); setWizardOrg(""); }}>
          <Plus className="h-4 w-4 mr-1" /> New Consent
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" /> Pending Access Requests ({pendingRequests.length})
          </h3>
          {pendingRequests.map(req => (
            <div key={req.request_id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.requester_org}</p>
                  <p className="text-xs text-muted-foreground mt-1">{req.purpose}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {req.scope_types.map(t => (
                      <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                        {RECORD_TYPE_LABELS[t as RecordType] || t}
                      </span>
                    ))}
                  </div>
                  {req.urgency === "emergency" && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Emergency
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => handleApprove(req.request_id, req.requester_org)}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDecline(req.request_id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consent Builder Wizard */}
      {showWizard && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground">Create New Consent Policy</h2>
          {wizardStep === 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Organization</label>
                <select value={wizardOrg} onChange={e => setWizardOrg(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Choose an organization…</option>
                  <option value="Metro Health Network">Metro Health Network</option>
                  <option value="BioGenomics Lab">BioGenomics Lab</option>
                  <option value="CareFirst Insurance">CareFirst Insurance</option>
                  <option value="City Medical Center">City Medical Center</option>
                </select>
              </div>
              <Button onClick={() => setWizardStep(1)} disabled={!wizardOrg}>Next: Define Scope</Button>
            </>
          )}
          {wizardStep === 1 && (
            <>
              <ConsentScopeBuilder value={wizardScope} onChange={setWizardScope} />
              <div className="flex gap-2">
                <Button onClick={() => setWizardStep(2)} disabled={wizardScope.types.length === 0 || !wizardScope.purpose}>Next: Review</Button>
                <Button variant="outline" onClick={() => setWizardStep(0)}>Back</Button>
              </div>
            </>
          )}
          {wizardStep === 2 && (
            <>
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h3 className="text-sm font-medium text-foreground">Review Consent Policy</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Organization:</span> <span className="text-foreground font-medium">{wizardOrg}</span></p>
                  <p><span className="text-muted-foreground">Types:</span> <span className="text-foreground">{wizardScope.types.map(t => RECORD_TYPE_LABELS[t]).join(", ")}</span></p>
                  <p><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{wizardScope.from || "Any"} — {wizardScope.to || "Indefinite"}</span></p>
                  <p><span className="text-muted-foreground">Purpose:</span> <span className="text-foreground">{wizardScope.purpose}</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setSecureOpen(true);
                  setProcessing("wizard");
                }}>Grant Consent</Button>
                <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                <Button variant="ghost" onClick={() => setShowWizard(false)}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.filter}
            onClick={() => setTab(t.filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.filter ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({t.filter === "all" ? mockConsents.length : mockConsents.filter(c => c.status === t.filter).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <ConsentCard key={c.policy_id} consent={c} onClick={() => navigate(`/patient/consents/${c.policy_id}`)} />
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={Shield} title="No consent policies" description="No consent policies in this category." />
        )}
      </div>

      <SecureActionModal
        open={secureOpen}
        onOpenChange={v => { setSecureOpen(v); if (!v) setProcessing(null); }}
        title={processing === "wizard" ? "Grant Consent" : "Approve Access Request"}
        description={processing === "wizard"
          ? `You are granting ${wizardOrg} access to your records. This will be recorded on the immutable ledger. Confirm your identity to proceed.`
          : "Confirm your identity to approve this access request. The organization will be granted access according to the defined scope."
        }
        confirmLabel={processing === "wizard" ? "Grant Consent" : "Approve"}
        onConfirm={async () => {
          if (processing === "wizard") {
            await api.grantConsent("new");
            setShowWizard(false);
            toast({ title: "Consent granted", description: `${wizardOrg} now has access to your records.` });
          } else {
            await confirmApprove();
          }
        }}
      />
    </div>
  );
}
