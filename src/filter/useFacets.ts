/**
 * Faceted-search metadata for the filter builder.
 *
 * For every field we compute what the results would look like *given all the
 * OTHER active filters* (the classic Amazon/Linear facet behaviour):
 *   • select / multiSelect → a count per option ("Engineering (23)").
 *   • number / amount / date → the distribution of values, for a sparklic
 *     histogram behind the range inputs.
 *
 * Excluding the field's own conditions from its base set is what makes the
 * counts actionable — they tell you what adding each option *would* yield.
 */
import { useMemo } from 'react';
import { applyFilters, buildFieldMap } from './engine';
import type { FilterCondition, FilterFieldConfig } from './types';
import { getValueByPath, toDateKey } from './utils';
import { isConditionComplete } from './validation';

export interface FieldFacet {
  /** select/multiSelect: stringified option value → count under other filters. */
  counts?: Record<string, number>;
  /** number/amount: raw values; date: day timestamps — under other filters. */
  values?: number[];
  /** Number of rows in the base set (all other filters applied). */
  base: number;
}

/** Facets keyed by field key. */
export type FacetMap = Record<string, FieldFacet>;

/** Midnight timestamp of a date-like value (timezone-safe via `toDateKey`). */
function toTimestamp(raw: unknown): number | null {
  const key = toDateKey(raw);
  if (!key) return null;
  const t = new Date(`${key}T00:00:00`).getTime();
  return Number.isNaN(t) ? null : t;
}

export function useFacets<T>(
  data: T[],
  conditions: FilterCondition[],
  fields: FilterFieldConfig[],
): FacetMap {
  const fieldMap = useMemo(() => buildFieldMap(fields), [fields]);

  return useMemo(() => {
    const complete = conditions.filter((c) => {
      const f = fieldMap[c.field];
      return f != null && isConditionComplete(c, f);
    });

    const map: FacetMap = {};

    for (const field of fields) {
      // Base = every OTHER field's conditions applied (self excluded).
      const others = complete.filter((c) => c.field !== field.key);
      const base = others.length ? applyFilters(data, others, fieldMap) : data;

      if (field.type === 'select' || field.type === 'multiSelect') {
        const counts: Record<string, number> = {};
        for (const opt of field.options ?? []) counts[String(opt.value)] = 0;

        for (const row of base) {
          const raw = getValueByPath(row, field.key);
          const vals = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
          const seen = new Set<string>(); // count each row once per value
          for (const v of vals) {
            const k = String(v);
            if (k in counts && !seen.has(k)) {
              counts[k] = (counts[k] ?? 0) + 1;
              seen.add(k);
            }
          }
        }
        map[field.key] = { counts, base: base.length };
      } else if (field.type === 'amount' || field.type === 'number') {
        const values: number[] = [];
        for (const row of base) {
          const raw = getValueByPath(row, field.key);
          const n = typeof raw === 'number' ? raw : Number(raw);
          if (raw != null && raw !== '' && !Number.isNaN(n)) values.push(n);
        }
        map[field.key] = { values, base: base.length };
      } else if (field.type === 'date') {
        const values: number[] = [];
        for (const row of base) {
          const t = toTimestamp(getValueByPath(row, field.key));
          if (t != null) values.push(t);
        }
        map[field.key] = { values, base: base.length };
      } else {
        map[field.key] = { base: base.length };
      }
    }

    return map;
  }, [data, conditions, fieldMap, fields]);
}
