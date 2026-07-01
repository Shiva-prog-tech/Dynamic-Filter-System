/**
 * The operator registry — the single source of truth mapping each
 * {@link FieldType} to the operators it supports and the labels shown in the
 * UI. Adding a new field type is a localised change: extend this map (plus a
 * matcher in `engine.ts` and an input in `components/inputs`).
 */
import type {
  FieldType,
  FilterFieldConfig,
  FilterValue,
  Operator,
  OperatorOption,
} from './types';
import { assertNever } from './utils';

export const OPERATORS_BY_TYPE: Record<FieldType, OperatorOption[]> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'doesNotContain', label: 'Does not contain' },
  ],
  number: [
    { value: 'eq', label: '= Equals' },
    { value: 'neq', label: '≠ Not equal' },
    { value: 'gt', label: '> Greater than' },
    { value: 'gte', label: '≥ Greater or equal' },
    { value: 'lt', label: '< Less than' },
    { value: 'lte', label: '≤ Less or equal' },
  ],
  date: [
    { value: 'between', label: 'Between' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'last7days', label: 'In the last 7 days' },
    { value: 'last30days', label: 'In the last 30 days' },
  ],
  amount: [{ value: 'between', label: 'Between' }],
  select: [
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
  ],
  multiSelect: [
    { value: 'in', label: 'In (any of)' },
    { value: 'notIn', label: 'Not in (none of)' },
    { value: 'containsAll', label: 'Contains all of' },
  ],
  boolean: [{ value: 'is', label: 'Is' }],
};

/** Operators available for a given field type. */
export function getOperatorsForType(type: FieldType): OperatorOption[] {
  return OPERATORS_BY_TYPE[type] ?? [];
}

/**
 * Operators available for a specific field. Like {@link getOperatorsForType}
 * but also gates operators that only make sense for certain field shapes —
 * e.g. `Contains all` is meaningless on a scalar-backed `multiSelect`, so it is
 * only offered when the field is array-valued (`isArray`).
 */
export function getOperatorsForField(field: FilterFieldConfig): OperatorOption[] {
  const operators = getOperatorsForType(field.type);
  if (field.type === 'multiSelect' && !field.isArray) {
    return operators.filter((o) => o.value !== 'containsAll');
  }
  return operators;
}

/** The default (first) operator for a field type. */
export function getDefaultOperator(type: FieldType): Operator {
  return OPERATORS_BY_TYPE[type][0]?.value ?? 'equals';
}

/** The empty/initial value used when a new condition of this type is created. */
export function getDefaultValue(type: FieldType): FilterValue {
  switch (type) {
    case 'text':
      return '';
    case 'number':
      return null;
    case 'date':
      return { from: null, to: null };
    case 'amount':
      return { min: null, max: null };
    case 'select':
      return null;
    case 'multiSelect':
      return [];
    case 'boolean':
      return null; // neutral: no filtering until the user chooses true/false
    default:
      return assertNever(type);
  }
}
