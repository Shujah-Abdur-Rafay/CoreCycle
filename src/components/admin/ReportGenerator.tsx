import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  Building2,
  Award,
  Loader2,
  FileDown
} from "lucide-react";
import { format } from "date-fns";

type ReportType = 'training_summary' | 'compliance' | 'user_activity' | 'certificate_audit';

const reportTypes = [
  { 
    value: 'training_summary' as ReportType, 
    label: 'Training Summary Report',
    description: 'Overview of all training completions, pass rates, and time spent',
    icon: FileText
  },
  { 
    value: 'compliance' as ReportType, 
    label: 'Compliance Report',
    description: 'SME compliance status, staff training rates, and audit-ready data',
    icon: Building2
  },
  { 
    value: 'user_activity' as ReportType, 
    label: 'User Activity Report',
    description: 'User registrations, approvals, and role distributions',
    icon: Users
  },
  { 
    value: 'certificate_audit' as ReportType, 
    label: 'Certificate Audit Report',
    description: 'All certificates issued with verification details',
    icon: Award
  },
];

export function ReportGenerator() {
  const { user } = useAuth();
  const { users } = useAdminUsers();
  const [reportType, setReportType] = useState<ReportType>('training_summary');
  const [title, setTitle] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const generateReport = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      // Generate report data based on type
      let reportData: any = {};
      const reportTitle = title || `${reportTypes.find(r => r.value === reportType)?.label} - ${format(new Date(), 'MMM dd, yyyy')}`;

      switch (reportType) {
        case 'training_summary':
          // Fetch enrollments data
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*, course:courses(title)');
          
          reportData = {
            total_enrollments: enrollments?.length || 0,
            completed: enrollments?.filter(e => e.status === 'completed').length || 0,
            in_progress: enrollments?.filter(e => e.status === 'in_progress').length || 0,
            total_time_spent: enrollments?.reduce((acc, e) => acc + (e.time_spent_minutes || 0), 0) || 0,
            enrollments: enrollments?.map(e => ({
              course: e.course?.title,
              status: e.status,
              progress: e.progress_percentage,
              enrolled_at: e.enrolled_at,
              completed_at: e.completed_at
            }))
          };
          break;

        case 'user_activity':
          reportData = {
            total_users: users.length,
            approved: users.filter(u => u.is_approved).length,
            pending: users.filter(u => !u.is_approved).length,
            by_role: {
              super_admin: users.filter(u => u.role === 'super_admin').length,
              producer_admin: users.filter(u => u.role === 'producer_admin').length,
              municipality_admin: users.filter(u => u.role === 'municipality_admin').length,
              sme_admin: users.filter(u => u.role === 'sme_admin').length,
              learner: users.filter(u => u.role === 'learner').length,
            },
            users: users.map(u => ({
              name: u.full_name,
              email: u.email,
              company: u.company_name,
              role: u.role,
              status: u.is_approved ? 'Approved' : 'Pending',
              registered: u.created_at
            }))
          };
          break;

        case 'compliance':
          // Group users by company
          const companies = users.reduce((acc, u) => {
            if (u.company_name) {
              if (!acc[u.company_name]) {
                acc[u.company_name] = { total: 0, approved: 0 };
              }
              acc[u.company_name].total++;
              if (u.is_approved) acc[u.company_name].approved++;
            }
            return acc;
          }, {} as Record<string, { total: number; approved: number }>);

          reportData = {
            total_companies: Object.keys(companies).length,
            companies: Object.entries(companies).map(([name, data]) => ({
              company_name: name,
              total_staff: data.total,
              approved_staff: data.approved,
              compliance_rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0
            }))
          };
          break;

        case 'certificate_audit':
          const { data: certificates } = await supabase
            .from('certificates')
            .select('*');

          reportData = {
            total_certificates: certificates?.length || 0,
            certificates: certificates?.map(c => ({
              certificate_number: c.certificate_number,
              learner_name: c.learner_name,
              course_title: c.course_title,
              company: c.company_name,
              sme_id: c.sme_id,
              municipality: c.municipality,
              issued_at: c.issued_at
            }))
          };
          break;
      }

      // Save report to database
      const { data: savedReport, error } = await supabase
        .from('admin_reports')
        .insert({
          report_type: reportType,
          title: reportTitle,
          generated_by: user.id,
          date_range_start: dateFrom || null,
          date_range_end: dateTo || null,
          report_data: reportData
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedReport({ ...savedReport, report_data: reportData });
      toast.success("Report generated successfully");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (!generatedReport) return;

    let csvContent = "";
    const data = generatedReport.report_data;

    switch (reportType) {
      case 'training_summary':
        csvContent = "Course,Status,Progress,Enrolled At,Completed At\n";
        data.enrollments?.forEach((e: any) => {
          csvContent += `"${e.course}","${e.status}","${e.progress}%","${e.enrolled_at}","${e.completed_at || ''}"\n`;
        });
        break;

      case 'user_activity':
        csvContent = "Name,Email,Company,Role,Status,Registered\n";
        data.users?.forEach((u: any) => {
          csvContent += `"${u.name}","${u.email}","${u.company || ''}","${u.role}","${u.status}","${u.registered}"\n`;
        });
        break;

      case 'compliance':
        csvContent = "Company Name,Total Staff,Approved Staff,Compliance Rate\n";
        data.companies?.forEach((c: any) => {
          csvContent += `"${c.company_name}","${c.total_staff}","${c.approved_staff}","${c.compliance_rate}%"\n`;
        });
        break;

      case 'certificate_audit':
        csvContent = "Certificate Number,Learner Name,Course,Company,SME ID,Municipality,Issued At\n";
        data.certificates?.forEach((c: any) => {
          csvContent += `"${c.certificate_number}","${c.learner_name}","${c.course_title}","${c.company || ''}","${c.sme_id || ''}","${c.municipality || ''}","${c.issued_at}"\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${generatedReport.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    link.click();
    
    toast.success("CSV downloaded successfully");
  };

  const selectedReport = reportTypes.find(r => r.value === reportType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Create audit-ready reports for PRO and Producers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setReportType(type.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  reportType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    reportType === type.value ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <type.icon className={`h-5 w-5 ${
                      reportType === type.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{type.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Report Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="title">Report Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Custom report title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={isGenerating}
            variant="forest"
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report Preview */}
      {generatedReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{generatedReport.title}</CardTitle>
              <CardDescription>
                Generated on {format(new Date(generatedReport.created_at), 'MMM dd, yyyy HH:mm')}
              </CardDescription>
            </div>
            <Button onClick={downloadCSV} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {reportType === 'training_summary' && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="text-2xl font-bold">{generatedReport.report_data.total_enrollments}</p>
                  </div>
                  <div className="p-4 bg-leaf/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-leaf">{generatedReport.report_data.completed}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-amber-600">{generatedReport.report_data.in_progress}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Time (min)</p>
                    <p className="text-2xl font-bold text-primary">{generatedReport.report_data.total_time_spent}</p>
                  </div>
                </>
              )}
              {reportType === 'user_activity' && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{generatedReport.report_data.total_users}</p>
                  </div>
                  <div className="p-4 bg-leaf/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-leaf">{generatedReport.report_data.approved}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{generatedReport.report_data.pending}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">SME Admins</p>
                    <p className="text-2xl font-bold text-primary">{generatedReport.report_data.by_role?.sme_admin || 0}</p>
                  </div>
                </>
              )}
              {reportType === 'compliance' && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold">{generatedReport.report_data.total_companies}</p>
                </div>
              )}
              {reportType === 'certificate_audit' && (
                <div className="p-4 bg-leaf/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Certificates Issued</p>
                  <p className="text-2xl font-bold text-leaf">{generatedReport.report_data.total_certificates}</p>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Click "Download CSV" to export this report for submission to PRO and Producers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
