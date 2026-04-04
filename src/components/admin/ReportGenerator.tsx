import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useExportData, ExportType } from "@/hooks/useExportData";
import {
  FileText,
  Download,
  Users,
  Building2,
  Award,
  Loader2,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileDown,
} from "lucide-react";
import { format } from "date-fns";

interface ReportDef {
  type: ExportType;
  label: string;
  description: string;
  icon: React.ElementType;
  fields: string[];
  supportsDateFilter: boolean;
}

const REPORTS: ReportDef[] = [
  {
    type: "user_progress",
    label: "User Progress Report",
    description: "Per-user, per-course progress with quiz scores, time spent, and certificates",
    icon: BarChart3,
    fields: ["Learner", "Email", "Company", "Course", "Status", "Progress %", "Time Spent", "Certificate #"],
    supportsDateFilter: true,
  },
  {
    type: "training_summary",
    label: "Training Summary",
    description: "Aggregated completion rates and average progress per course",
    icon: BookOpen,
    fields: ["Course", "Total Enrollments", "Completed", "In Progress", "Completion Rate %", "Avg Progress %", "Total Time"],
    supportsDateFilter: true,
  },
  {
    type: "quiz_results",
    label: "Quiz Results",
    description: "All quiz attempts with scores, pass/fail status, and module details",
    icon: ClipboardList,
    fields: ["Learner", "Email", "Course", "Module", "Score %", "Pass Mark %", "Passed", "Completed At"],
    supportsDateFilter: true,
  },
  {
    type: "certificate_audit",
    label: "Certificate Audit",
    description: "All issued certificates with verification details — audit-ready",
    icon: Award,
    fields: ["Certificate #", "Learner", "Course", "Company", "SME ID", "Municipality", "Issued At"],
    supportsDateFilter: true,
  },
  {
    type: "user_activity",
    label: "User Activity",
    description: "All registered users with roles, approval status, and registration dates",
    icon: Users,
    fields: ["Full Name", "Email", "Company", "Role", "Approval Status", "Registered At"],
    supportsDateFilter: false,
  },
  {
    type: "compliance",
    label: "Compliance Report",
    description: "Per-company compliance rates, staff counts, and training completion",
    icon: Building2,
    fields: ["Company", "SME ID", "Total Staff", "Approved Staff", "Compliance Rate %", "Completed Enrollments"],
    supportsDateFilter: false,
  },
  {
    type: "sme_report",
    label: "SME Performance",
    description: "Aggregated training metrics per SME organisation",
    icon: Building2,
    fields: ["SME ID", "Company", "Members", "Enrollments", "Completion Rate %", "Avg Progress %", "Certificates"],
    supportsDateFilter: false,
  },
];

export function ReportGenerator() {
  const { exportCsv, exportPdf, exporting, exportingPdf } = useExportData();
  const [selected, setSelected] = useState<ExportType>("user_progress");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const report = REPORTS.find(r => r.type === selected)!;
  const exportOptions = {
    dateFrom: dateFrom || undefined,
    dateTo:   dateTo   || undefined,
    label:    report.label,
  };
  const isBusy = !!exporting || !!exportingPdf;

  const handleExportCsv = () => exportCsv(selected, exportOptions);
  const handleExportPdf = () => exportPdf(selected, exportOptions);

  return (
    <div className="space-y-6">
      {/* Report type grid */}
      <Card>
        <CardHeader>
          <CardTitle>Export Training Data</CardTitle>
          <CardDescription>
            Select a report type, apply optional date filters, then download as CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {REPORTS.map(r => (
              <button
                key={r.type}
                onClick={() => setSelected(r.type)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected === r.type
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    selected === r.type ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <r.icon className={`h-5 w-5 ${
                      selected === r.type ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {r.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected report detail */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-foreground">{report.label}</p>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
              {report.supportsDateFilter && (
                <Badge variant="outline" className="text-xs">Supports date filter</Badge>
              )}
            </div>

            {/* CSV columns preview */}
            <div className="flex flex-wrap gap-1.5">
              {report.fields.map(f => (
                <Badge key={f} variant="secondary" className="text-xs font-mono">
                  {f}
                </Badge>
              ))}
            </div>

            {/* Date filters */}
            {report.supportsDateFilter && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dateFrom" className="text-xs">From Date (optional)</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateTo" className="text-xs">To Date (optional)</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleExportCsv}
                disabled={isBusy}
                variant="outline"
                className="gap-2"
              >
                {exporting === selected ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting === selected ? "Exporting…" : "Export as CSV"}
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={isBusy}
                className="gap-2"
              >
                {exportingPdf === selected ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                {exportingPdf === selected ? "Generating PDF…" : "Export as PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick export panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Exports</CardTitle>
          <CardDescription>Download any report instantly without date filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORTS.map(r => (
              <button
                key={r.type}
                disabled={!!exporting}
                onClick={() => exportCsv(r.type, { label: r.label })}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                {exporting === r.type ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{r.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
