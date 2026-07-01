/**
 * Renders a filter condition as a short human-readable phrase, used by the
 * active-filter chips (e.g. `Salary between $80,000 – $120,000`).
 */
import { OPERATORS_BY_TYPE } from './operators';
import type {
  AmountRangeValue,
  DateRangeValue,
  FilterCondition,
  FilterFieldConfig,
  Operator,
} from './types';
import { formatCurrency, formatDate } from './utils';

function operatorLabel(field: FilterFieldConfig, op: Operator): string {
  return (
    OPERATORS_BY_TYPE[field.type].find((o) => o.value === op)?.label ?? op
  );
}

function optionLabel(field: FilterFieldConfig, raw: unknown): string {
  const opt = field.options?.find((o) => String(o.value) === String(raw));
  return opt ? opt.label : String(raw);
}

export function describeCondition(
  condition: FilterCondition,
  field: FilterFieldConfig,
): string {
  const { operator, value } = condition;
  const op = operatorLabel(field, operator).toLowerCase();

  switch (field.type) {
    case 'text':
      return `${field.label} ${op} "${value}"`;

    case 'number':
      return `${field.label} ${op} ${value}`;

    case 'amount': {
      const v = value as AmountRangeValue;
      const min = v.min != null ? formatCurrency(v.min, field.currency) : null;
      const max = v.max != null ? formatCurrency(v.max, field.currency) : null;
      if (min && max) return `${field.label}: ${min} – ${max}`;
      if (min) return `${field.label} ≥ ${min}`;
      if (max) return `${field.label} ≤ ${max}`;
      return field.label;
    }

    case 'date': {
      if (operator === 'last7days') return `${field.label} in the last 7 days`;
      if (operator === 'last30days') return `${field.label} in the last 30 days`;
      const v = value as DateRangeValue;
      if (operator === 'before') return `${field.label} before ${formatDate(v.to)}`;
      if (operator === 'after') return `${field.label} after ${formatDate(v.from)}`;
      const from = v.from ? formatDate(v.from) : null;
      const to = v.to ? formatDate(v.to) : null;
      if (from && to) return `${field.label}: ${from} – ${to}`;
      if (from) return `${field.label} ≥ ${from}`;
      if (to) return `${field.label} ≤ ${to}`;
      return field.label;
    }

    case 'select':
      return `${field.label} ${op} ${optionLabel(field, value)}`;

    case 'multiSelect': {
      const arr = Array.isArray(value) ? value : [];
      const labels = arr.map((v) => optionLabel(field, v));
      return `${field.label} ${op} [${labels.join(', ')}]`;
    }

    case 'boolean':
      return `${field.label} is ${value ? 'True' : 'False'}`;

    default:
      return field.label;
  }
}
