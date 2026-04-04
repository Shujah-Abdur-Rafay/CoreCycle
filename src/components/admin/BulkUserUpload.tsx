import { useState, useRef } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

const VALID_ROLES = ["super_admin", "producer_admin", "municipality_admin", "sme_admin", "learner"] as const;
type ValidRole = typeof VALID_ROLES[number];

interface ParsedRow {
  full_name: string;
  email: string;
  company_name: string;
  sme_id: string;
  role: string;
}

interface ValidatedRow extends ParsedRow {
  _errors: string[];
  _valid: boolean;
}

type UploadStatus = "idle" | "parsed" | "uploading" | "done";

interface UploadResult {
  email: string;
  success: boolean;
  message: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRow(row: ParsedRow): ValidatedRow {
  const errors: string[] = [];

  if (!row.email?.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push("Invalid email address");
  }

  if (!row.full_name?.trim()) {
    errors.push("Full name is required");
  }

  if (row.role && !VALID_ROLES.includes(row.role.trim() as ValidRole)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  return { ...row, _errors: errors, _valid: errors.length === 0 };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkUserUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);

  const validRows = rows.filter(r => r._valid);
  const invalidRows = rows.filter(r => !r._valid);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (result) => {
        const validated = (result.data as ParsedRow[]).map(validateRow);
        setRows(validated);
        setStatus("parsed");
        setResults([]);

        const errCount = validated.filter(r => !r._valid).length;
        if (errCount > 0) {
          toast.warning(`${errCount} row(s) have validation errors — fix the CSV before uploading.`);
        } else {
          toast.success(`${validated.length} rows parsed successfully.`);
        }
      },
      error: (err) => {
        toast.error(`CSV parse error: ${err.message}`);
      },
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (validRows.length === 0) return;

    setUploading(true);
    setStatus("uploading");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error("Not authenticated");

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "bulk-invite-users",
        {
          body: {
            users: validRows.map(r => ({
              email: r.email.trim(),
              full_name: r.full_name.trim(),
              company_name: r.company_name?.trim() || null,
              sme_id: r.sme_id?.trim() || null,
              role: (r.role?.trim() || "learner") as ValidRole,
            })),
          },
        }
      );

      if (fnError) throw fnError;

      const uploadResults: UploadResult[] = fnData?.results ?? [];
      setResults(uploadResults);
      setStatus("done");

      const successCount = uploadResults.filter(r => r.success).length;
      toast.success(`${successCount} of ${validRows.length} users created successfully.`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setStatus("parsed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "full_name,email,company_name,sme_id,role\nJane Doe,jane@example.com,Acme Corp,SME001,learner\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStatus("idle");
    setRows([]);
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk User Upload</CardTitle>
          <CardDescription>
            Upload a CSV file to create multiple users at once. Each user will receive an invite email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <span className="text-xs text-muted-foreground">
              Required columns: <code className="font-mono bg-muted px-1 rounded">full_name, email</code> &nbsp;
              Optional: <code className="font-mono bg-muted px-1 rounded">company_name, sme_id, role</code>
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {status === "idle" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Max 500 rows per upload</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{rows.length} rows parsed</p>
                  <p className="text-xs text-muted-foreground">
                    {validRows.length} valid · {invalidRows.length} with errors
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                Change file
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview table */}
      {status !== "idle" && rows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Preview
                <Badge variant="secondary">{rows.length} rows</Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="destructive">{invalidRows.length} errors</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>SME ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => {
                      const result = results.find(r => r.email === row.email);
                      return (
                        <TableRow
                          key={i}
                          className={!row._valid ? "bg-destructive/5" : ""}
                        >
                          <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                          <TableCell className="text-sm">{row.full_name || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{row.email || "—"}</TableCell>
                          <TableCell className="text-sm">{row.company_name || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{row.sme_id || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {row.role || "learner"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result ? (
                              result.success ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="text-xs">Created</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-destructive" title={result.message}>
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span className="text-xs">Failed</span>
                                </div>
                              )
                            ) : !row._valid ? (
                              <div className="flex items-center gap-1 text-amber-600" title={row._errors.join(", ")}>
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span className="text-xs">{row._errors[0]}</span>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Ready</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {status !== "done" && (
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || validRows.length === 0}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading
                      ? "Creating users…"
                      : `Create ${validRows.length} User${validRows.length !== 1 ? "s" : ""}`}
                  </Button>
                  {invalidRows.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {invalidRows.length} row(s) with errors will be skipped.
                    </p>
                  )}
                </div>
              )}

              {status === "done" && (
                <div className="mt-4 flex items-center gap-3">
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Upload complete
                  </Badge>
                  <Button variant="outline" size="sm" onClick={reset}>
                    Upload another file
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
