import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportData, ExportType } from "@/hooks/useExportData";

interface ExportButtonProps {
  type: ExportType;
  label?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: "csv" | "pdf";
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  type,
  label,
  dateFrom,
  dateTo,
  format = "csv",
  variant = "outline",
  size = "sm",
  className,
}: ExportButtonProps) {
  const { exportCsv, exportPdf, exporting, exportingPdf } = useExportData();
  const isLoading = format === "pdf" ? exportingPdf === type : exporting === type;
  const isPdf = format === "pdf";

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
      onClick={() =>
        isPdf
          ? exportPdf(type, { dateFrom, dateTo, label })
          : exportCsv(type, { dateFrom, dateTo, label })
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isPdf ? (
        <FileText className="h-4 w-4 mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Exporting…" : isPdf ? (label ?? "Export PDF") : (label ?? "Export CSV")}
    </Button>
  );
}

/** Renders a paired CSV + PDF export button group. */
export function ExportButtonGroup({
  type,
  label,
  dateFrom,
  dateTo,
  size = "sm",
  className,
}: Omit<ExportButtonProps, "format" | "variant">) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <ExportButton
        type={type}
        label={`${label ?? "Export"} CSV`}
        dateFrom={dateFrom}
        dateTo={dateTo}
        format="csv"
        size={size}
        variant="outline"
      />
      <ExportButton
        type={type}
        label={`${label ?? "Export"} PDF`}
        dateFrom={dateFrom}
        dateTo={dateTo}
        format="pdf"
        size={size}
        variant="outline"
      />
    </div>
  );
}
