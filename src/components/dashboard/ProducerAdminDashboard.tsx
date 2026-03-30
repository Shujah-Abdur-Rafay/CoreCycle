import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  Award,
  BarChart3,
  ArrowRight,
  FileText,
  TrendingUp,
  Target
} from "lucide-react";

export function ProducerAdminDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-display font-bold text-foreground">
          Producer Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your producer program and track compliance
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
          title="Registered SMEs"
          value={0}
          icon={Building2}
          description="In your program"
        />
        <StatsCard
          title="Active Learners"
          value={0}
          icon={Users}
          description="Currently training"
          variant="info"
        />
        <StatsCard
          title="Certificates Issued"
          value={0}
          icon={Award}
          description="This quarter"
          variant="success"
        />
        <StatsCard
          title="Compliance Rate"
          value="0%"
          icon={Target}
          description="Overall compliance"
          variant="warning"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              View Reports
            </CardTitle>
            <CardDescription>
              Access compliance and training reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/reports">
              <Button variant="forest" className="w-full">
                Open Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Manage SMEs
            </CardTitle>
            <CardDescription>
              View and manage registered SMEs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/smes">
              <Button variant="outline" className="w-full">
                View SMEs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Report
            </CardTitle>
            <CardDescription>
              Create custom compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full">
                Create Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your producer program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
