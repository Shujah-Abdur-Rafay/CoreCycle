import jsPDF from "jspdf";
import type { CertificateTemplate, StyleConfig, AspectRatioKey } from "@/hooks/useCertificateTemplates";

export interface CertificatePdfData {
  learnerName: string;
  courseTitle: string;
  completionDate: string;
  certificateNumber: string;
  companyName?: string;
}

interface GenerateCertificateParams {
  data: CertificatePdfData;
  /** The template linked to the course. When null, sensible defaults are used. */
  template?: CertificateTemplate | null;
}

/* ── Reference design (matches CertificateCard.tsx in CSS pixels @ max-w-sm) ── */
const CARD_W = 384;
const ASPECT_WH: Record<AspectRatioKey, number> = {
  landscape: 4 / 3,
  widescreen: 16 / 9,
  square: 1,
  portrait: 3 / 4,
};

/* Tailwind greys used by the card */
const GRAY_700: [number, number, number] = [55, 65, 81];
const GRAY_500: [number, number, number] = [107, 114, 128];
const GRAY_400: [number, number, number] = [156, 163, 175];
const GRAY_800: [number, number, number] = [31, 41, 55];

const MM_PER_PT = 25.4 / 72;

const defaultStyle: Required<
  Pick<
    StyleConfig,
    | "headerFontSize"
    | "textAlignment"
    | "padding"
    | "showBorder"
    | "borderColor"
    | "showWatermark"
    | "aspectRatio"
    | "fontFamily"
  >
> = {
  headerFontSize: 22,
  textAlignment: "center",
  padding: 24,
  showBorder: true,
  borderColor: "#16a34a",
  showWatermark: true,
  aspectRatio: "landscape",
  fontFamily: "inherit",
};

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex?.trim() || "");
  if (!m) return [22, 101, 52];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function mapFontFamily(ff?: string): string {
  const f = (ff || "").toLowerCase();
  if (f.includes("times") || (f.includes("serif") && !f.includes("sans"))) return "times";
  if (f.includes("courier") || f.includes("mono")) return "courier";
  return "helvetica";
}

type LoadedImage = { data: string | HTMLImageElement; width: number; height: number } | null;

