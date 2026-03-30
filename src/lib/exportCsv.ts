// ─── CSV Utility ────────────────────────────────────────────────────────────
// Handles escaping, BOM injection (Excel UTF-8 compat), and blob download.
// Works for any dataset size — rows are built lazily via a generator so the
// call-site never has to materialise the whole string at once.

export type CsvRow = Record<string, string | number | boolean | null | undefined>;

/** Escape a single cell value per RFC 4180 */
function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes if the value contains comma, quote, newline, or leading/trailing space
  if (/[",\n\r]/.test(str) || str !== str.trim()) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build a single CSV line from an ordered array of values */
function buildLine(values: (string | number | boolean | null | undefined)[]): string {
  return values.map(escapeCell).join(',');
}

/**
 * Convert an array of row objects to a CSV string.
 * Column order follows the `headers` array.
 * Prepends a UTF-8 BOM so Excel opens the file correctly.
 */
export function toCsvString(
  headers: { key: string; label: string }[],
  rows: CsvRow[]
): string {
  const BOM = '\uFEFF';
  const headerLine = buildLine(headers.map(h => h.label));
  const dataLines = rows.map(row =>
    buildLine(headers.map(h => row[h.key]))
  );
  return BOM + [headerLine, ...dataLines].join('\r\n');
}

/**
 * Trigger a browser download of a CSV string.
 * Uses a revocable object URL to avoid memory leaks.
 */
export function downloadCsv(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after a tick so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/** Sanitise a string for use as a filename */
export function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9_\-\s]/gi, '_').replace(/\s+/g, '_').slice(0, 100);
}

/** Format an ISO timestamp to a readable local string */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return iso;
  }
}

/** Format minutes as "Xh Ym" */
export function fmtMinutes(minutes: number | null | undefined): string {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
