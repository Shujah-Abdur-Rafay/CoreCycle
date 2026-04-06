import { motion } from "framer-motion";
import { useSMEReports } from "@/hooks/useSMEReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExportButtonGroup } from "@/components/admin/ExportButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Loader2,
  BarChart3,
} from "lucide-react";

export function SMEReports() {
  const { reports, loading, error } = useSMEReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error loading reports: {error.message}
      </div>
    );
  }

  // Calculate totals
  const totals = reports.reduce(
    (acc, r) => ({
      members: acc.members + r.member_count,
      enrollments: acc.enrollments + r.total_enrollments,
      completed: acc.completed + r.completed_enrollments,
      certificates: acc.certificates + r.certificates_earned,
      timeSpent: acc.timeSpent + r.total_time_spent_minutes,
    }),
    { members: 0, enrollments: 0, completed: 0, certificates: 0, timeSpent: 0 }
  );

  const overallCompletionRate = totals.enrollments > 0 
    ? Math.round((totals.completed / totals.enrollments) * 100) 
    : 0;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">SME Reports</h2>
          <p className="text-muted-foreground">Course completion rates and training metrics by SME organization</p>
        </div>
        <ExportButtonGroup type="sme_report" label="SME Performance Report" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total SMEs</p>
                  <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">{totals.members}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollments</p>
                  <p className="text-2xl font-bold text-foreground">{totals.enrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{overallCompletionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-2xl font-bold text-foreground">{totals.certificates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            SME Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No SME data available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Enrollments</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead className="text-center">Certificates</TableHead>
                  <TableHead className="text-right">Time Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, index) => (
                  <motion.tr
                    key={report.sme_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.industry_sector ? (
                        <Badge variant="outline">{report.industry_sector}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {report.member_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{report.total_enrollments}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={report.completed_enrollments > 0 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : ""
                        }
                      >
                        {report.completed_enrollments}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={report.completion_rate} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-10 text-right">
                          {report.completion_rate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award className="h-3 w-3 text-amber-500" />
                        {report.certificates_earned}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(report.total_time_spent_minutes)}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
