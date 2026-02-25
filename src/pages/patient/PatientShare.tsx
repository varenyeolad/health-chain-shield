/**
 * PatientShare — Quick share wizard: scope + duration + purpose + generate link/QR + revoke link.
 * Primary button: "Generate Share Link"
 * Secondary: "Revoke Link", "Copy Link"
 * Table columns (existing links): Purpose, Scope, Expires, Accesses, Status, Actions
 * Modals: SecureActionModal for link generation and revocation
 * Toasts: "Share link created", "Share link revoked"
 * Empty state: "No active share links"
 */
import { useState } from "react";
import { mockShareLinks } from "@/lib/mock-data";
import { api } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SecureActionModal } from "@/components/SecureActionModal";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { RECORD_TYPE_LABELS, type RecordType } from "@/types/medical";
import { Link2, Copy, Trash2, AlertTriangle, QrCode, Plus, Loader2, Share2, ExternalLink } from "lucide-react";

const ALL_TYPES = Object.keys(RECORD_TYPE_LABELS) as RecordType[];

export default function PatientShare() {
  const { toast } = useToast();
  const [links, setLinks] = useState(mockShareLinks);
  const [showWizard, setShowWizard] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<{ title: string; desc: string; onConfirm: () => void }>({ title: "", desc: "", onConfirm: () => {} });
  const [creating, setCreating] = useState(false);

  // Wizard state
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([]);
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("24h");
  const [isEmergency, setIsEmergency] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const toggleType = (t: RecordType) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleCreate = () => {
    setSecureAction({
      title: "Create Share Link",
      desc: isEmergency
        ? "You are creating an EMERGENCY share link. This will grant broad access and will be flagged in your audit log."
        : "Confirm your identity to create a time-limited share link.",
      onConfirm: async () => {
        setCreating(true);
        try {
          const result = await api.createShareLink({ scopeTypes: selectedTypes, purpose, duration, isEmergency });
          setGeneratedUrl(result.url);
          toast({ title: "Share link created", description: `Link expires in ${duration}.` });
        } catch {
          toast({ title: "Failed to create link", description: "Please try again.", variant: "destructive" });
        } finally {
          setCreating(false);
        }
      },
    });
    setSecureOpen(true);
  };

  const handleRevoke = (linkId: string) => {
    setSecureAction({
      title: "Revoke Share Link",
      desc: "This will immediately invalidate the link. Anyone with the link will no longer be able to access your records.",
      onConfirm: async () => {
        await api.revokeShareLink(linkId);
        setLinks(prev => prev.map(l => l.id === linkId ? { ...l, active: false } : l));
        toast({ title: "Share link revoked" });
      },
    });
    setSecureOpen(true);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Link copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Quick Share</h1>
          <p className="text-sm text-muted-foreground mt-1">Create time-limited access links to share your records securely.</p>
        </div>
        <Button onClick={() => { setShowWizard(true); setGeneratedUrl(""); setSelectedTypes([]); setPurpose(""); setDuration("24h"); setIsEmergency(false); }}>
          <Plus className="h-4 w-4 mr-1" /> New Share Link
        </Button>
      </div>

      {/* Wizard */}
      {showWizard && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-display font-semibold text-foreground">Create Share Link</h2>

          {generatedUrl ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center space-y-3">
                <QrCode className="h-16 w-16 text-success mx-auto" />
                <p className="text-sm font-medium text-foreground">Your share link is ready</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="text-xs font-mono text-muted-foreground bg-muted rounded px-2 py-1">{generatedUrl}</code>
                  <button onClick={() => copyToClipboard(generatedUrl)} className="text-primary hover:text-primary/80">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">This link will expire in {duration}. Share it securely with the intended recipient.</p>
              </div>
              <Button variant="outline" onClick={() => setShowWizard(false)}>Done</Button>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium">Record Types to Share</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                      <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => toggleType(type)} />
                      <span className="text-xs text-foreground">{RECORD_TYPE_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Purpose</Label>
                <Textarea placeholder="Why are you sharing? (e.g., 'Sharing with specialist for consultation')" value={purpose} onChange={e => setPurpose(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Emergency Access</p>
                  <p className="text-xs text-muted-foreground">Grants broader access and is flagged in audit log.</p>
                </div>
                <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={selectedTypes.length === 0 || !purpose || creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Generate Share Link
                </Button>
                <Button variant="outline" onClick={() => setShowWizard(false)}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Existing Links */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Active Share Links</h2>
        {links.filter(l => l.active).length === 0 ? (
          <EmptyState icon={Share2} title="No active share links" description="Create a share link to give someone temporary access to your records." />
        ) : (
          <div className="space-y-3">
            {links.filter(l => l.active).map(link => (
              <div key={link.id} className={`rounded-lg border bg-card p-4 ${link.isEmergency ? "border-warning/50" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{link.purpose}</p>
                      <p className="text-xs text-muted-foreground">{link.scope_types.map(t => RECORD_TYPE_LABELS[t as RecordType] || t).join(", ")}</p>
                    </div>
                  </div>
                  {link.isEmergency && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-warning-foreground bg-warning/15 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Emergency
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-4">
                    <span>Expires: {new Date(link.expires_at).toLocaleDateString()}</span>
                    <span>Accessed: {link.accessCount} times</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.url)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(link.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SecureActionModal open={secureOpen} onOpenChange={setSecureOpen} title={secureAction.title} description={secureAction.desc} onConfirm={secureAction.onConfirm} />
    </div>
  );
}
