/**
 * Core type definitions for the reusable dynamic filter system.
 *
 * The whole system is **configuration-driven**: a consumer describes their
 * columns with `FilterFieldConfig[]` and the components/engine adapt — no
 * field names are ever hard-coded inside the filter implementation.
 */

/** The set of value categories the system knows how to render & evaluate. */
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'amount'
  | 'select'
  | 'multiSelect'
  | 'boolean';

/* -------------------------------------------------------------------------- */
/* Operators, grouped by the field family they belong to.                     */
/* -------------------------------------------------------------------------- */

export type TextOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'doesNotContain';

export type NumberOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

/** `between` is the required date operator; the rest are bonus relative operators. */
export type DateOperator = 'between' | 'before' | 'after' | 'last7days' | 'last30days';

export type AmountOperator = 'between';

export type SelectOperator = 'is' | 'isNot';

/** `containsAll` is a bonus "advanced" operator for array-valued fields. */
export type MultiSelectOperator = 'in' | 'notIn' | 'containsAll';

export type BooleanOperator = 'is';

export type Operator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | AmountOperator
  | SelectOperator
  | MultiSelectOperator
  | BooleanOperator;

/* -------------------------------------------------------------------------- */
/* Field configuration                                                        */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterFieldConfig {
  /**
   * Path to the value on a record. Supports dot-notation for nested objects,
   * e.g. `"address.city"`.
   */
  key: string;
  /** Human-readable label shown in the field dropdown and active-filter chips. */
  label: string;
  /** Drives which operators are offered and which input control is rendered. */
  type: FieldType;
  /** Options for `select` / `multiSelect` fields. */
  options?: SelectOption[];
  /**
   * Marks a field whose record value is itself an array (e.g. `skills`).
   * Enables set-overlap semantics for `multiSelect` operators.
   */
  isArray?: boolean;
  /** ISO 4217 currency code for `amount` fields, used purely for display. */
  currency?: string;
  /** Optional placeholder for free-text / number inputs. */
  placeholder?: string;
}

/** Fast lookup of a field config by its `key`. */
export type FilterFieldConfigMap = Record<string, FilterFieldConfig>;

/* -------------------------------------------------------------------------- */
/* Filter values & conditions                                                 */
/* -------------------------------------------------------------------------- */

export interface DateRangeValue {
  from: string | null; // ISO 'yyyy-MM-dd'
  to: string | null;
}

export interface AmountRangeValue {
  min: number | null;
  max: number | null;
}

/** Discriminated by the owning field's `type` (see `engine.ts`). */
export type FilterValue =
  | string
  | number
  | boolean
  | (string | number)[]
  | DateRangeValue
  | AmountRangeValue
  | null;

/** A single user-authored filter condition. */
export interface FilterCondition {
  id: string;
  field: string; // matches FilterFieldConfig.key
  operator: Operator;
  value: FilterValue;
}

/** Metadata describing an operator for rendering in a dropdown. */
export interface OperatorOption {
  value: Operator;
  label: string;
}
