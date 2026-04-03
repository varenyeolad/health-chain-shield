/**
 * ForbiddenPage — Shown when a user tries to access a route outside their role.
 * Displays: role, attempted path, trace code, link back to dashboard.
 */
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";
import { getDefaultRoute } from "@/lib/permissions";
import type { UserRole } from "@/types/medical";

interface ForbiddenPageProps {
  userRole: UserRole;
  attemptedPath: string;
}

export function ForbiddenPage({ userRole, attemptedPath }: ForbiddenPageProps) {
  const traceCode = `TRACE-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <ShieldOff className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        Your current role (<span className="font-medium capitalize text-foreground">{userRole}</span>) does not have permission to access this resource.
      </p>
      <p className="text-xs text-muted-foreground mb-1">
        Attempted path: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{attemptedPath}</code>
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Trace: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{traceCode}</code>
      </p>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        If you believe this is an error, contact your system administrator with the trace code above. All access attempts are logged.
      </p>
      <Button asChild>
        <Link to={getDefaultRoute(userRole)}>Return to Dashboard</Link>
      </Button>
    </div>
  );
}
