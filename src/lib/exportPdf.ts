import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface PdfColumn {
  key: string;
  label: string;
}

export type PdfRow = Record<string, string | number | null | undefined>;

const PRIMARY_GREEN = [22, 101, 52] as [number, number, number];   // Forest green
const HEADER_TEXT   = [255, 255, 255] as [number, number, number]; // White
const ALT_ROW       = [240, 249, 244] as [number, number, number]; // Very light green tint
const BORDER_COLOR  = [200, 230, 210] as [number, number, number];

/**
 * Generate a styled PDF report and trigger browser download.
 *
 * @param columns  Array of {key, label} column definitions (same format as CSV).
 * @param rows     Array of row objects keyed by column.key.
 * @param title    Report title shown in the header.
 * @param filename Filename without extension (default derived from title).
 */
export function exportReportAsPdf(
  columns: PdfColumn[],
  rows: PdfRow[],
  title: string,
  filename?: string
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now        = format(new Date(), "MMMM d, yyyy 'at' h:mm a");

  // ── Header banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_GREEN);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("OntreCycle — Ontario EPR Training Platform", 14, 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 16);

  // Date on the right
  doc.setFontSize(8);
  doc.text(`Generated: ${now}`, pageWidth - 14, 9, { align: "right" });
  doc.text(`${rows.length} record${rows.length !== 1 ? "s" : ""}`, pageWidth - 14, 16, { align: "right" });

  // ── Table ──────────────────────────────────────────────────────────────────
  const tableColumns = columns.map(c => ({ header: c.label, dataKey: c.key }));
  const tableRows    = rows.map(r =>
    Object.fromEntries(columns.map(c => [c.key, r[c.key] ?? ""]))
  );

  autoTable(doc, {
    startY: 26,
    columns: tableColumns,
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: PRIMARY_GREEN,
      textColor: HEADER_TEXT,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: ALT_ROW,
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.2,
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // ── Footer on every page ───────────────────────────────────────────────
      const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
      const totalPages = (doc as any).internal.getNumberOfPages();

      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");

      doc.text("OntreCycle — Confidential", 14, pageHeight - 5);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: "right" });

      // Thin footer rule
      doc.setDrawColor(...BORDER_COLOR);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 9, pageWidth - 10, pageHeight - 9);
    },
  });

  const safeFilename = (filename ?? title)
    .replace(/[^a-z0-9_\-\s]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);

  const dateStr = format(new Date(), "yyyy-MM-dd");
  doc.save(`${safeFilename}_${dateStr}.pdf`);
}
