/**
 * PatientConsentDetail — Full consent policy detail with revoke/extend, ledger events.
 * Primary button: "Revoke Consent" (with SecureActionModal + warning)
 * Secondary: "Extend Duration", "Back to Consents"
 * Modals: SecureActionModal for revoke/extend
 * Toasts: "Consent revoked", "Consent extended"
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockConsents, mockLedgerEvents } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { StatusBadge } from "@/components/StatusBadge";
import { OrgBadge } from "@/components/OrgBadge";
import { LedgerTimeline } from "@/components/LedgerTimeline";
import { SecureActionModal } from "@/components/SecureActionModal";
import { ErrorState } from "@/components/ErrorState";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShieldOff, Clock, AlertTriangle, Calendar, Building2 } from "lucide-react";

export default function PatientConsentDetail() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<{ title: string; desc: string; confirm: string; onConfirm: () => void; destructive?: boolean }>({
    title: "", desc: "", confirm: "Confirm", onConfirm: () => {},
  });
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const consent = mockConsents.find(c => c.policy_id === policyId);
  if (!consent) return <ErrorState title="Consent not found" description={`No consent policy with ID "${policyId}" exists.`} traceId={`TRACE-${Date.now()}`} onRetry={() => navigate("/patient/consents")} />;

  const status = localStatus || consent.status;
  const relatedEvents = mockLedgerEvents.filter(e => e.target_id === consent.policy_id);
  const validFrom = new Date(consent.valid_from).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const validTo = new Date(consent.valid_to).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleRevoke = () => {
    setSecureAction({
      title: "Revoke Consent",
      desc: "Are you sure you want to revoke this consent? Future access will be denied immediately. Note: data that has already been downloaded by the organization may still exist in their systems.",
      confirm: "Revoke Consent",
      destructive: true,
      onConfirm: async () => {
        await api.revokeConsent(consent.policy_id);
        setLocalStatus("REVOKED");
        toast({ title: "Consent revoked", description: `Access for ${consent.grantee_org} has been revoked.` });
      },
    });
    setSecureOpen(true);
  };

  const handleExtend = () => {
    setSecureAction({
      title: "Extend Consent Duration",
      desc: "Extend the validity of this consent by an additional 6 months. The organization will continue to have access under the same scope.",
      confirm: "Extend",
      onConfirm: async () => {
        toast({ title: "Consent extended", description: "Validity extended by 6 months." });
      },
    });
    setSecureOpen(true);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/patient/consents")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Consents
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{consent.grantee_org}</h1>
          <p className="text-sm text-muted-foreground mt-1">{consent.purpose}</p>
        </div>
        <StatusBadge status={status as any} />
      </div>

      {/* Warning for active consents */}
      {status === "ACTIVE" && (
        <div className="rounded-lg border border-info/30 bg-info/5 p-4 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">This organization can currently access your records</p>
            <p className="text-xs text-muted-foreground">Under the scope defined below, until {validTo}.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Details */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Policy Details</h3>
            {[
              ["Policy ID", consent.policy_id],
              ["Grantee Organization", consent.grantee_org],
              ["Created", new Date(consent.created_at).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Data Scope</h3>
            <div className="flex flex-wrap gap-1.5">
              {consent.data_scope.types.map(t => (
                <span key={t} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {RECORD_TYPE_LABELS[t]}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{validFrom} — {validTo}</span>
            </div>
          </div>

          {/* Actions */}
          {status === "ACTIVE" && (
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleRevoke}>
                <ShieldOff className="h-4 w-4 mr-1" /> Revoke Consent
              </Button>
              <Button variant="outline" onClick={handleExtend}>
                <Clock className="h-4 w-4 mr-1" /> Extend Duration
              </Button>
            </div>
          )}
          {status === "PENDING" && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Pending your approval</p>
                <p className="text-xs text-muted-foreground">This organization has requested access. Review the scope and approve or decline from the Consents page.</p>
              </div>
            </div>
          )}
          {status === "REVOKED" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
              This consent has been revoked. The organization can no longer access your records under this policy.
            </div>
          )}
        </div>

        {/* Ledger Events */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Ledger History</h3>
          {relatedEvents.length > 0 ? (
            <LedgerTimeline events={relatedEvents} />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No ledger events recorded for this policy yet.</div>
          )}
        </div>
      </div>

      <SecureActionModal open={secureOpen} onOpenChange={setSecureOpen} title={secureAction.title} description={secureAction.desc} confirmLabel={secureAction.confirm} onConfirm={secureAction.onConfirm} destructive={secureAction.destructive} />
    </div>
  );
}
