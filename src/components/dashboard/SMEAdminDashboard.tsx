import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Building2, 
  Users, 
  Award,
  BarChart3,
  ArrowRight,
  GraduationCap,
  UserPlus,
  ClipboardCheck,
  Link as LinkIcon
} from "lucide-react";

import { InviteMemberDialog } from "@/components/dashboard/InviteMemberDialog";

export function SMEAdminDashboard() {
  const { profile } = useAuth();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCourses = enrollments.filter(e => e.status === 'in_progress').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">
          SME Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your team's training and compliance
          {profile?.company_name && (
            <span className="ml-2 inline-flex items-center gap-1 text-primary">
              <Building2 className="h-4 w-4" />
              {profile.company_name}
            </span>
          )}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Team Members"
          value={0}
          icon={Users}
          description="In your organization"
        />
        <StatsCard
          title="Training Progress"
          value={inProgressCourses}
          icon={GraduationCap}
          description="Courses in progress"
          variant="warning"
        />
        <StatsCard
          title="Completed"
          value={completedCourses}
          icon={Award}
          description="Courses finished"
          variant="success"
        />
        <StatsCard
          title="Compliance"
          value="0%"
          icon={ClipboardCheck}
          description="Team compliance"
          variant="info"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Add staff to your training program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InviteMemberDialog />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const inviteLink = `${window.location.origin}/auth?invite=${profile?.sme_id || 'team'}`;
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied to clipboard!");
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Team Reports
            </CardTitle>
            <CardDescription>
              View your team's training progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/reports">
              <Button variant="outline" className="w-full">
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Browse Courses
            </CardTitle>
            <CardDescription>
              Enroll your team in courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/courses">
              <Button variant="outline" className="w-full">
                View Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* My Training Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            My Training
          </h2>
          <Link to="/courses">
            <Button variant="ghost" size="sm">
              Browse Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No courses enrolled
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by enrolling in required training courses
            </p>
            <Link to="/courses">
              <Button variant="forest">
                Browse Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
