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
  const { user, loading: authLoading } = useAuth();
  const {
    userRole,
    loading: roleLoading,
    isSuperAdmin,
    isSmeAdmin,
    isApproved,
    hasReportAccess,
  } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → auth page
  if (!user) {
    return <Navigate to={`/auth?mode=login`} state={{ from: location }} replace />;
  }

  // Report-access guard
  if (requireReportAccess && !hasReportAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role-based guard
  if (allowedRoles && allowedRoles.length > 0) {
    // Use the actual (non-simulated) role for security checks
    const actualRole = userRole?.role ?? null;
    const isAllowed = actualRole && (allowedRoles.includes(actualRole) || actualRole === 'super_admin');
    if (!isAllowed) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
