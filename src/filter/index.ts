/**
 * Public surface of the reusable filter system.
 *
 * Consumers only ever import from `@/filter` — the internal module layout can
 * change without breaking them.
 */

// Types
export type {
  FieldType,
  Operator,
  SelectOption,
  FieldPath,
  FilterFieldConfig,
  TypedFieldConfig,
  FilterFieldConfigMap,
  FilterValue,
  FilterCondition,
  DateRangeValue,
  AmountRangeValue,
  OperatorOption,
} from './types';
export { defineFields } from './types';

// Operator registry
export {
  OPERATORS_BY_TYPE,
  getOperatorsForType,
  getDefaultOperator,
  getDefaultValue,
} from './operators';

// Engine (pure)
export { applyFilters, matchCondition, buildFieldMap } from './engine';

// Validation
export { validateCondition, isConditionComplete } from './validation';
export type { ValidationResult } from './validation';

// Utilities
export {
  getValueByPath,
  formatCurrency,
  formatDate,
  toDateKey,
  buildOptions,
  newId,
} from './utils';

// Hooks
export { useFilters } from './useFilters';
export type { FilterController, UseFiltersOptions } from './useFilters';
export { useFilteredData } from './useFilteredData';
export { useDebouncedCallback } from './useDebouncedCallback';
export { useFacets } from './useFacets';
export type { FieldFacet, FacetMap } from './useFacets';

// URL state (deep-linkable / shareable filters)
export {
  encodeConditions,
  decodeConditions,
  readUrlParam,
  writeUrlParam,
} from './urlState';

// Components
export { FilterPanel } from './components/FilterPanel';
export type { FilterPanelProps } from './components/FilterPanel';
export { FilterRow } from './components/FilterRow';
export { ValueInput } from './components/ValueInput';
