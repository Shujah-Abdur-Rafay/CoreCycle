import {
  FileText, File, FileSpreadsheet, ExternalLink,
  Download, Link2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseResource } from "@/hooks/useAdminCourses";

const FILE_TYPE_LABEL: Record<string, string> = {
  "application/pdf":                                                           "PDF",
  "text/csv":                                                                  "CSV",
  "application/vnd.ms-excel":                                                  "XLS",
  "application/msword":                                                        "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":   "DOCX",
  "application/vnd.ms-powerpoint":                                             "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "video/mp4":                                                                 "MP4",
  "video/webm":                                                                "WebM",
  "video/quicktime":                                                           "MOV",
};

function getFileIcon(fileType: string | null) {
  if (!fileType) return <File className="h-5 w-5 text-muted-foreground" />;
  if (fileType.includes("pdf"))         return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes("csv") || fileType.includes("excel"))
                                        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (fileType.includes("word"))        return <FileText className="h-5 w-5 text-blue-600" />;
  if (fileType.includes("presentation") || fileType.includes("powerpoint"))
                                        return <FileText className="h-5 w-5 text-orange-500" />;
  if (fileType.includes("video"))       return <File className="h-5 w-5 text-purple-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function getFileTypeLabel(fileType: string | null): string {
  if (!fileType) return "File";
  return FILE_TYPE_LABEL[fileType] ?? fileType.split("/")[1]?.toUpperCase() ?? "File";
}

interface ResourceListProps {
  resources: CourseResource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) return null;

  const files = resources.filter((r) => r.resource_type === "file");
  const links = resources.filter((r) => r.resource_type === "link");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Resources & Downloads</h2>

      {files.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Download className="h-4 w-4" />
            Downloadable Files
          </h3>
          <ul className="space-y-2">
            {files.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                >
                  {getFileIcon(r.file_type)}
                  <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {r.title}
                  </span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {getFileTypeLabel(r.file_type)}
                  </Badge>
                  <Download className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {links.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            External Links
          </h3>
          <ul className="space-y-2">
            {links.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <ExternalLink className="h-5 w-5 text-primary shrink-0" />
                  <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {r.title}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px] hidden sm:block">
                    {r.url}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
