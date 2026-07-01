/**
 * State-management hook for a list of filter conditions.
 *
 * It owns the condition array and exposes intent-named actions (add / update /
 * remove / clear). Switching a condition's *field* resets its operator and
 * value to sensible defaults for the new type. Optional `persistKey` mirrors
 * state to `localStorage` (filter-persistence bonus).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getDefaultOperator,
  getDefaultValue,
  getOperatorsForField,
} from './operators';
import type {
  DateRangeValue,
  FilterCondition,
  FilterFieldConfig,
  FilterValue,
  Operator,
} from './types';
import { newId } from './utils';

export interface UseFiltersOptions {
  /** Conditions to start with (used only on first mount). */
  initial?: FilterCondition[];
  /** When set, conditions are persisted to `localStorage` under this key. */
  persistKey?: string;
}

export interface FilterController {
  conditions: FilterCondition[];
  /** Append a new condition; defaults to the first field (or `fieldKey`). */
  addCondition: (fieldKey?: string) => void;
  /** Change the field of a condition (resets operator + value). */
  updateField: (id: string, fieldKey: string) => void;
  updateOperator: (id: string, operator: Operator) => void;
  updateValue: (id: string, value: FilterValue) => void;
  removeCondition: (id: string) => void;
  clearAll: () => void;
  /** Replace the whole list (e.g. when loading a saved view). */
  setConditions: (conditions: FilterCondition[]) => void;
}

function readPersisted(persistKey: string | undefined): FilterCondition[] | null {
  if (!persistKey || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(persistKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as FilterCondition[];
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

/**
 * Reconciles persisted conditions with the current field config: drops
 * conditions whose field no longer exists, and repairs conditions whose
 * operator is no longer valid for its field (resetting operator + value). This
 * prevents a stale/older persisted schema from feeding out-of-range values into
 * the UI controls.
 */
function normalizePersisted(
  conditions: FilterCondition[] | null,
  fields: FilterFieldConfig[],
): FilterCondition[] | null {
  if (!conditions) return null;
  const byKey: Record<string, FilterFieldConfig> = {};
  for (const f of fields) byKey[f.key] = f;

  const result: FilterCondition[] = [];
  for (const c of conditions) {
    if (!c || typeof c.id !== 'string' || typeof c.field !== 'string') continue;
    const field = byKey[c.field];
    if (!field) continue; // unknown field → drop
    const validOperators = getOperatorsForField(field).map((o) => o.value);
    if (!validOperators.includes(c.operator)) {
      result.push({
        ...c,
        operator: getDefaultOperator(field.type),
        value: getDefaultValue(field.type),
      });
    } else {
      result.push(c);
    }
  }
  return result;
}

export function useFilters(
  fields: FilterFieldConfig[],
  options: UseFiltersOptions = {},
): FilterController {
  const { initial = [], persistKey } = options;

  const [conditions, setConditions] = useState<FilterCondition[]>(
    () => normalizePersisted(readPersisted(persistKey), fields) ?? initial,
  );

  const fieldByKey = useMemo(() => {
    const map: Record<string, FilterFieldConfig> = {};
    for (const f of fields) map[f.key] = f;
    return map;
  }, [fields]);

  // Persist on change (skip the very first run to avoid a redundant write).
  const firstRun = useRef(true);
  useEffect(() => {
    if (!persistKey || typeof localStorage === 'undefined') return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      localStorage.setItem(persistKey, JSON.stringify(conditions));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [persistKey, conditions]);

  const addCondition = useCallback(
    (fieldKey?: string) => {
      const field = fieldKey ? fieldByKey[fieldKey] : fields[0];
      if (!field) return;
      setConditions((prev) => [
        ...prev,
        {
          id: newId(),
          field: field.key,
          operator: getDefaultOperator(field.type),
          value: getDefaultValue(field.type),
        },
      ]);
    },
    [fieldByKey, fields],
  );

  const updateField = useCallback(
    (id: string, fieldKey: string) => {
      const field = fieldByKey[fieldKey];
      if (!field) return;
      setConditions((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                field: fieldKey,
                operator: getDefaultOperator(field.type),
                value: getDefaultValue(field.type),
              }
            : c,
        ),
      );
    },
    [fieldByKey],
  );

  const updateOperator = useCallback(
    (id: string, operator: Operator) => {
      setConditions((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          // For date fields the value shape varies per operator; clear the now
          // irrelevant slot so a stale range can't silently re-apply on switch.
          const field = fieldByKey[c.field];
          let value = c.value;
          if (field?.type === 'date') {
            const v = (value as DateRangeValue) ?? { from: null, to: null };
            if (operator === 'before') value = { from: null, to: v.to };
            else if (operator === 'after') value = { from: v.from, to: null };
            else if (operator === 'last7days' || operator === 'last30days')
              value = { from: null, to: null };
            // 'between' keeps both slots.
          }
          return { ...c, operator, value };
        }),
      );
    },
    [fieldByKey],
  );

  const updateValue = useCallback((id: string, value: FilterValue) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c)),
    );
  }, []);

  const removeCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => setConditions([]), []);

  return {
    conditions,
    addCondition,
    updateField,
    updateOperator,
    updateValue,
    removeCondition,
    clearAll,
    setConditions,
  };
}
