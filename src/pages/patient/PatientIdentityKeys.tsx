/**
 * PatientIdentityKeys — Key status, device binding, recovery methods, warnings.
 * Primary button: "Regenerate Key" (with SecureActionModal)
 * Secondary: "Add Recovery Method", "Remove Device"
 * Table columns: Device, Bound Key, Last Used, Status, Actions
 * Modals: SecureActionModal for key operations
 * Toasts: "Key regenerated", "Recovery method added"
 * Empty state: n/a (always shows current key)
 * Error state: "Failed to load key information"
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SecureActionModal } from "@/components/SecureActionModal";
import { useToast } from "@/hooks/use-toast";
import { Key, Smartphone, Monitor, AlertTriangle, CheckCircle2, Shield, RefreshCw, Plus, Copy } from "lucide-react";

const mockKeyInfo = {
  publicKey: "0x04a1b2c3d4e5f6...78901234",
  algorithm: "ECDSA secp256k1",
  created: "2025-06-01T10:00:00Z",
  status: "active" as const,
};

const mockDevices = [
  { id: "dev-1", name: "Chrome on macOS", type: "desktop" as const, boundAt: "2025-06-01T10:00:00Z", lastUsed: "2026-02-25T12:00:00Z", current: true },
  { id: "dev-2", name: "Safari on iPhone", type: "mobile" as const, boundAt: "2025-08-15T09:00:00Z", lastUsed: "2026-02-24T08:30:00Z", current: false },
];

const mockRecovery = [
  { id: "rec-1", type: "email", value: "s***n@email.com", verified: true },
  { id: "rec-2", type: "security_questions", value: "3 questions set", verified: true },
];

export default function PatientIdentityKeys() {
  const { toast } = useToast();
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<{ title: string; desc: string; confirm: string; onConfirm: () => void; destructive?: boolean }>({
    title: "", desc: "", confirm: "Confirm", onConfirm: () => {},
  });

  const openSecure = (title: string, desc: string, confirm: string, onConfirm: () => void, destructive = false) => {
    setSecureAction({ title, desc, confirm, onConfirm, destructive });
    setSecureOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Identity & Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your cryptographic identity, device bindings, and recovery options.</p>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Keep your recovery methods up to date</p>
          <p className="text-xs text-muted-foreground">
            If you lose access to all bound devices without a recovery method, you may permanently lose access to your encrypted records.
          </p>
        </div>
      </div>

      {/* Key Info */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Your Cryptographic Key
          </h2>
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        </div>
        <div className="space-y-2">
          {[
            ["Public Key", mockKeyInfo.publicKey],
            ["Algorithm", mockKeyInfo.algorithm],
            ["Created", new Date(mockKeyInfo.created).toLocaleDateString()],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-mono text-xs">{val}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(mockKeyInfo.publicKey).catch(() => {}); toast({ title: "Public key copied" }); }}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy Key
          </Button>
          <Button size="sm" variant="outline" onClick={() => openSecure(
            "Regenerate Key",
            "This will generate a new cryptographic key pair. Your old key will be revoked. Existing consents will need to be re-established. This action is irreversible.",
            "Regenerate",
            () => toast({ title: "Key regenerated", description: "Your new key pair is now active." }),
            true,
          )}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
          </Button>
        </div>
      </div>

      {/* Bound Devices */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Bound Devices</h2>
        <div className="space-y-3">
          {mockDevices.map(device => (
            <div key={device.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                {device.type === "desktop" ? <Monitor className="h-4 w-4 text-muted-foreground" /> : <Smartphone className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {device.name} {device.current && <span className="text-xs text-success">(This device)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bound: {new Date(device.boundAt).toLocaleDateString()} · Last used: {new Date(device.lastUsed).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!device.current && (
                <Button variant="ghost" size="sm" onClick={() => openSecure(
                  "Remove Device",
                  `Remove "${device.name}" from your bound devices? You won't be able to sign transactions from this device.`,
                  "Remove",
                  () => toast({ title: "Device removed" }),
                  true,
                )}>Remove</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Methods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Recovery Methods</h2>
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Add recovery method", description: "This feature is coming soon." })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Method
          </Button>
        </div>
        <div className="space-y-3">
          {mockRecovery.map(method => (
            <div key={method.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{method.type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{method.value}</p>
                </div>
              </div>
              {method.verified && <span className="text-xs text-success font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>}
            </div>
          ))}
        </div>
      </div>

      <SecureActionModal
        open={secureOpen}
        onOpenChange={setSecureOpen}
        title={secureAction.title}
        description={secureAction.desc}
        confirmLabel={secureAction.confirm}
        onConfirm={secureAction.onConfirm}
        destructive={secureAction.destructive}
      />
    </div>
  );
}
