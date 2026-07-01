/**
 * Derives "what to highlight in the table" from the active filter conditions —
 * the visual bridge that connects a filter to the results it produced.
 *
 *   • Text/select/multiSelect (positive operators) contribute case-insensitive
 *     **needles** to <mark> inside string cells.
 *   • Number/amount/date conditions contribute an **inRange** predicate; cells
 *     whose value satisfies the condition get a subtle tint.
 *
 * Range predicates reuse the engine's {@link matchCondition} so highlighting can
 * never drift from the actual filtering logic (single source of truth).
 */
import { matchCondition } from './engine';
import type { FilterCondition, FilterFieldConfig, FilterFieldConfigMap } from './types';
import { isConditionComplete } from './validation';

export interface Highlight {
  /** Case-insensitive substrings to emphasise in text cells. */
  text: string[];
  /** True when a cell value falls inside a matched numeric/date range. */
  inRange?: (value: unknown) => boolean;
}

/** Highlights keyed by field key (which equals the table column key). */
export type HighlightMap = Record<string, Highlight>;

function pushNeedle(entry: Highlight, value: unknown) {
  const s = value == null ? '' : String(value).trim();
  if (s) entry.text.push(s);
}

export function buildHighlights(
  conditions: FilterCondition[],
  fieldMap: FilterFieldConfigMap,
): HighlightMap {
  const map: HighlightMap = {};

  for (const c of conditions) {
    const field: FilterFieldConfig | undefined = fieldMap[c.field];
    if (!field || !isConditionComplete(c, field)) continue;

    const entry = (map[c.field] ??= { text: [] });

    switch (field.type) {
      case 'text':
        // "does not contain" describes an absence — nothing to highlight.
        if (c.operator !== 'doesNotContain') pushNeedle(entry, c.value);
        break;

      case 'select':
        if (c.operator === 'is') pushNeedle(entry, c.value);
        break;

      case 'multiSelect':
        if ((c.operator === 'in' || c.operator === 'containsAll') && Array.isArray(c.value)) {
          for (const v of c.value) pushNeedle(entry, v);
        }
        break;

      case 'number':
      case 'amount':
      case 'date': {
        // Compose (OR) with any existing predicate for the same field.
        const prev = entry.inRange;
        const pred = (raw: unknown) => matchCondition({ [c.field]: raw }, c, field);
        entry.inRange = prev ? (raw) => prev(raw) || pred(raw) : pred;
        break;
      }

      default:
        break;
    }
  }

  return map;
}
