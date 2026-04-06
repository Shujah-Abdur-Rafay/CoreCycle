import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIndustrySectors } from "@/hooks/useIndustrySectors";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SMEMemberList } from "@/components/sme/SMEMemberList";
import { SMECourseList } from "@/components/sme/SMECourseList";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Building2,
  MapPin,
  Briefcase,
  Save,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SMEStats {
  memberCount: number;
  allocatedCourses: number;
  completedEnrollments: number;
  complianceRate: number;
}

interface SMEDetails {
  sme_id: string;
  company_name: string | null;
  municipality: string | null;
  industry_sector: string | null;
}

const SMEAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { isSmeAdmin, loading: roleLoading } = useUserRole();
  const { sectors, loading: sectorsLoading } = useIndustrySectors();

  // Stats
  const [stats, setStats] = useState<SMEStats>({
    memberCount: 0,
    allocatedCourses: 0,
    completedEnrollments: 0,
    complianceRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // SME details
  const [smeDetails, setSmeDetails] = useState<SMEDetails | null>(null);
  const [smeForm, setSmeForm] = useState({ company_name: "", municipality: "", industry_sector: "" });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsDirty, setDetailsDirty] = useState(false);

  // Add member
  const [addEmail, setAddEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);

  const smeId = profile?.sme_id ?? null;

  // Auth guards
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isSmeAdmin) navigate("/dashboard");
  }, [isSmeAdmin, roleLoading, navigate]);

  // Fetch SME details
  useEffect(() => {
    if (!smeId) return;
    supabase
      .from("smes" as any)
      .select("sme_id, company_name, municipality, industry_sector")
      .eq("sme_id", smeId)
      .single()
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && data) {
          const d = data as SMEDetails;
          setSmeDetails(d);
          setSmeForm({
            company_name: d.company_name ?? "",
            municipality: d.municipality ?? "",
            industry_sector: d.industry_sector ?? "",
          });
        }
      });
  }, [smeId]);

  // Fetch stats
  useEffect(() => {
    if (!smeId) return;

    const fetchStats = async () => {
      try {
        const [{ count: memberCount }, { count: courseCount }, { data: members }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("sme_id", smeId),
            supabase
              .from("course_allocations")
              .select("*", { count: "exact", head: true })
              .eq("sme_id", smeId),
            supabase.from("profiles").select("user_id").eq("sme_id", smeId),
          ]);

        const memberIds = (members || []).map((m) => m.user_id);
        let completedCount = 0;
        let totalEnrollments = 0;

        if (memberIds.length > 0) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("status")
            .in("user_id", memberIds);

          totalEnrollments = enrollments?.length ?? 0;
          completedCount =
            enrollments?.filter((e) => e.status === "completed").length ?? 0;
        }

        setStats({
          memberCount: memberCount ?? 0,
          allocatedCourses: courseCount ?? 0,
          completedEnrollments: completedCount,
          complianceRate:
            totalEnrollments > 0
              ? Math.round((completedCount / totalEnrollments) * 100)
              : 0,
        });
      } catch (err) {
        console.error("Failed to load SME stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [smeId]);

  const handleFormChange = (field: string, value: string) => {
    setSmeForm((prev) => ({ ...prev, [field]: value }));
    setDetailsDirty(true);
  };

  const handleSaveDetails = async () => {
    if (!smeId) return;
    setSavingDetails(true);
    try {
      const { error } = await (supabase as any)
        .from("smes")
        .update({
          company_name: smeForm.company_name || null,
          municipality: smeForm.municipality || null,
          industry_sector: smeForm.industry_sector || null,
        })
        .eq("sme_id", smeId);

      if (error) throw error;

      setSmeDetails((prev) =>
        prev
          ? {
              ...prev,
              company_name: smeForm.company_name || null,
              municipality: smeForm.municipality || null,
              industry_sector: smeForm.industry_sector || null,
            }
          : prev
      );
      setDetailsDirty(false);
      toast.success("Organisation details updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddMember = async () => {
    const email = addEmail.trim();
    if (!email) return;

    setAddingMember(true);
    try {
      const { data, error } = await supabase.rpc("add_user_to_my_sme" as any, {
        target_email: email,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        toast.error(result.error || "Failed to add member");
      } else {
        toast.success(`User added to your organisation`);
        setAddEmail("");
        setMemberRefreshKey((k) => k + 1);
        // Bump stats
        setStats((prev) => ({ ...prev, memberCount: prev.memberCount + 1 }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isSmeAdmin) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              SME Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {smeDetails?.company_name ?? profile?.company_name ?? "Your Organisation"}
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-sm px-3 py-1">
            SME Admin
          </Badge>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Team Members"
            value={statsLoading ? "..." : stats.memberCount}
            icon={Users}
            description="Registered in your organisation"
          />
          <StatsCard
            title="Allocated Courses"
            value={statsLoading ? "..." : stats.allocatedCourses}
            icon={BookOpen}
            description="Available to your team"
          />
          <StatsCard
            title="Completions"
            value={statsLoading ? "..." : stats.completedEnrollments}
            icon={Award}
            description="Courses fully completed"
          />
          <StatsCard
            title="Compliance Rate"
            value={statsLoading ? "..." : `${stats.complianceRate}%`}
            icon={TrendingUp}
            description="Overall completion rate"
          />
        </motion.div>

        {smeId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="organisation" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  My Organisation
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
              </TabsList>

              {/* ── Overview tab ── */}
              <TabsContent value="overview">
                <div className="grid gap-6 lg:grid-cols-2">
                  <SMEMemberList key={memberRefreshKey} smeId={smeId} />
                  <SMECourseList smeId={smeId} />
                </div>
              </TabsContent>

              {/* ── My Organisation tab ── */}
              <TabsContent value="organisation">
                <Card className="max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Organisation Details
                    </CardTitle>
                    <CardDescription>
                      Update your organisation's information. Changes apply to all members.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Company name */}
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Company Name
                      </Label>
                      <Input
                        id="company_name"
                        value={smeForm.company_name}
                        onChange={(e) => handleFormChange("company_name", e.target.value)}
                        placeholder="e.g., Acme Recycling Ltd."
                      />
                    </div>

                    {/* Municipality */}
                    <div className="space-y-2">
                      <Label htmlFor="municipality" className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Municipality
                      </Label>
                      <Input
                        id="municipality"
                        value={smeForm.municipality}
                        onChange={(e) => handleFormChange("municipality", e.target.value)}
                        placeholder="e.g., Toronto"
                      />
                    </div>

                    {/* Industry Sector */}
                    <div className="space-y-2">
                      <Label htmlFor="industry_sector" className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        Industry Sector
                      </Label>
                      <Select
                        value={smeForm.industry_sector || "__none__"}
                        onValueChange={(v) =>
                          handleFormChange("industry_sector", v === "__none__" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={sectorsLoading ? "Loading..." : "Select sector"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="__none__">— Not specified —</SelectItem>
                          {sectors.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* SME ID (read-only info) */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        SME ID: <span className="font-mono text-foreground">{smeId}</span>
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveDetails}
                      disabled={savingDetails || !detailsDirty}
                      className="gap-2 w-full sm:w-auto"
                    >
                      {savingDetails ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Members tab ── */}
              <TabsContent value="members" className="space-y-6">
                {/* Add member */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Add Member
                    </CardTitle>
                    <CardDescription>
                      Enter the email address of an existing Corecycle account to add them to your organisation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-col sm:flex-row">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="user@example.com"
                          value={addEmail}
                          onChange={(e) => setAddEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                          className="pl-9"
                        />
                      </div>
                      <Button
                        onClick={handleAddMember}
                        disabled={addingMember || !addEmail.trim()}
                        className="gap-2 shrink-0"
                      >
                        {addingMember ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        Add to Organisation
                      </Button>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        The user must already have a Corecycle account
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        Users already belonging to another organisation cannot be added
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Member list */}
                <SMEMemberList key={memberRefreshKey} smeId={smeId} />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <div className="text-center py-12 border rounded-xl bg-muted/20">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Your account is not linked to an SME organisation.
              Contact a Super Admin to set this up.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SMEAdminDashboard;
