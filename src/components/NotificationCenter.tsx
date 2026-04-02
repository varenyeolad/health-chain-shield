/**
 * NotificationCenter — Bell icon drawer with notification list, severity, mark read, preferences.
 */
import { useState } from "react";
import { mockNotifications, type AppNotification } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Shield, FileText, Zap, Download, CheckCircle2, Settings, Info } from "lucide-react";
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

export function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClick = (notif: AppNotification) => {
    markRead(notif.id);
    if (notif.actionUrl) {
      setOpen(false);
      navigate(notif.actionUrl);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No notifications</div>
          ) : notifications.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Info;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50 ${SEVERITY_STYLES[notif.severity]} ${!notif.read ? "bg-accent/20" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${notif.severity === "critical" ? "text-destructive" : notif.severity === "warning" ? "text-warning-foreground" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
