import { useState, useRef } from "react";
import {
  FileText, Link2, Upload, X, Loader2, File,
  FileSpreadsheet, Plus, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCourseResources, CourseResource } from "@/hooks/useAdminCourses";
import { toast } from "sonner";

const ACCEPTED_FILE_TYPES = ".pdf,.csv,.doc,.docx,.ppt,.pptx,.mp4,.webm,.mov";

const FILE_TYPE_META: Record<string, { label: string; color: string }> = {
  "application/pdf":                                                          { label: "PDF",  color: "text-red-500" },
  "text/csv":                                                                 { label: "CSV",  color: "text-green-600" },
  "application/vnd.ms-excel":                                                 { label: "XLS",  color: "text-green-600" },
  "application/msword":                                                       { label: "DOC",  color: "text-blue-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":  { label: "DOCX", color: "text-blue-600" },
  "application/vnd.ms-powerpoint":                                            { label: "PPT",  color: "text-orange-500" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":{ label: "PPTX", color: "text-orange-500" },
  "video/mp4":                                                                { label: "MP4",  color: "text-purple-500" },
  "video/webm":                                                               { label: "WebM", color: "text-purple-500" },
  "video/quicktime":                                                          { label: "MOV",  color: "text-purple-500" },
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
  return FILE_TYPE_META[fileType]?.label ?? fileType.split("/")[1]?.toUpperCase() ?? "File";
}

interface PendingResource {
  tempId: string;
  title: string;
  resource_type: "file" | "link";
  url: string;
  file_type: string | null;
  file?: File; // only present before upload
}

interface ResourcesManagerProps {
  courseId: string;
}

export function ResourcesManager({ courseId }: ResourcesManagerProps) {
  const { resources, loading, addResource, deleteResource, uploadResourceFile } =
    useCourseResources(courseId);

  const [mode, setMode] = useState<"file" | "link" | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setMode(null);
    setPendingTitle("");
    setPendingUrl("");
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (!pendingTitle) setPendingTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleAdd = async () => {
    if (!pendingTitle.trim()) {
      toast.error("Please enter a title for the resource");
      return;
    }

    if (mode === "link") {
      if (!pendingUrl.trim()) {
        toast.error("Please enter a URL");
        return;
      }
      try {
        new URL(pendingUrl);
      } catch {
        toast.error("Please enter a valid URL (include https://)");
        return;
      }
    }

    if (mode === "file" && !pendingFile) {
      toast.error("Please select a file");
      return;
    }

    setSaving(true);
    try {
      if (mode === "link") {
        await addResource({
          title: pendingTitle.trim(),
          resource_type: "link",
          url: pendingUrl.trim(),
          file_type: null,
        });
      } else if (mode === "file" && pendingFile) {
        const { url, file_type } = await uploadResourceFile(pendingFile);
        await addResource({
          title: pendingTitle.trim(),
          resource_type: "file",
          url,
          file_type,
        });
      }
      toast.success("Resource added");
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteResource(id);
      toast.success("Resource removed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove resource");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Resources</CardTitle>
        <CardDescription>
          Attach downloadable files or external links for learners
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing resources */}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading resources…
          </div>
        ) : resources.length > 0 ? (
          <ul className="space-y-2">
            {resources.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                deleting={deletingId === r.id}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No resources yet.</p>
        )}

        {/* Add form */}
        {mode ? (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                placeholder={mode === "file" ? "e.g., Compliance Guide" : "e.g., Ontario EPR Portal"}
                value={pendingTitle}
                onChange={(e) => setPendingTitle(e.target.value)}
                disabled={saving}
              />
            </div>

            {mode === "file" ? (
              <div className="space-y-1">
                <Label>File *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {pendingFile ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                    {getFileIcon(pendingFile.type)}
                    <span className="text-sm flex-1 truncate">{pendingFile.name}</span>
                    <Badge variant="secondary">{getFileTypeLabel(pendingFile.type)}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setPendingFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, CSV, DOC, DOCX, PPT, PPTX, MP4 (max 100 MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Label>URL *</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={pendingUrl}
                  onChange={(e) => setPendingUrl(e.target.value)}
                  disabled={saving}
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleAdd}
                disabled={saving}
                className="gap-1"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? "Saving…" : "Add Resource"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setMode("file")}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setMode("link")}
            >
              <Link2 className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceRow({
  resource,
  deleting,
  onDelete,
}: {
  resource: CourseResource;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-muted/30 transition-colors">
      {resource.resource_type === "file" ? (
        getFileIcon(resource.file_type)
      ) : (
        <ExternalLink className="h-5 w-5 text-primary shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{resource.title}</p>
        <p className="text-xs text-muted-foreground truncate">{resource.url}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-xs">
        {resource.resource_type === "link" ? "Link" : getFileTypeLabel(resource.file_type)}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </Button>
    </li>
  );
}
