import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface CertificateData {
  learnerName: string;
  courseTitle: string;
  completionDate: string;
  certificateNumber: string;
  companyName?: string;
}

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  forestGreen:  [22,  101,  52]  as [number, number, number],
  leafGreen:    [34,  197,  94]  as [number, number, number],
  lightGreen:   [220, 252, 231]  as [number, number, number],
  gold:         [180, 140,  40]  as [number, number, number],
  white:        [255, 255, 255]  as [number, number, number],
  offWhite:     [252, 251, 247]  as [number, number, number],
  darkText:     [ 20,  20,  20]  as [number, number, number],
  mutedText:    [100, 100, 100]  as [number, number, number],
  borderDark:   [ 15,  80,  40]  as [number, number, number],
};

export const generateCertificatePdf = (data: CertificateData): void => {
  const { learnerName, courseTitle, completionDate, certificateNumber, companyName } = data;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── 1. Background ─────────────────────────────────────────────────────────
  doc.setFillColor(...C.offWhite);
  doc.rect(0, 0, W, H, 'F');

  // ── 2. Outer decorative border (double rule) ──────────────────────────────
  const MARGIN = 8;
  doc.setDrawColor(...C.forestGreen);
  doc.setLineWidth(3.5);
  doc.rect(MARGIN, MARGIN, W - MARGIN * 2, H - MARGIN * 2);

  doc.setLineWidth(0.8);
  doc.rect(MARGIN + 4, MARGIN + 4, W - (MARGIN + 4) * 2, H - (MARGIN + 4) * 2);

  // ── 3. Corner ornaments ───────────────────────────────────────────────────
  const ornament = (x: number, y: number, flip: boolean) => {
    const s = 14;
    doc.setFillColor(...C.forestGreen);
    // Solid filled triangle in each corner
    const pts: [number, number][] = flip
      ? [[x, y], [x - s, y], [x, y + s]]
      : [[x, y], [x + s, y], [x, y - s]];
    doc.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1], 'F');
  };
  ornament(MARGIN, MARGIN, false);          // top-left
  ornament(W - MARGIN, MARGIN, false);      // top-right (mirror via triangle)
  ornament(MARGIN, H - MARGIN, false);
  ornament(W - MARGIN, H - MARGIN, false);

  // ── 4. Header green band ──────────────────────────────────────────────────
  doc.setFillColor(...C.forestGreen);
  doc.rect(MARGIN + 4, MARGIN + 4, W - (MARGIN + 4) * 2, 18, 'F');

  // Platform name in band
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CoreCycle', W / 2, MARGIN + 14.5, { align: 'center' });

  // ── 5. Subtitle strip ─────────────────────────────────────────────────────
  doc.setFillColor(...C.lightGreen);
  doc.rect(MARGIN + 4, MARGIN + 22, W - (MARGIN + 4) * 2, 9, 'F');

  doc.setTextColor(...C.forestGreen);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ontario EPR Training Program', W / 2, MARGIN + 28, { align: 'center' });

  // ── 6. "Certificate of Completion" heading ────────────────────────────────
  doc.setTextColor(...C.forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('Certificate of Completion', W / 2, 55, { align: 'center' });

  // Gold rule under heading
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1.2);
  doc.line(W / 2 - 65, 59, W / 2 + 65, 59);

  // ── 7. Preamble ───────────────────────────────────────────────────────────
  doc.setTextColor(...C.mutedText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('This is to certify that', W / 2, 71, { align: 'center' });

  // ── 8. Learner name ───────────────────────────────────────────────────────
  doc.setTextColor(...C.darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(learnerName, W / 2, 86, { align: 'center' });

  // Underline the name
  const nameWidth = doc.getTextWidth(learnerName);
  doc.setDrawColor(...C.forestGreen);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - nameWidth / 2, 89, W / 2 + nameWidth / 2, 89);

  // ── 9. Company (optional) ─────────────────────────────────────────────────
  let cursor = 98;
  if (companyName) {
    doc.setTextColor(...C.mutedText);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text(`of ${companyName}`, W / 2, cursor, { align: 'center' });
    cursor += 10;
  }

  // ── 10. Completion statement ──────────────────────────────────────────────
  doc.setTextColor(...C.mutedText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('has successfully completed the course', W / 2, cursor, { align: 'center' });
  cursor += 11;

  // ── 11. Course title ──────────────────────────────────────────────────────
  doc.setTextColor(...C.forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const splitTitle = doc.splitTextToSize(courseTitle, W - 90);
  doc.text(splitTitle, W / 2, cursor, { align: 'center' });
  cursor += splitTitle.length * 9 + 8;

  // ── 12. Completion date ───────────────────────────────────────────────────
  doc.setTextColor(...C.mutedText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date of Completion: ${completionDate}`, W / 2, cursor, { align: 'center' });

  // ── 13. Signature section ─────────────────────────────────────────────────
  const sigY = H - 36;

  // Left signature block
  doc.setDrawColor(...C.mutedText);
  doc.setLineWidth(0.4);
  doc.line(45, sigY, 120, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.darkText);
  doc.text('Program Director', 82.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.mutedText);
  doc.text('CoreCycle — Ontario EPR Training Program', 82.5, sigY + 10, { align: 'center' });

  // Right signature block
  doc.setDrawColor(...C.mutedText);
  doc.line(W - 120, sigY, W - 45, sigY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...C.darkText);
  doc.text(completionDate, W - 82.5, sigY - 2, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Date of Issue', W - 82.5, sigY + 5, { align: 'center' });

  // ── 14. Footer — certificate number ──────────────────────────────────────
  // Light green footer band
  doc.setFillColor(...C.lightGreen);
  doc.rect(MARGIN + 4, H - (MARGIN + 4) - 10, W - (MARGIN + 4) * 2, 10, 'F');

  doc.setTextColor(...C.forestGreen);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Certificate No: ${certificateNumber}`, W / 2, H - MARGIN - 6, { align: 'center' });

  // ── 15. Decorative leaf icon (text-based) ─────────────────────────────────
  // Place small "◆ CoreCycle ◆" watermark lightly in the background
  doc.setTextColor(220, 245, 228);  // very light green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(60);
  doc.text('CC', W / 2, H / 2 + 15, { align: 'center' });

  // Re-draw inner border on top so watermark doesn't bleed over it
  doc.setDrawColor(...C.forestGreen);
  doc.setLineWidth(0.8);
  doc.rect(MARGIN + 4, MARGIN + 4, W - (MARGIN + 4) * 2, H - (MARGIN + 4) * 2);

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = learnerName.replace(/\s+/g, '_');
  const safeCourse = courseTitle.replace(/\s+/g, '_').substring(0, 20);
  doc.save(`CoreCycle_Certificate_${safeName}_${safeCourse}.pdf`);
};
