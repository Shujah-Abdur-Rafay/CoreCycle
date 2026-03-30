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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Loader2,
  BarChart3,
  ArrowRight,
  Shield,
  Eye,
  User
} from "lucide-react";

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
    isSmeAdmin
  } = useUserRole();
  const { simulatedUser, isSimulating } = useSimulatedUser();

  // Check if actual role is super_admin (for showing role switcher)
  const actualIsSuperAdmin = userRole?.role === 'super_admin';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Show pending approval message for unapproved users
  // Only bypass if user is a super admin
  if (!isApproved && !actualIsSuperAdmin) {
    return (
      <DashboardLayout>
        <PendingApproval />
      </DashboardLayout>
    );
  }

  // Role labels for display
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    producer_admin: "Producer Admin",
    municipality_admin: "Municipality Admin",
    sme_admin: "SME Admin",
    learner: "Learner",
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Render the appropriate dashboard based on effective role
  const renderDashboardContent = () => {
    // Super admin viewing as their actual role goes to admin dashboard
    if (isSuperAdmin && !simulatedRole) {
      return (
        <div className="space-y-8">
          {/* Admin Quick Access Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary/10 to-destructive/10 rounded-xl border border-primary/20 p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Super Admin Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have full administrative privileges
                  </p>
                </div>
              </div>
              <Link to="/admin">
                <Button variant="forest">
                  Open Admin Panel
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Show learner dashboard for super admin's own learning */}
          <LearnerDashboard canEnroll={canEnroll} />
        </div>
      );
    }

    if (isProducerAdmin) {
      return <ProducerAdminDashboard />;
    }

    if (isMunicipalityAdmin) {
      return <MunicipalityAdminDashboard />;
    }

    if (isSmeAdmin) {
      return <SMEAdminDashboard />;
    }

    // Default to learner dashboard
    return <LearnerDashboard canEnroll={canEnroll} />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* User Profile Switcher for Super Admins */}
        {actualIsSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 md:grid-cols-2"
          >
            <RoleSwitcher />
            <UserProfileSwitcher />
          </motion.div>
        )}

        {/* Simulated User Banner */}
        {isSimulating && simulatedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              <AvatarFallback className="bg-primary/20 text-primary font-medium">
                {getInitials(simulatedUser.profile.full_name, simulatedUser.profile.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                Viewing as: {simulatedUser.profile.full_name || simulatedUser.profile.email || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground">
                Role: {roleLabels[simulatedUser.role] || simulatedUser.role} • This is a simulated view for testing purposes.
              </p>
            </div>
          </motion.div>
        )}

        {/* Simulated Role Banner (when not simulating a specific user) */}
        {simulatedRole && !isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3"
          >
            <Eye className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">
                Viewing as {roleLabels[simulatedRole]}
              </p>
              <p className="text-xs text-muted-foreground">
                This is a simulated view. Your actual role is Super Admin.
              </p>
            </div>
          </motion.div>
        )}

        {/* Reports Access Banner (for admin roles with report access) */}
        {hasReportAccess && !isSuperAdmin && (
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
                  <h3 className="text-lg font-medium text-foreground">
                    Reports & Analytics
                  </h3>
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

        {/* Role-specific Dashboard Content */}
        {renderDashboardContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