function loadImage(url: string): Promise<LoadedImage> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const width = img.naturalWidth || 1;
      const height = img.naturalHeight || 1;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no ctx");
        ctx.drawImage(img, 0, 0);
        resolve({ data: canvas.toDataURL("image/png"), width, height });
      } catch {
        // Canvas tainted (CORS) — fall back to the element; jsPDF can still embed it.
        resolve({ data: img, width, height });
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates a true vector PDF certificate (selectable text, crisp at any zoom)
 * that mirrors the on-screen CertificateCard design configured by the admin.
 */
export async function generateCertificatePdf({ data, template }: GenerateCertificateParams) {
  const style = { ...defaultStyle, ...(template?.style_config || {}) };
  const headerText = template?.header_text || "Certificate of Completion";
  const providerName = (template?.provider_name || "").trim();
  const backgroundColor = template?.background_color || "#f0fdf4";
  const logoUrl = template?.logo_url || null;
  const backgroundUrl = template?.background_url || null;

  const accent = hexToRgb(style.borderColor);
  const baseFont = mapFontFamily(style.fontFamily);

  // ── Page geometry from the template aspect ratio (long side = 297mm) ──
  const cardH = CARD_W / ASPECT_WH[style.aspectRatio];
  let pageW: number;
  let pageH: number;
  if (cardH >= CARD_W) {
    pageH = 297;
    pageW = 297 * (CARD_W / cardH);
  } else {
    pageW = 297;
    pageH = 297 * (cardH / CARD_W);
  }

  const doc = new jsPDF({
    orientation: pageW >= pageH ? "landscape" : "portrait",
    unit: "mm",
    format: [pageW, pageH],
  });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const s = W / CARD_W; // mm per reference-pixel
  const mm = (px: number) => px * s;
  const pt = (px: number) => (px * s) / MM_PER_PT;

  // ── Preload images (logo / background) ──
  const [logoImg, bgImg] = await Promise.all([
    logoUrl ? loadImage(logoUrl) : Promise.resolve<LoadedImage>(null),
    backgroundUrl ? loadImage(backgroundUrl) : Promise.resolve<LoadedImage>(null),
  ]);

  // ── 1. Background ──
  if (bgImg) {
    try {
      doc.addImage(bgImg.data as string, "PNG", 0, 0, W, H);
    } catch {
      doc.setFillColor(...hexToRgb(backgroundColor));
      doc.rect(0, 0, W, H, "F");
    }
  } else {
    doc.setFillColor(...hexToRgb(backgroundColor));
    doc.rect(0, 0, W, H, "F");
  }

  // ── 2. Watermark (faint logo, centered) ──
  // Only drawn when we can apply low opacity, otherwise we'd cover the card
  // with a fully opaque logo.
  const docGState = (doc as unknown as {
    GState?: new (o: { opacity: number }) => unknown;
    setGState?: (g: unknown) => void;
  });
  const canSetOpacity = typeof docGState.GState === "function" && typeof docGState.setGState === "function";

  if (style.showWatermark && logoImg && canSetOpacity) {
    const wmW = mm(CARD_W * 0.6);
    const wmH = wmW * (logoImg.height / logoImg.width);
    try {
      docGState.setGState!(new docGState.GState!({ opacity: 0.06 }));
      doc.addImage(logoImg.data as string, "PNG", (W - wmW) / 2, (H - wmH) / 2, wmW, wmH);
    } catch {
      /* watermark is decorative — ignore failures */
    } finally {
      try {
        docGState.setGState!(new docGState.GState!({ opacity: 1 }));
      } catch {
        /* noop */
      }
    }
  }

  // ── 3. Border ──
  if (style.showBorder) {
    doc.setDrawColor(...accent);
    doc.setLineWidth(mm(2));
    doc.roundedRect(mm(8), mm(8), W - mm(16), H - mm(16), mm(12), mm(12), "S");
  }

  // ── Layout helpers ──
  const pad = style.padding;
  const align = style.textAlignment;
  const xAnchor = align === "center" ? W / 2 : align === "right" ? W - mm(pad) : mm(pad);
  const maxTextW = mm(CARD_W - pad * 2);

  const drawBlock = (
    text: string,
    fontPx: number,
    fontStyle: "normal" | "bold",
    color: [number, number, number],
    yTopPx: number,
    lineFactor: number,
    family: string = baseFont
  ): number => {
    doc.setFont(family, fontStyle);
    doc.setFontSize(pt(fontPx));
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxTextW);
    let y = yTopPx;
    for (const line of lines) {
      doc.text(line, xAnchor, mm(y), { align, baseline: "top" });
      y += fontPx * lineFactor;
    }
    return y;
  };

  const measureBlock = (text: string, fontPx: number, fontStyle: "normal" | "bold", lineFactor: number, family: string = baseFont): number => {
    doc.setFont(family, fontStyle);
    doc.setFontSize(pt(fontPx));
    const lines = doc.splitTextToSize(text, maxTextW);
    return lines.length * fontPx * lineFactor;
  };

  // ── 4. Header row (logo + provider), centered as a group ──
  const HEADER_H = 40;
  const logoBoxH = 40;
  const headerTopPx = pad;
  let logoDrawW = logoBoxH; // emblem fallback is square
  if (logoImg) {
    logoDrawW = Math.min(120, logoBoxH * (logoImg.width / logoImg.height));
  }

  doc.setFont(baseFont, "bold");
  doc.setFontSize(pt(14));
  const providerWmm = providerName ? doc.getTextWidth(providerName) : 0;
  const gapMm = providerName ? mm(8) : 0;
  const groupWmm = mm(logoDrawW) + gapMm + providerWmm;

  let groupStartX: number;
  if (align === "center") groupStartX = W / 2 - groupWmm / 2;
  else if (align === "right") groupStartX = W - mm(pad) - groupWmm;
  else groupStartX = mm(pad);

  const logoCenterY = mm(headerTopPx + logoBoxH / 2);
  if (logoImg) {
    try {
      doc.addImage(logoImg.data as string, "PNG", groupStartX, mm(headerTopPx), mm(logoDrawW), mm(logoBoxH));
    } catch {
      /* ignore */
    }
  } else {
    // Emblem: rounded square in accent colour
    doc.setFillColor(...accent);
    doc.roundedRect(groupStartX, mm(headerTopPx), mm(logoBoxH), mm(logoBoxH), mm(8), mm(8), "F");
  }
  if (providerName) {
    doc.setFont(baseFont, "bold");
    doc.setFontSize(pt(14));
    doc.setTextColor(...GRAY_700);
    doc.text(providerName, groupStartX + mm(logoDrawW) + gapMm, logoCenterY, {
      align: "left",
      baseline: "middle",
    });
  }

  // ── 5. Footer (date + certificate number), bottom-aligned ──
  const dateFactor = 1.35;
  const certFactor = 1.35;
  const footerHpx = 9 * dateFactor + 2 + 8 * certFactor;
  const footerTopPx = cardH - pad - footerHpx;

  let fy = drawBlock(data.completionDate, 9, "normal", GRAY_500, footerTopPx, dateFactor);
  fy += 2;
  drawBlock(data.certificateNumber, 8, "normal", GRAY_400, fy, certFactor, "courier");

  // ── 6. Centre block (vertically centred between header and footer) ──
  const gap = 4;
  const blocks: Array<{ text: string; px: number; style: "normal" | "bold"; color: [number, number, number]; lf: number; family?: string }> = [
    { text: headerText, px: style.headerFontSize, style: "bold", color: accent, lf: 1.25 },
    { text: "This is to certify that", px: 11, style: "normal", color: GRAY_500, lf: 1.3 },
    { text: data.learnerName, px: 28, style: "bold", color: GRAY_800, lf: 1.15 },
    { text: "has successfully completed", px: 11, style: "normal", color: GRAY_500, lf: 1.3 },
    { text: data.courseTitle, px: 16, style: "bold", color: accent, lf: 1.25 },
  ];

  const totalPx =
    blocks.reduce((sum, b) => sum + measureBlock(b.text, b.px, b.style, b.lf, b.family), 0) +
    gap * (blocks.length - 1);

  const regionTopPx = pad + HEADER_H;
  const regionBottomPx = footerTopPx;
  const regionHpx = regionBottomPx - regionTopPx;
  let y = regionTopPx + Math.max(0, (regionHpx - totalPx) / 2);

  for (const b of blocks) {
    y = drawBlock(b.text, b.px, b.style, b.color, y, b.lf, b.family);
    y += gap;
  }

  doc.save(`certificate-${data.certificateNumber}.pdf`);
}
