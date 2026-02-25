/**
 * Settings — Tabs: Profile, Security, Sessions/Devices, Notifications, Language
 * Primary buttons: "Save Changes" per section
 * Secondary: "Cancel", "Sign out all devices", "Revoke session"
 * Modals: SecureActionModal for security changes
 * Toasts: "Settings saved", "Session revoked"
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SecureActionModal } from "@/components/SecureActionModal";
import { useToast } from "@/hooks/use-toast";
import { User, ShieldCheck, Monitor, Bell, Globe, Loader2 } from "lucide-react";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "sessions", label: "Sessions", icon: Monitor },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "language", label: "Language", icon: Globe },
] as const;

type TabKey = typeof TABS[number]["key"];

const mockSessions = [
  { id: "s1", device: "Chrome on macOS", ip: "192.168.1.42", lastActive: "2026-02-25T12:00:00Z", current: true },
  { id: "s2", device: "Safari on iPhone", ip: "10.0.0.15", lastActive: "2026-02-24T08:30:00Z", current: false },
  { id: "s3", device: "Firefox on Windows", ip: "172.16.0.8", lastActive: "2026-02-20T14:00:00Z", current: false },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureAction, setSecureAction] = useState<{ title: string; desc: string; onConfirm: () => void }>({ title: "", desc: "", onConfirm: () => {} });

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [auditNotifs, setAuditNotifs] = useState(true);
  const [language, setLanguage] = useState("en");

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  };

  const openSecure = (title: string, desc: string, onConfirm: () => void) => {
    setSecureAction({ title, desc, onConfirm });
    setSecureOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-accent-foreground">
                {name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role} · {user?.orgName || "Individual"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-name">Full name</Label>
              <Input id="settings-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Contact your admin to change your email.</p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save Changes
            </Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Multi-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">MFA is {mfaEnabled ? "enabled" : "disabled"}</p>
                  <p className="text-xs text-muted-foreground">Adds an extra layer of security to your account.</p>
                </div>
                <Switch
                  checked={mfaEnabled}
                  onCheckedChange={v => {
                    openSecure(
                      v ? "Enable MFA" : "Disable MFA",
                      v ? "You'll need to set up an authenticator app." : "This will reduce your account security.",
                      () => { setMfaEnabled(v); toast({ title: `MFA ${v ? "enabled" : "disabled"}` }); }
                    );
                  }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Change Password</h3>
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button size="sm" onClick={() => openSecure("Change Password", "Confirm your identity to change your password.", () => toast({ title: "Password changed" }))}>
                Update Password
              </Button>
            </div>
          </div>
        )}

        {tab === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active sessions across your devices.</p>
              <Button variant="outline" size="sm" onClick={() => openSecure("Sign out all devices", "This will end all sessions except your current one.", () => toast({ title: "All other sessions ended" }))}>
                Sign out all
              </Button>
            </div>
            {mockSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.device}{s.current && <span className="ml-2 text-xs text-success">(Current)</span>}</p>
                    <p className="text-xs text-muted-foreground">IP: {s.ip} · Last active: {new Date(s.lastActive).toLocaleDateString()}</p>
                  </div>
                </div>
                {!s.current && (
                  <Button variant="ghost" size="sm" onClick={() => toast({ title: "Session revoked" })}>Revoke</Button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            {[
              { key: "email", label: "Email notifications", desc: "Receive email alerts for consent requests and access events.", checked: emailNotifs, onChange: setEmailNotifs },
              { key: "audit", label: "Audit alerts", desc: "Get notified when your records are accessed.", checked: auditNotifs, onChange: setAuditNotifs },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={n.checked} onCheckedChange={n.onChange} />
              </div>
            ))}
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save Preferences</Button>
          </div>
        )}

        {tab === "language" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display language</Label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save</Button>
          </div>
        )}
      </div>

      <SecureActionModal open={secureOpen} onOpenChange={setSecureOpen} title={secureAction.title} description={secureAction.desc} onConfirm={secureAction.onConfirm} />
    </div>
  );
}
