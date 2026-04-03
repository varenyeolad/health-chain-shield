/**
 * NotificationCenter — Full workflow-driven notification system.
 * Features: severity filters, critical pinned alerts, preferences, mark read.
 * Types: consent_request, consent_approved, consent_revoked, emergency_access,
 *   record_added, retrieval_complete, export_complete, suspicious_activity, system
 */
import { useState } from "react";
import { mockNotifications, type AppNotification } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell, AlertTriangle, Shield, FileText, Zap, Download, CheckCircle2, Settings, Info,
  Pin, Filter, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_ICONS: Record<string, React.ElementType> = {
  consent_request: Shield,
  consent_approved: CheckCircle2,
  consent_revoked: Shield,
  emergency_access: Zap,
  record_added: FileText,
  retrieval_complete: Download,
  export_complete: Download,
  suspicious_activity: AlertTriangle,
  system: Settings,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-border",
  warning: "border-warning/30 bg-warning/5",
  critical: "border-destructive/30 bg-destructive/5",
};

type SeverityFilter = "all" | "info" | "warning" | "critical";

export function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({ email: true, sms: false, inApp: true, digest: false, criticalAlways: true });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === "critical" && !n.read).length;

  const filteredNotifs = filter === "all" ? notifications : notifications.filter(n => n.severity === filter);
  const pinnedNotifs = filteredNotifs.filter(n => n.severity === "critical" && !n.read);
  const regularNotifs = filteredNotifs.filter(n => !(n.severity === "critical" && !n.read));

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const handleClick = (notif: AppNotification) => {
    markRead(notif.id);
    if (notif.actionUrl) { setOpen(false); navigate(notif.actionUrl); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-sidebar-accent transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4 text-sidebar-foreground" />
          {unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${criticalCount > 0 ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground"}`}>
              {unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[460px] flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowPrefs(!showPrefs)} className="h-7 w-7 p-0">
                <Settings className="h-3.5 w-3.5" />
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">Mark all read</Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Preferences Panel */}
        {showPrefs && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 mt-2 space-y-2">
            <p className="text-xs font-semibold text-foreground">Notification Preferences</p>
            {[
              { key: "email", label: "Email notifications", val: prefs.email },
              { key: "sms", label: "SMS alerts", val: prefs.sms },
              { key: "inApp", label: "In-app notifications", val: prefs.inApp },
              { key: "digest", label: "Daily digest", val: prefs.digest },
              { key: "criticalAlways", label: "Critical alerts always on", val: prefs.criticalAlways },
            ].map(p => (
              <div key={p.key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{p.label}</span>
                <Switch checked={p.val} onCheckedChange={(v) => setPrefs(prev => ({ ...prev, [p.key]: v }))} />
              </div>
            ))}
          </div>
        )}

        {/* Severity Filters */}
        <div className="flex gap-1.5 mt-3">
          {(["all", "critical", "warning", "info"] as SeverityFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {f === "all" ? `All (${notifications.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${notifications.filter(n => n.severity === f).length})`}
            </button>
          ))}
        </div>

        {/* Pinned Critical Alerts */}
        {pinnedNotifs.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <Pin className="h-3 w-3" /> Critical Alerts
            </div>
            {pinnedNotifs.map(notif => {
              const Icon = TYPE_ICONS[notif.type] || Info;
              return (
                <button key={notif.id} onClick={() => handleClick(notif)}
                  className="w-full text-left rounded-lg border border-destructive/30 bg-destructive/5 p-3 transition-colors hover:bg-destructive/10">
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }} className="p-0.5 hover:bg-background/40 rounded">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Regular Notifications */}
        <div className="mt-3 space-y-1.5 overflow-y-auto flex-1">
          {regularNotifs.length === 0 && pinnedNotifs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No notifications</div>
          ) : regularNotifs.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Info;
            return (
              <button key={notif.id} onClick={() => handleClick(notif)}
                className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50 ${SEVERITY_STYLES[notif.severity]} ${!notif.read ? "bg-accent/20" : ""}`}>
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${notif.severity === "critical" ? "text-destructive" : notif.severity === "warning" ? "text-warning-foreground" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }} className="p-0.5 hover:bg-background/20 rounded opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
