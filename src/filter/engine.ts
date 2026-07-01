/**
 * The pure, framework-agnostic filtering engine.
 *
 * Everything here is side-effect free and independent of React, which makes
 * the matching logic trivially unit-testable and reusable on a server.
 *
 * Combination semantics (per the spec):
 *   • Conditions on the **same field** are OR-ed together.
 *   • Groups of **different fields** are AND-ed together.
 *   • Incomplete conditions are ignored (see `validation.ts`).
 *
 * Null/missing record-value policy: a value that is `null`/`undefined`/
 * unparseable is treated as "unknown" and never matches a comparison — so a
 * record missing a field is excluded from both positive (`is`/`eq`) and
 * negative (`isNot`) operators rather than silently satisfying them.
 */
import type {
  AmountRangeValue,
  DateRangeValue,
  FilterCondition,
  FilterFieldConfig,
  FilterFieldConfigMap,
  Operator,
} from './types';
import { assertNever, getValueByPath, toDateKey } from './utils';
import { isConditionComplete } from './validation';

/* ----------------------------- type matchers ----------------------------- */

function matchText(raw: unknown, op: Operator, value: string): boolean {
  const haystack = (raw == null ? '' : String(raw)).toLowerCase();
  const needle = value.toLowerCase(); // case-insensitive matching
  switch (op) {
    case 'equals':
      return haystack === needle;
    case 'contains':
      return haystack.includes(needle);
    case 'startsWith':
      return haystack.startsWith(needle);
    case 'endsWith':
      return haystack.endsWith(needle);
    case 'doesNotContain':
      return !haystack.includes(needle);
    default:
      return true;
  }
}

function matchNumber(raw: unknown, op: Operator, value: number): boolean {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(n)) return false;
  switch (op) {
    case 'eq':
      return n === value;
    case 'neq':
      return n !== value;
    case 'gt':
      return n > value;
    case 'gte':
      return n >= value;
    case 'lt':
      return n < value;
    case 'lte':
      return n <= value;
    default:
      return true;
  }
}

function matchAmount(raw: unknown, value: AmountRangeValue): boolean {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(n)) return false;
  if (value.min != null && n < value.min) return false;
  if (value.max != null && n > value.max) return false;
  return true;
}

function matchDate(raw: unknown, op: Operator, value: DateRangeValue): boolean {
  const key = toDateKey(raw);
  if (key == null) return false; // unparseable / null record dates never match

  if (op === 'last7days' || op === 'last30days') {
    const days = op === 'last7days' ? 7 : 30;
    const now = new Date();
    const todayKey = toDateKey(now)!;
    const past = new Date(now);
    // Inclusive window of exactly `days` calendar days (today + the prior days-1).
    past.setDate(past.getDate() - (days - 1));
    const pastKey = toDateKey(past)!;
    return key >= pastKey && key <= todayKey;
  }

  const fromKey = value.from ? toDateKey(value.from) : null;
  const toKey = value.to ? toDateKey(value.to) : null;

  switch (op) {
    case 'before':
      return toKey == null ? true : key <= toKey; // inclusive
    case 'after':
      return fromKey == null ? true : key >= fromKey; // inclusive
    case 'between':
    default:
      if (fromKey != null && key < fromKey) return false;
      if (toKey != null && key > toKey) return false;
      return true;
  }
}

function matchSelect(raw: unknown, op: Operator, value: unknown): boolean {
  // An unknown record value matches neither `is` nor `isNot`.
  if (raw == null) return false;
  // Normalise to string so number/boolean options compare reliably.
  const a = String(raw);
  const b = value == null ? '' : String(value);
  switch (op) {
    case 'is':
      return a === b;
    case 'isNot':
      return a !== b;
    default:
      return true;
  }
}

function matchMultiSelect(
  raw: unknown,
  op: Operator,
  values: (string | number)[],
): boolean {
  const selected = values.map((v) => String(v));
  if (selected.length === 0) return true;

  // A record value may itself be an array (e.g. `skills`) or a scalar
  // (e.g. `department`). Both are normalised to a string set.
  const recordVals = Array.isArray(raw)
    ? raw.map((v) => String(v))
    : raw == null
      ? []
      : [String(raw)];

  const intersects = recordVals.some((v) => selected.includes(v));

  switch (op) {
    case 'in': // contains any of the selected values
      return intersects;
    case 'notIn': // contains none of the selected values
      return !intersects;
    case 'containsAll': // contains every selected value
      return selected.every((s) => recordVals.includes(s));
    default:
      return true;
  }
}

function matchBoolean(raw: unknown, value: boolean): boolean {
  if (raw == null) return false; // unknown never matches is-true or is-false
  return Boolean(raw) === value;
}

/* --------------------------- condition dispatch --------------------------- */

/** Evaluates a single (already-complete) condition against one record. */
export function matchCondition(
  record: unknown,
  condition: FilterCondition,
  field: FilterFieldConfig,
): boolean {
  const raw = getValueByPath(record, condition.field);

  switch (field.type) {
    case 'text':
      return matchText(raw, condition.operator, String(condition.value ?? ''));
    case 'number':
      return matchNumber(raw, condition.operator, condition.value as number);
    case 'amount':
      return matchAmount(raw, condition.value as AmountRangeValue);
    case 'date':
      return matchDate(raw, condition.operator, condition.value as DateRangeValue);
    case 'select':
      return matchSelect(raw, condition.operator, condition.value);
    case 'multiSelect':
      return matchMultiSelect(
        raw,
        condition.operator,
        (condition.value as (string | number)[]) ?? [],
      );
    case 'boolean':
      return matchBoolean(raw, Boolean(condition.value));
    default:
      return assertNever(field.type);
  }
}

/* ------------------------------- public API ------------------------------- */

/** Index a list of field configs by key for O(1) lookup. */
export function buildFieldMap(fields: FilterFieldConfig[]): FilterFieldConfigMap {
  const map: FilterFieldConfigMap = {};
  for (const field of fields) map[field.key] = field;
  return map;
}

/**
 * Applies all (complete) conditions to a dataset.
 *
 * @returns a new filtered array; the input is never mutated.
 */
export function applyFilters<T>(
  data: T[],
  conditions: FilterCondition[],
  fieldMap: FilterFieldConfigMap,
): T[] {
  // Drop conditions that are incomplete or reference an unknown field.
  const active = conditions.filter((c) => {
    const field = fieldMap[c.field];
    return field != null && isConditionComplete(c, field);
  });
  if (active.length === 0) return data;

  // Group by field → OR within a field, AND across fields.
  const groups = new Map<string, FilterCondition[]>();
  for (const c of active) {
    const existing = groups.get(c.field);
    if (existing) existing.push(c);
    else groups.set(c.field, [c]);
  }

  return data.filter((record) => {
    for (const [fieldKey, conds] of groups) {
      const field = fieldMap[fieldKey]!; // guaranteed present (filtered above)
      const passesGroup = conds.some((c) => matchCondition(record, c, field));
      if (!passesGroup) return false; // AND across different fields
    }
    return true;
  });
}
