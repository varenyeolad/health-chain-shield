/**
 * PermissionGuard — Route-level and action-level permission enforcement.
 * Wraps routes to check user role against allowed paths.
 * Shows ForbiddenPage if access denied.
 */
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute, getDefaultRoute } from "@/lib/permissions";
import { useLocation, Navigate } from "react-router-dom";
import { ForbiddenPage } from "@/pages/ForbiddenPage";

interface PermissionGuardProps {
  children: React.ReactNode;
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  if (!canAccessRoute(user.role, location.pathname)) {
    return <ForbiddenPage userRole={user.role} attemptedPath={location.pathname} />;
  }

  return <>{children}</>;
}
