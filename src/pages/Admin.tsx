import React, { useEffect, useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { sendAdminAdditionEmail } from "@/lib/emailWorkflows";
import { Loader2, Users, FileText, BookMarked, BarChart3, Upload, UserPlus, Mail, Shield } from "lucide-react";

// ─── Invite Card ─────────────────────────────────────────────────────────────

const adminRoleOptions = [
  { value: 'sme_admin',           label: 'SME Admin' },
  { value: 'producer_admin',      label: 'Producer Admin' },
  { value: 'municipality_admin',  label: 'Municipality Admin' },
  { value: 'super_admin',         label: 'Super Admin' },
];

function AdminInviteCard({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const { userRole } = useUserRole();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [role, setRole]   = useState('sme_admin');
  const [sending, setSending] = useState(false);

  // Only actual super admins can send invitations
  if (userRole?.role !== 'super_admin') return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter an email address'); return; }

    setSending(true);
    try {
      const roleLabel = adminRoleOptions.find(r => r.value === role)?.label || role;
      const result = await sendAdminAdditionEmail({
        email,
        recipientName: name || email,
        addedByName: profile?.full_name || 'Super Admin',
        role: roleLabel,
      });

      if (result.success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail(''); setName(''); setRole('sme_admin');
        setOpen(false);
      } else {
        toast.error(`Send failed: ${result.error || 'Unknown error'}`);
      }
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="forest" className="shrink-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Admin / SME
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Admin or SME
            </DialogTitle>
            <DialogDescription>
              Send a role-grant notification email to the new admin or SME manager.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inv-name-c">Full Name (optional)</Label>
              <Input id="inv-name-c" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-email-c">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="inv-email-c" type="email" placeholder="admin@company.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-role-c">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="inv-role-c"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {adminRoleOptions.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" variant="forest" className="w-full" disabled={sending}>
                {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Mail className="h-4 w-4 mr-2" />Send Invitation</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Invite Admin / SME
        </CardTitle>
        <CardDescription>
          Add a new admin or SME manager to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="forest" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite Admin or SME
              </DialogTitle>
              <DialogDescription>
                Send a role-grant notification email to the new admin or SME manager.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSend} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inv-name">Full Name (optional)</Label>
                <Input
                  id="inv-name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="inv-email"
                    type="email"
                    placeholder="admin@company.com"
                    className="pl-10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="inv-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminRoleOptions.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" variant="forest" className="w-full" disabled={sending}>
                  {sending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                  ) : (
                    <><Mail className="h-4 w-4 mr-2" />Send Invitation</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin page ──────────────────────────────────────────────────────────

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">Approve, revoke, and manage user accounts</p>
            </div>
            <AdminInviteCard compact />
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

        {/* Quick Actions — Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminInviteCard />

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Approve, revoke, and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Reports
                </CardTitle>
                <CardDescription>
                  View training and compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/reports')}
                >
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

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
