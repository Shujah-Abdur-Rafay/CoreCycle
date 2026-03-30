import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEnrollments } from "@/hooks/useEnrollments";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Clock, 
  Award,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface LearnerDashboardProps {
  canEnroll: boolean;
}

export function LearnerDashboard({ canEnroll }: LearnerDashboardProps) {
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCourses = enrollments.filter(e => e.status === 'in_progress').length;
  const totalTimeSpent = enrollments.reduce((acc, e) => acc + (e.time_spent_minutes || 0), 0);
  const certificatesEarned = enrollments.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">
          My Learning Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and continue your training
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
          title="Courses Enrolled"
          value={enrollments.length}
          icon={BookOpen}
          description="Total courses"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCourses}
          icon={GraduationCap}
          description="Currently learning"
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
          title="Time Spent"
          value={`${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`}
          icon={Clock}
          description="Total learning time"
          variant="info"
        />
      </motion.div>

      {/* My Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            My Courses
          </h2>
          {canEnroll && (
            <Link to="/courses">
              <Button variant="ghost" size="sm">
                Browse All Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
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
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start your learning journey by enrolling in a course
            </p>
            {canEnroll && (
              <Link to="/courses">
                <Button variant="forest">
                  Browse Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Certificates Section */}
      {certificatesEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              My Certificates
            </h2>
            <Link to="/certificates">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-leaf/10 to-primary/10 rounded-xl border border-leaf/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-leaf/20">
                <Award className="h-8 w-8 text-leaf" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {certificatesEarned} Certificate{certificatesEarned !== 1 ? 's' : ''} Earned
                </h3>
                <p className="text-sm text-muted-foreground">
                  Download and share your achievements
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
