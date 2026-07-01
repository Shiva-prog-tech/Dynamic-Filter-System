import type { ReactNode } from 'react';

/**
 * Describes one column of the generic {@link DataTable}. Like the filter
 * system, the table is configuration-driven: a consumer passes `ColumnDef[]`
 * and never edits the table component itself.
 */
export interface ColumnDef<T> {
  /** Dot-notation path used for the default cell renderer and default sort. */
  key: string;
  /** Column header label. */
  header: string;
  align?: 'left' | 'right' | 'center';
  /** Defaults to `true`. */
  sortable?: boolean;
  width?: number | string;
  /** Custom cell renderer; falls back to a smart default (chips, dates, etc.). */
  render?: (row: T) => ReactNode;
  /** Custom sort key extractor; falls back to the value at `key`. */
  sortAccessor?: (row: T) => string | number | boolean | null | undefined;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string | null;
  direction: SortDirection;
}
