import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplianceStats } from "@/hooks/useComplianceStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Building2, Users, Clock, TrendingUp } from "lucide-react";
import { ExportButtonGroup } from "@/components/admin/ExportButton";

// Green gradient based on compliance rate
const getBarColor = (rate: number) => {
  if (rate >= 80) return "#16a34a";  // green-600
  if (rate >= 50) return "#ca8a04";  // yellow-600
  return "#dc2626";                   // red-600
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-medium text-foreground truncate max-w-[180px]">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value}% completion rate</p>
    </div>
  );
}

export function ComplianceDashboard() {
  const { data, loading } = useComplianceStats();

  const chartData = (data?.rows ?? [])
    .sort((a, b) => b.compliance_rate - a.compliance_rate)
    .slice(0, 20) // show top 20 SMEs to keep chart readable
    .map(r => ({
      name: r.company_name || r.sme_id,
      rate: r.compliance_rate,
    }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Compliance Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Platform-wide training compliance overview
              </p>
            </div>
            <ExportButtonGroup type="compliance" label="Compliance Report" />
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : (
            <>
              <StatsCard
                title="Total SMEs"
                value={data?.totalSMEs ?? 0}
                icon={Building2}
                description="Registered organisations"
              />
              <StatsCard
                title="Total Users"
                value={data?.totalUsers ?? 0}
                icon={Users}
                description="All registered users"
              />
              <StatsCard
                title="Training Hours"
                value={`${data?.totalTrainingHours ?? 0}h`}
                icon={Clock}
                description="Total time spent learning"
              />
              <StatsCard
                title="Completion Rate"
                value={`${data?.overallCompletionRate ?? 0}%`}
                icon={TrendingUp}
                description="Overall course completion"
              />
            </>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate by SME</CardTitle>
              <CardDescription>
                Course completion rates across all SME organisations (top 20 shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full rounded-lg" />
              ) : chartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                  No SME data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={getBarColor(entry.rate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Table */}
        {!loading && data && data.rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>SME Breakdown</CardTitle>
                <CardDescription>
                  Detailed compliance metrics per organisation
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Organisation", "Municipality", "Industry", "Staff", "Approved", "Rate", "Enrollments", "Completed", "Certs"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.rows
                      .sort((a, b) => b.compliance_rate - a.compliance_rate)
                      .map((row) => (
                        <tr key={row.sme_id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium">{row.company_name || row.sme_id}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{row.municipality || "—"}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{row.industry_sector || "—"}</td>
                          <td className="py-2.5 px-3">{row.total_staff}</td>
                          <td className="py-2.5 px-3">{row.approved_staff}</td>
                          <td className="py-2.5 px-3">
                            <span style={{ color: getBarColor(row.compliance_rate) }} className="font-semibold">
                              {row.compliance_rate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">{row.total_enroll}</td>
                          <td className="py-2.5 px-3">{row.completed}</td>
                          <td className="py-2.5 px-3">{row.certificates}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ComplianceDashboard;
