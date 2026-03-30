import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Loader2, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock 
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { isSmeAdmin, isProducerAdmin, isSuperAdmin } = useUserRole();

  const isManagement = isSmeAdmin || isProducerAdmin || isSuperAdmin;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            {isManagement 
              ? "Track your organization's training progress and compliance scores" 
              : "Track your personal learning progress and achievements"}
          </p>
        </motion.div>

        {isManagement ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatsCard
                title="Total Team"
                value="12"
                icon={Users}
                description="Registered members"
              />
              <StatsCard
                title="Completion Rate"
                value="85%"
                icon={Award}
                description="Course completion"
                variant="success"
              />
              <StatsCard
                title="Compliance"
                value="92%"
                icon={CheckCircle2}
                description="Meets requirements"
                variant="info"
              />
              <StatsCard
                title="Avg. Time"
                value="4.5h"
                icon={Clock}
                description="Per course"
                variant="warning"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Team Activity</CardTitle>
                  <CardDescription>Latest course completions and enrollments across your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Detailed activity logs will appear here as more data is collected.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center py-20">
              <CardContent>
                <BarChart3 className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Personal Progress Reports</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Detailed analytics of your learning journey are being prepared. 
                  Soon you'll be able to see time-spent breakdowns and topic mastery scores.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
