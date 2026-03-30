import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportData, ExportType } from "@/hooks/useExportData";

interface ExportButtonProps {
  type: ExportType;
  label?: string;
  dateFrom?: string;
  dateTo?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  type,
  label,
  dateFrom,
  dateTo,
  variant = "outline",
  size = "sm",
  className,
}: ExportButtonProps) {
  const { exportCsv, exporting } = useExportData();
  const isLoading = exporting === type;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
      onClick={() => exportCsv(type, { dateFrom, dateTo, label })}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Exporting…" : (label ?? "Export CSV")}
    </Button>
  );
}
