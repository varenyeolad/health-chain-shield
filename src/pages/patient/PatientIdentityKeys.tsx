/**
 * PatientIdentityKeys — Full identity & security management.
 * Primary: "Regenerate Key" (SecureActionModal)
 * Secondary: "Add Recovery Method", "Remove Device", "Force Logout All"
 * Sections: Key Info, Trusted Devices, MFA Management, Recovery Methods,
 *   Suspicious Activity Log, Session Control
 * Toasts: "Key regenerated", "Device removed", "MFA updated", "Sessions revoked"
 * Error state: "Failed to load key information"
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SecureActionModal } from "@/components/SecureActionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";
import {
  Key, Smartphone, Monitor, AlertTriangle, CheckCircle2, Shield, RefreshCw,
  Plus, Copy, LogOut, Lock, Clock, XCircle, Eye, Fingerprint, Mail,
} from "lucide-react";

const mockKeyInfo = {
  publicKey: "0x04a1b2c3d4e5f6...78901234",
  algorithm: "ECDSA secp256k1",
  created: "2025-06-01T10:00:00Z",
  status: "active" as const,
  lastRotated: "2025-06-01T10:00:00Z",
  securityLevel: "high" as const,
};

const mockDevices = [
  { id: "dev-1", name: "Chrome on macOS", type: "desktop" as const, boundAt: "2025-06-01T10:00:00Z", lastUsed: "2026-02-25T12:00:00Z", current: true, trusted: true, location: "San Francisco, CA" },
  { id: "dev-2", name: "Safari on iPhone", type: "mobile" as const, boundAt: "2025-08-15T09:00:00Z", lastUsed: "2026-02-24T08:30:00Z", current: false, trusted: true, location: "San Francisco, CA" },
  { id: "dev-3", name: "Firefox on Windows", type: "desktop" as const, boundAt: "2026-01-10T14:00:00Z", lastUsed: "2026-01-15T16:00:00Z", current: false, trusted: false, location: "Unknown" },
];

const mockRecovery = [
  { id: "rec-1", type: "email", value: "s***n@email.com", verified: true, addedAt: "2025-06-01" },
  { id: "rec-2", type: "security_questions", value: "3 questions set", verified: true, addedAt: "2025-06-15" },
  { id: "rec-3", type: "backup_codes", value: "8 codes remaining", verified: true, addedAt: "2025-07-01" },
];

const mockSuspiciousEvents = [
  { id: "sus-1", type: "failed_login", description: "3 failed login attempts from IP 203.0.113.42", timestamp: "2026-02-20T03:15:00Z", severity: "warning" as const },
  { id: "sus-2", type: "new_device", description: "Login from unrecognized device (Firefox on Windows)", timestamp: "2026-01-10T14:00:00Z", severity: "info" as const },
  { id: "sus-3", type: "location_change", description: "Login from new location: Unknown", timestamp: "2026-01-10T14:00:00Z", severity: "warning" as const },
];

const mockMfaMethods = [
  { id: "mfa-1", type: "authenticator", name: "Authenticator App", enabled: true, icon: Fingerprint },
  { id: "mfa-2", type: "sms", name: "SMS Verification", enabled: false, icon: Smartphone },
  { id: "mfa-3", type: "email", name: "Email OTP", enabled: true, icon: Mail },
];

export default function PatientIdentityKeys() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<{ title: string; desc: string; confirm: string; onConfirm: () => void; destructive?: boolean }>({
    title: "", desc: "", confirm: "Confirm", onConfirm: () => {},
  });
  const [mfaMethods, setMfaMethods] = useState(mockMfaMethods);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const openSecure = (title: string, desc: string, confirm: string, onConfirm: () => void, destructive = false) => {
    setSecureAction({ title, desc, confirm, onConfirm, destructive });
    setSecureOpen(true);
  };

  if (error) return <ErrorState title="Failed to load key information" description="Could not retrieve identity data." traceId="TRC-KEYS" onRetry={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500); }} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Identity & Security</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your cryptographic identity, devices, MFA, and recovery options.</p>
      </div>

      {/* Security Level Banner */}
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">Security Level: <span className="text-success">High</span></p>
            <p className="text-xs text-muted-foreground">MFA enabled, key active, 2 recovery methods configured</p>
          </div>
        </div>
        <Badge variant="default" className="text-xs">Strong</Badge>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Untrusted device detected</p>
          <p className="text-xs text-muted-foreground">
            "Firefox on Windows" has not been verified as trusted. Review and take action below.
          </p>
        </div>
      </div>

      {/* Key Info */}
      {loading ? <Skeleton className="h-40 w-full rounded-lg" /> : (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Cryptographic Key
            </h2>
            <span className="flex items-center gap-1 text-xs text-success font-medium"><CheckCircle2 className="h-3 w-3" /> Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Public Key", mockKeyInfo.publicKey],
              ["Algorithm", mockKeyInfo.algorithm],
              ["Created", new Date(mockKeyInfo.created).toLocaleDateString()],
              ["Last Rotated", new Date(mockKeyInfo.lastRotated).toLocaleDateString()],
            ].map(([label, val]) => (
              <div key={label} className="text-sm"><span className="text-muted-foreground text-xs">{label}</span><p className="text-foreground font-mono text-xs">{val}</p></div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(mockKeyInfo.publicKey).catch(() => {}); toast({ title: "Public key copied" }); }}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Key
            </Button>
            <Button size="sm" variant="outline" onClick={() => openSecure(
              "Regenerate Key", "This will generate a new key pair. Your old key will be revoked. Existing consents will need to be re-established.", "Regenerate",
              () => toast({ title: "Key regenerated", description: "Your new key pair is now active." }), true,
            )}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* MFA Management */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2"><Lock className="h-4 w-4" /> Multi-Factor Authentication</h2>
        <div className="space-y-2">
          {mfaMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <method.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.enabled ? "Active" : "Not configured"}</p>
                </div>
              </div>
              <Switch checked={method.enabled} onCheckedChange={(v) => {
                openSecure(
                  v ? `Enable ${method.name}` : `Disable ${method.name}`,
                  v ? "You'll need to verify this method." : "Disabling this may reduce your account security.",
                  v ? "Enable" : "Disable",
                  () => { setMfaMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: v } : m)); toast({ title: `${method.name} ${v ? "enabled" : "disabled"}` }); },
                  !v,
                );
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2"><Monitor className="h-4 w-4" /> Trusted Devices</h2>
          <Button size="sm" variant="outline" onClick={() => openSecure("Force Logout All Devices", "This will sign you out from all devices except the current one.", "Logout All",
            () => toast({ title: "All other sessions ended" }), true)}>
            <LogOut className="h-3.5 w-3.5 mr-1" /> Force Logout All
          </Button>
        </div>
        <div className="space-y-2">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />) :
            mockDevices.map(device => (
              <div key={device.id} className={`flex items-center justify-between rounded-lg border p-4 ${device.trusted ? "border-border bg-card" : "border-warning/30 bg-warning/5"}`}>
                <div className="flex items-center gap-3">
                  {device.type === "desktop" ? <Monitor className="h-4 w-4 text-muted-foreground" /> : <Smartphone className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {device.name}
                      {device.current && <Badge variant="default" className="ml-2 text-[10px]">Current</Badge>}
                      {!device.trusted && <Badge variant="destructive" className="ml-2 text-[10px]">Untrusted</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {device.location} · Last used: {new Date(device.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!device.trusted && (
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Device marked as trusted" })}>Trust</Button>
                  )}
                  {!device.current && (
                    <Button size="sm" variant="ghost" onClick={() => openSecure(
                      "Remove Device", `Remove "${device.name}" from your bound devices?`, "Remove",
                      () => toast({ title: "Device removed" }), true,
                    )}>Remove</Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recovery Methods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-foreground">Recovery Methods</h2>
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Add recovery method", description: "This feature is coming soon." })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Method
          </Button>
        </div>
        <div className="space-y-2">
          {mockRecovery.map(method => (
            <div key={method.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{method.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{method.value} · Added {method.addedAt}</p>
                </div>
              </div>
              {method.verified && <span className="text-xs text-success font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Suspicious Activity */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Recent Security Events</h2>
        <div className="space-y-2">
          {mockSuspiciousEvents.map(event => (
            <div key={event.id} className={`flex items-center gap-3 rounded-lg border p-3 ${event.severity === "warning" ? "border-warning/30 bg-warning/5" : "border-border bg-card"}`}>
              {event.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-warning-foreground shrink-0" /> : <Eye className="h-4 w-4 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <p className="text-sm text-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <Badge variant={event.severity === "warning" ? "secondary" : "outline"} className="text-[10px]">{event.type.replace(/_/g, " ")}</Badge>
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
