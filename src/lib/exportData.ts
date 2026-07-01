/** Client-side export helpers (CSV / JSON) — a bonus deliverable. */
import { getValueByPath } from '../filter';
import type { ColumnDef } from '../table/types';

function triggerDownload(content: string, mime: string, filename: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Quote a CSV cell and escape embedded quotes per RFC 4180. */
function csvCell(value: unknown): string {
  let str: string;
  if (value == null) str = '';
  else if (Array.isArray(value)) str = value.join('; ');
  else if (typeof value === 'object')
    str = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v != null && typeof v !== 'object')
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join('; ');
  else str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/** Exports the given rows as CSV using the table's column definitions. */
export function exportToCsv<T>(rows: T[], columns: ColumnDef<T>[], filename = 'export.csv'): void {
  const header = columns.map((c) => csvCell(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => csvCell(getValueByPath(row, c.key))).join(','))
    .join('\n');
  triggerDownload(`${header}\n${body}`, 'text/csv;charset=utf-8', filename);
}

/** Exports the given rows as pretty-printed JSON. */
export function exportToJson<T>(rows: T[], filename = 'export.json'): void {
  triggerDownload(JSON.stringify(rows, null, 2), 'application/json', filename);
}
