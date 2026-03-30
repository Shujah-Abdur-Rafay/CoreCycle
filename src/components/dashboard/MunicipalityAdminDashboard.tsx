import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Users, 
  Award,
  BarChart3,
  ArrowRight,
  FileText,
  Building2,
  CheckCircle2
} from "lucide-react";

export function MunicipalityAdminDashboard() {
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
          Municipality Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor training compliance in your municipality
          {profile?.municipality && (
            <span className="ml-2 inline-flex items-center gap-1 text-primary">
              <MapPin className="h-4 w-4" />
              {profile.municipality}
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
          title="Local SMEs"
          value={0}
          icon={Building2}
          description="In your municipality"
        />
        <StatsCard
          title="Trained Staff"
          value={0}
          icon={Users}
          description="Completed training"
          variant="success"
        />
        <StatsCard
          title="Certificates"
          value={0}
          icon={Award}
          description="Issued this month"
          variant="info"
        />
        <StatsCard
          title="Compliant"
          value="0%"
          icon={CheckCircle2}
          description="SME compliance rate"
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
              Compliance Reports
            </CardTitle>
            <CardDescription>
              View training compliance across your municipality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/reports">
              <Button variant="forest" className="w-full">
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Local Businesses
            </CardTitle>
            <CardDescription>
              View SMEs registered in your area
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
              Export Data
            </CardTitle>
            <CardDescription>
              Generate reports for municipal records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full">
                Generate Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Municipality Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Municipality Overview
            </CardTitle>
            <CardDescription>
              Summary of waste management training in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No data available yet</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
