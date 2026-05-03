import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Which roles are allowed. Omit to allow any authenticated + approved user. */
  allowedRoles?: string[];
  /** Require hasReportAccess flag instead of a specific role list. */
  requireReportAccess?: boolean;
  /** Redirect destination when access is denied (default: /dashboard). */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireReportAccess = false,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading: authLoading, consentGiven, consentLoading } = useAuth();
  const {
    userRole,
    loading: roleLoading,
    hasReportAccess,
  } = useUserRole();

  if (authLoading || roleLoading || consentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → auth page
  if (!user) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  // Consent gate — skip for any admin role, only enforce for learners
  const ADMIN_ROLES = ['super_admin', 'producer_admin', 'municipality_admin', 'sme_admin'];
  const isAdmin = ADMIN_ROLES.includes(userRole?.role ?? '');
  if (!isAdmin && consentGiven === false) {
    return <Navigate to="/consent" state={{ from: location }} replace />;
  }

  // Report-access guard
  if (requireReportAccess && !hasReportAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role-based guard
  if (allowedRoles && allowedRoles.length > 0) {
    const actualRole = userRole?.role ?? null;
    const isAllowed = actualRole && (allowedRoles.includes(actualRole) || actualRole === 'super_admin');
    if (!isAllowed) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
