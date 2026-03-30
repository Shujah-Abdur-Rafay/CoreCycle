import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEnrollments } from "@/hooks/useEnrollments";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ExportButton } from "@/components/admin/ExportButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportMyProgress } from "@/hooks/useExportData";
import { toast } from "sonner";
import {
  BarChart3,
  Loader2,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Download,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isSmeAdmin, isProducerAdmin, isSuperAdmin, isMunicipalityAdmin } = useUserRole();
  const { enrollments, loading: enrollLoading } = useEnrollments();
  const [exportingPersonal, setExportingPersonal] = useState(false);

  const isManagement = isSmeAdmin || isProducerAdmin || isSuperAdmin || isMunicipalityAdmin;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=login");
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // ── Learner stats ──────────────────────────────────────────────────────────
  const completed   = enrollments.filter(e => e.status === "completed").length;
  const inProgress  = enrollments.filter(e => e.status === "in_progress").length;
  const totalTime   = enrollments.reduce((acc, e) => acc + (e.time_spent_minutes ?? 0), 0);
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress_percentage ?? 0), 0) / enrollments.length)
    : 0;

  const handlePersonalExport = async () => {
    setExportingPersonal(true);
    try {
      await exportMyProgress(user.id);
      toast.success("Your progress exported successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Export failed");
    } finally {
      setExportingPersonal(false);
    }
  };

  const fmtTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              {isManagement
                ? "Track your organisation's training progress and compliance"
                : "Track your personal learning progress and achievements"}
            </p>
          </div>

          {/* Personal export — always visible */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={exportingPersonal || enrollLoading}
            onClick={handlePersonalExport}
          >
            {exportingPersonal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportingPersonal ? "Exporting…" : "Export My Progress"}
          </Button>
        </motion.div>

        {/* ── Learner stats (always shown) ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Enrolled Courses"
            value={enrollLoading ? "…" : String(enrollments.length)}
            icon={BookOpen}
            description="Total enrollments"
          />
          <StatsCard
            title="Completed"
            value={enrollLoading ? "…" : String(completed)}
            icon={CheckCircle2}
            description="Courses finished"
            variant="success"
          />
          <StatsCard
            title="Avg Progress"
            value={enrollLoading ? "…" : `${avgProgress}%`}
            icon={TrendingUp}
            description="Across all courses"
            variant="info"
          />
          <StatsCard
            title="Time Spent"
            value={enrollLoading ? "…" : fmtTime(totalTime)}
            icon={Clock}
            description="Total learning time"
            variant="warning"
          />
        </motion.div>

        {/* ── Course breakdown table ────────────────────────────────────────── */}
        {!enrollLoading && enrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>My Course Progress</CardTitle>
                  <CardDescription>Detailed breakdown of each enrolled course</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Course</th>
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 pr-4 font-medium">Progress</th>
                        <th className="text-left py-2 font-medium">Time Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(e => (
                        <tr key={e.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium text-foreground">
                            {e.course?.title ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              e.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : e.status === "in_progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {e.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${e.progress_percentage ?? 0}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {e.progress_percentage ?? 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {fmtTime(e.time_spent_minutes ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Management exports (admin / SME / producer / municipality) ───── */}
        {isManagement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Organisation Exports</CardTitle>
                <CardDescription>
                  Download CSV reports for your organisation's training data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ExportCard
                    icon={BarChart3}
                    title="User Progress"
                    description="Per-user course progress, scores & certificates"
                    exportType="user_progress"
                    label="User Progress Report"
                  />
                  <ExportCard
                    icon={BookOpen}
                    title="Training Summary"
                    description="Completion rates aggregated per course"
                    exportType="training_summary"
                    label="Training Summary"
                  />
                  <ExportCard
                    icon={Award}
                    title="Quiz Results"
                    description="All quiz scores with pass/fail status"
                    exportType="quiz_results"
                    label="Quiz Results"
                  />
                  <ExportCard
                    icon={Award}
                    title="Certificate Audit"
                    description="All issued certificates — audit-ready"
                    exportType="certificate_audit"
                    label="Certificate Audit"
                  />
                  {(isSuperAdmin || isProducerAdmin) && (
                    <ExportCard
                      icon={Users}
                      title="User Activity"
                      description="All users with roles and approval status"
                      exportType="user_activity"
                      label="User Activity"
                    />
                  )}
                  {(isSuperAdmin || isProducerAdmin) && (
                    <ExportCard
                      icon={CheckCircle2}
                      title="Compliance Report"
                      description="Per-company compliance rates"
                      exportType="compliance"
                      label="Compliance Report"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty state for pure learners with no enrollments */}
        {!isManagement && !enrollLoading && enrollments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center py-16">
              <CardContent>
                <BarChart3 className="h-14 w-14 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No data yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Enrol in a course to start tracking your progress here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Small helper card ─────────────────────────────────────────────────────────
function ExportCard({
  icon: Icon,
  title,
  description,
  exportType,
  label,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  exportType: Parameters<typeof ExportButton>[0]["type"];
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
      <ExportButton type={exportType} label={label} className="w-full justify-center" />
    </div>
  );
}

export default Reports;
