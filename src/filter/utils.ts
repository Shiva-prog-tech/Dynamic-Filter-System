/** Framework-agnostic helpers shared by the engine and the UI. */

/**
 * Reads a (possibly nested) value off a record using dot-notation.
 * `getValueByPath({ address: { city: 'NYC' } }, 'address.city') === 'NYC'`.
 */
export function getValueByPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Compile-time exhaustiveness guard. Calling this in a `default:` branch makes
 * TypeScript raise an error if a new union member (e.g. a new `FieldType`) is
 * added without handling it everywhere — turning the "add a field type" steps
 * into compiler-enforced checklist items.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${String(value)}`);
}

let fallbackCounter = 0;
/** Stable unique id for a filter condition. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cond_${Date.now().toString(36)}_${(fallbackCounter++).toString(36)}`;
}

/** Currency formatting that degrades gracefully for unknown ISO codes. */
export function formatCurrency(value: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

/** Human-friendly date rendering. Returns an em-dash for empty values. */
export function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Normalises any date-like value to a `yyyy-MM-dd` key so dates can be
 * compared with plain string ordering — and, crucially, without timezone
 * drift. Plain ISO date strings are taken verbatim (avoids the classic
 * "new Date('2024-03-15')" UTC-midnight off-by-one); everything else is
 * reduced to its *local* calendar day to match the date picker.
 */
export function toDateKey(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  const str = String(value);
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

/** Builds `SelectOption[]` from a list of raw scalar values (dedup + sort). */
export function buildOptions(values: Array<string | number | boolean>): {
  label: string;
  value: string | number | boolean;
}[] {
  const unique = Array.from(new Set(values));
  unique.sort((a, b) => String(a).localeCompare(String(b)));
  return unique.map((value) => ({ label: String(value), value }));
}
