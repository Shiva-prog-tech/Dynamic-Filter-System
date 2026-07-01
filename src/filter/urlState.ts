/**
 * URL <-> filter-state serialization (the "shareable / deep-linkable filters"
 * feature). Active conditions are encoded into a query parameter so a link
 * reopens the *exact* filtered view — and the browser back/forward and refresh
 * all keep the filters. Conditions are already plain JSON (see `types.ts`), so
 * the codec is a thin, robust wrapper with graceful failure.
 */
import type { FilterCondition } from './types';

/** Encode a condition list into a URL-safe string. */
export function encodeConditions(conditions: FilterCondition[]): string {
  return encodeURIComponent(JSON.stringify(conditions));
}

/** Decode a URL-safe string back into conditions; `null` on absent/malformed. */
export function decodeConditions(raw: string | null | undefined): FilterCondition[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? (parsed as FilterCondition[]) : null;
  } catch {
    return null; // malformed link — ignore rather than crash
  }
}

/** Read a single query parameter (SSR/no-window safe). */
export function readUrlParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(param);
}

/**
 * Write (or, when `value` is nullish/empty, remove) a query parameter without a
 * navigation/reload, preserving every other parameter. Uses `replaceState` so
 * filter tweaks don't flood the history stack.
 */
export function writeUrlParam(param: string, value: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value == null || value === '') url.searchParams.delete(param);
  else url.searchParams.set(param, value);
  window.history.replaceState(null, '', url.toString());
}
