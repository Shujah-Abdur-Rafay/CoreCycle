import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { SMEAdminLayout } from "@/components/admin/SMEAdminLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import { SMEManagement } from "@/components/admin/SMEManagement";
import { BulkUserUpload } from "@/components/admin/BulkUserUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Upload, Building2, BarChart3 } from "lucide-react";
import { SMEReports } from "@/components/admin/SMEReports";

const SMEAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isSmeAdmin, loading: roleLoading } = useUserRole();

  const path = location.pathname;
  const isUserManagement = path === "/sme-dashboard/users" || path === "/sme-dashboard";
  const isSMEManagement = path === "/sme-dashboard/smes";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isSmeAdmin && user) {
      navigate("/dashboard");
    }
  }, [isSmeAdmin, roleLoading, user, navigate]);

  // Default redirect: /sme-dashboard -> /sme-dashboard/users
  useEffect(() => {
    if (path === "/sme-dashboard") {
      navigate("/sme-dashboard/users", { replace: true });
    }
  }, [path, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isSmeAdmin) return null;

  // ── User Management page ──
  if (isUserManagement) {
    return (
      <SMEAdminLayout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users within your SME organisation
            </p>
          </motion.div>

          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            <TabsContent value="bulk">
              <BulkUserUpload />
            </TabsContent>
          </Tabs>
        </div>
      </SMEAdminLayout>
    );
  }

  // ── SME Management page ──
  if (isSMEManagement) {
    return (
      <SMEAdminLayout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold text-foreground">
              SME Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage SME organisations and their details
            </p>
          </motion.div>

          <Tabs defaultValue="management">
            <TabsList className="mb-6">
              <TabsTrigger value="management" className="gap-2">
                <Building2 className="h-4 w-4" />
                SME Management
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                SME Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="management">
              <SMEManagement />
            </TabsContent>
            <TabsContent value="reports">
              <SMEReports />
            </TabsContent>
          </Tabs>
        </div>
      </SMEAdminLayout>
    );
  }

  // Fallback loading state while redirect fires
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default SMEAdminDashboard;
