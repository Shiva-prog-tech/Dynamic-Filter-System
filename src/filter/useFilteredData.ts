/**
 * Memoised client-side filtering hook.
 *
 * Recomputes only when the data, conditions, or field config actually change,
 * so filtering 50+ records stays cheap and re-renders are minimised.
 */
import { useMemo } from 'react';
import { applyFilters, buildFieldMap } from './engine';
import type { FilterCondition, FilterFieldConfig } from './types';

export function useFilteredData<T>(
  data: T[],
  conditions: FilterCondition[],
  fields: FilterFieldConfig[],
): T[] {
  const fieldMap = useMemo(() => buildFieldMap(fields), [fields]);
  return useMemo(
    () => applyFilters(data, conditions, fieldMap),
    [data, conditions, fieldMap],
  );
}
