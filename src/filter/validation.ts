/**
 * Validation logic for filter conditions.
 *
 * A condition is only applied to the dataset once it is *complete* — i.e. the
 * user has supplied enough input for it to mean something. This keeps the
 * table from emptying out while a filter is mid-edit, and powers the inline
 * "incomplete" hint in the UI.
 */
import type {
  AmountRangeValue,
  DateRangeValue,
  FilterCondition,
  FilterFieldConfig,
} from './types';
import { assertNever } from './utils';

export interface ValidationResult {
  /** Whether the condition currently contributes to filtering. */
  complete: boolean;
  /** Optional human-readable reason it is not yet applied / is invalid. */
  message?: string;
}

export function validateCondition(
  condition: FilterCondition,
  field: FilterFieldConfig | undefined,
): ValidationResult {
  if (!field) return { complete: false, message: 'Unknown field' };

  const { value, operator } = condition;

  switch (field.type) {
    case 'text': {
      const ok = typeof value === 'string' && value.trim().length > 0;
      return ok ? { complete: true } : { complete: false, message: 'Enter a value' };
    }

    case 'number': {
      if (value === null || value === undefined || (value as unknown) === '') {
        return { complete: false, message: 'Enter a number' };
      }
      const ok = typeof value === 'number' && Number.isFinite(value);
      return ok ? { complete: true } : { complete: false, message: 'Must be a valid number' };
    }

    case 'amount': {
      const v = value as AmountRangeValue | null;
      if (!v || (v.min == null && v.max == null)) {
        return { complete: false, message: 'Enter a min or max' };
      }
      if (v.min != null && v.max != null && v.min > v.max) {
        return { complete: false, message: 'Min cannot exceed max' };
      }
      return { complete: true };
    }

    case 'date': {
      if (operator === 'last7days' || operator === 'last30days') {
        return { complete: true };
      }
      const v = value as DateRangeValue | null;
      if (!v) return { complete: false, message: 'Pick a date' };
      if (operator === 'before') {
        return v.to ? { complete: true } : { complete: false, message: 'Pick a date' };
      }
      if (operator === 'after') {
        return v.from ? { complete: true } : { complete: false, message: 'Pick a date' };
      }
      // between
      if (!v.from && !v.to) return { complete: false, message: 'Pick a date range' };
      if (v.from && v.to && v.from > v.to) {
        return { complete: false, message: '"From" is after "To"' };
      }
      return { complete: true };
    }

    case 'select': {
      const ok = value !== null && value !== undefined && value !== '';
      return ok ? { complete: true } : { complete: false, message: 'Choose an option' };
    }

    case 'multiSelect': {
      const ok = Array.isArray(value) && value.length > 0;
      return ok ? { complete: true } : { complete: false, message: 'Choose one or more' };
    }

    case 'boolean': {
      // `null` (the neutral default) is intentionally incomplete, so a freshly
      // added boolean filter does not silently apply until the user chooses.
      const ok = typeof value === 'boolean';
      return ok ? { complete: true } : { complete: false, message: 'Choose true or false' };
    }

    default:
      return assertNever(field.type);
  }
}

/** Convenience predicate used by the filtering engine. */
export function isConditionComplete(
  condition: FilterCondition,
  field: FilterFieldConfig | undefined,
): boolean {
  return validateCondition(condition, field).complete;
}
