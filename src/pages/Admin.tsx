import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import { BulkUserUpload } from "@/components/admin/BulkUserUpload";
import { ReportGenerator } from "@/components/admin/ReportGenerator";
import { AdminStats } from "@/components/admin/AdminStats";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
import { CourseManagement } from "@/pages/admin/CourseManagement";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { ModuleManager } from "@/components/admin/ModuleManager";
import { CourseAllocation } from "@/components/admin/CourseAllocation";
import { SMEManagement } from "@/components/admin/SMEManagement";
import { SMEReports } from "@/components/admin/SMEReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, FileText, BookMarked, BarChart3, Upload } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading, simulatedRole, effectiveRole } = useUserRole();
  const [activeTab, setActiveTab] = useState("users");

  // Check if actual role is super_admin (not simulated)
  const actualIsSuperAdmin = userRole?.role === 'super_admin';

  // Determine which sub-route we're on
  const path = location.pathname;
  const isSMEManagement = path === "/admin/smes";
  const isCourseManagement = path === "/admin/courses";
  const isCourseNew = path === "/admin/courses/new";
  const isCourseEdit = path.match(/^\/admin\/courses\/[^/]+\/edit$/);
  const isModuleManager = path.match(/^\/admin\/courses\/[^/]+\/modules$/);
  const isUserManagement = path === "/admin/users";
  const isReports = path === "/admin/reports";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !actualIsSuperAdmin && user) {
      navigate("/dashboard");
    }
  }, [actualIsSuperAdmin, roleLoading, user, navigate]);

  // When a role is being simulated, redirect to /dashboard to show the user view
  useEffect(() => {
    if (!roleLoading && actualIsSuperAdmin && simulatedRole) {
      navigate("/dashboard", { replace: true });
    }
  }, [simulatedRole, roleLoading, actualIsSuperAdmin, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !actualIsSuperAdmin) return null;

  // Render SME management route
  if (isSMEManagement) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <Tabs defaultValue="management">
            <TabsList className="mb-6">
              <TabsTrigger value="management">SME Management</TabsTrigger>
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
      </AdminLayout>
    );
  }

  // Render course management sub-routes
  if (isCourseManagement) {
    return (
      <AdminLayout>
        <CourseManagement />
      </AdminLayout>
    );
  }

  if (isCourseNew || isCourseEdit) {
    return (
      <AdminLayout>
        <CourseEditor />
      </AdminLayout>
    );
  }

  if (isModuleManager) {
    return (
      <AdminLayout>
        <ModuleManager />
      </AdminLayout>
    );
  }

  if (isUserManagement) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
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
      </AdminLayout>
    );
  }

  if (isReports) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
          </motion.div>
          <ReportGenerator />
        </div>
      </AdminLayout>
    );
  }

// Default admin overview
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Role Switcher for Super Admins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RoleSwitcher />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, permissions, and generate reports
          </p>
        </motion.div>

        {/* Stats Overview */}
        <AdminStats />
        
        {/* Course Allocations quick view */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Course Allocations</h2>
          <CourseAllocation />
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
