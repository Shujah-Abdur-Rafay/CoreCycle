import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PendingApproval } from "@/components/dashboard/PendingApproval";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { ProducerAdminDashboard } from "@/components/dashboard/ProducerAdminDashboard";
import { MunicipalityAdminDashboard } from "@/components/dashboard/MunicipalityAdminDashboard";
import { SMEAdminDashboard } from "@/components/dashboard/SMEAdminDashboard";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
import { UserProfileSwitcher, useSimulatedUser } from "@/components/admin/UserProfileSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BarChart3,
  ArrowRight,
  Eye,
  Shield,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  producer_admin: "Producer Admin",
  municipality_admin: "Municipality Admin",
  sme_admin: "SME Admin",
  learner: "Learner",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    userRole,
    loading: roleLoading,
    isApproved,
    hasReportAccess,
    canEnroll,
    effectiveRole,
    simulatedRole,
    isSuperAdmin,
    isProducerAdmin,
    isMunicipalityAdmin,
    isSmeAdmin,
    setSimulatedRole,
  } = useUserRole();
  const { simulatedUser, isSimulating } = useSimulatedUser();

  // The ACTUAL role (never affected by simulation)
  const actualIsSuperAdmin = userRole?.role === 'super_admin';

  // ── Redirect unauthenticated users ──────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  // ── Auto-redirect real Super Admins straight to Admin Panel ─────────────
  // Only when NOT previewing a role; if previewing, stay on /dashboard to
  // show the simulated user view.
  useEffect(() => {
    if (!roleLoading && actualIsSuperAdmin && !simulatedRole) {
      navigate("/admin", { replace: true });
    }
  }, [actualIsSuperAdmin, roleLoading, simulatedRole, navigate]);

  // ── SME admins (actual or simulated) have their own dedicated dashboard ───
  useEffect(() => {
    if (!roleLoading && effectiveRole === 'sme_admin') {
      navigate("/sme-dashboard", { replace: true });
    }
  }, [effectiveRole, roleLoading, navigate]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // ── Pending approval ─────────────────────────────────────────────────────
  if (!isApproved && !actualIsSuperAdmin) {
    return (
      <DashboardLayout>
        <PendingApproval />
      </DashboardLayout>
    );
  }

  // ── Super Admin is previewing a role ────────────────────────────────────
  // Render the appropriate user-facing view inside DashboardLayout,
  // plus a persistent "View as" bar at the top of the page content.
  if (actualIsSuperAdmin && simulatedRole) {
    const getInitials = (name: string | null, email: string | null) => {
      if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      if (email) return email.slice(0, 2).toUpperCase();
      return 'U';
    };

    const renderSimulatedContent = () => {
      if (isProducerAdmin) return <ProducerAdminDashboard />;
      if (isMunicipalityAdmin) return <MunicipalityAdminDashboard />;
      // learner (default)
      return <LearnerDashboard canEnroll={canEnroll} />;
    };

    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* ── Persistent "View as" Control Bar ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-16 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-warning/10 border-b border-warning/30 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left: who you're viewing as */}
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-warning leading-none">
                    Previewing as {roleLabels[simulatedRole]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your actual role is Super Admin
                  </p>
                </div>
                {/* Simulated specific user badge */}
                {isSimulating && simulatedUser && (
                  <div className="flex items-center gap-2 pl-3 border-l border-warning/30">
                    <Avatar className="h-6 w-6 border border-warning/50">
                      <AvatarFallback className="bg-warning/20 text-warning text-xs font-medium">
                        {getInitials(simulatedUser.profile.full_name, simulatedUser.profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-warning font-medium">
                      {simulatedUser.profile.full_name || simulatedUser.profile.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: role switcher + back to admin */}
              <div className="flex items-center gap-3 flex-wrap">
                <RoleSwitcher compact />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning"
                  onClick={() => {
                    setSimulatedRole(null);
                    navigate("/admin");
                  }}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Back to Admin
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── User Profile Switcher (for testing specific user data) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <UserProfileSwitcher />
          </motion.div>

          {/* ── Reports access banner for previewed admin roles ────────── */}
          {hasReportAccess && !isSuperAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gradient-to-r from-primary/10 to-leaf/10 rounded-xl border border-primary/20 p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Reports & Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      View training reports, compliance data, and analytics
                    </p>
                  </div>
                </div>
                <Link to="/reports">
                  <Button variant="forest">
                    View Reports
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Role-specific content ─────────────────────────────────── */}
          {renderSimulatedContent()}
        </div>
      </DashboardLayout>
    );
  }

  // ── Regular (non-super-admin) user dashboard ─────────────────────────────
  const renderDashboardContent = () => {
    if (isProducerAdmin)    return <ProducerAdminDashboard />;
    if (isMunicipalityAdmin) return <MunicipalityAdminDashboard />;
    if (isSmeAdmin)         return <SMEAdminDashboard />;
    return <LearnerDashboard canEnroll={canEnroll} />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Reports Access Banner */}
        {hasReportAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-gradient-to-r from-primary/10 to-leaf/10 rounded-xl border border-primary/20 p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Reports & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View training reports, compliance data, and analytics
                  </p>
                </div>
              </div>
              <Link to="/reports">
                <Button variant="forest">
                  View Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {renderDashboardContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
