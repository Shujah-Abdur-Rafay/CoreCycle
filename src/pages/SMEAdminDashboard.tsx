import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SMEMemberList } from "@/components/sme/SMEMemberList";
import { SMECourseList } from "@/components/sme/SMECourseList";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, BookOpen, Award, TrendingUp } from "lucide-react";

interface SMEStats {
  memberCount: number;
  allocatedCourses: number;
  completedEnrollments: number;
  complianceRate: number;
}

const SMEAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { isSmeAdmin, isApproved, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<SMEStats>({
    memberCount: 0,
    allocatedCourses: 0,
    completedEnrollments: 0,
    complianceRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const smeId = profile?.sme_id ?? null;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isSmeAdmin) navigate("/dashboard");
  }, [isSmeAdmin, roleLoading, navigate]);

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
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            SME Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.company_name ?? "Your Organisation"} — Training Overview
          </p>
        </motion.div>

        {/* Stats */}
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

        {/* Member List & Course List */}
        {smeId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <SMEMemberList smeId={smeId} />
            <SMECourseList smeId={smeId} />
          </motion.div>
        ) : (
          <div className="text-center py-12 border rounded-xl bg-muted/20">
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
