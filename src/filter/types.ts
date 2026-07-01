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

/* -------------------------------------------------------------------------- */
/* Compile-time-safe field paths                                              */
/* -------------------------------------------------------------------------- */

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * The set of dot-notation paths addressable on a record of type `T` — top-level
 * keys plus nested object paths (e.g. `"address.city"`). Arrays and primitives
 * are treated as leaves. When `T` is `unknown`/`any` (the default), this widens
 * to plain `string`, so the reusable core stays fully generic while a consumer
 * that supplies its row type gets **compile-time-checked field keys**.
 */
export type FieldPath<T> = unknown extends T
  ? string
  : T extends Primitive
    ? string
    : T extends readonly unknown[]
      ? string
      : {
          [K in keyof T & string]: NonNullable<T[K]> extends Primitive | readonly unknown[]
            ? K
            : K | `${K}.${FieldPath<NonNullable<T[K]>>}`;
        }[keyof T & string];

/**
 * A filterable field definition. The reusable core uses a plain `string` key so
 * it stays fully generic; consumers author configs through {@link defineFields}
 * to get **compile-time-checked keys** against their row type.
 */
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

/**
 * A field config whose `key` is constrained to the real dot-paths of row type
 * `T`. Used at authoring time (via {@link defineFields}); the library itself
 * only ever sees the widened {@link FilterFieldConfig}.
 */
export type TypedFieldConfig<T> = Omit<FilterFieldConfig, 'key'> & {
  key: FieldPath<T>;
};

/**
 * Authoring helper: validates every field `key` against the row type `T` at
 * compile time (a typo like `"addres.city"` is a build error), then widens to
 * the plain {@link FilterFieldConfig} the generic core consumes. Zero runtime
 * cost — it returns its input unchanged.
 */
export function defineFields<T>(fields: TypedFieldConfig<T>[]): FilterFieldConfig[] {
  return fields as FilterFieldConfig[];
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
