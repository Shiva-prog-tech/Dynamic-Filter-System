import type {
  AmountRangeValue,
  DateRangeValue,
  FilterFieldConfig,
  FilterValue,
  Operator,
} from '../types';
import { assertNever } from '../utils';
import { AmountRangeValueInput } from './inputs/AmountRangeValueInput';
import { BooleanValueInput } from './inputs/BooleanValueInput';
import { DateRangeValueInput } from './inputs/DateRangeValueInput';
import { MultiSelectValueInput } from './inputs/MultiSelectValueInput';
import { NumberValueInput } from './inputs/NumberValueInput';
import { SelectValueInput } from './inputs/SelectValueInput';
import { TextValueInput } from './inputs/TextValueInput';

interface ValueInputProps {
  field: FilterFieldConfig;
  operator: Operator;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

/**
 * Renders the correct value control for a field's type — the single point of
 * "type → input" dispatch. Adding a new field type means adding one `case`.
 */
export function ValueInput({ field, operator, value, onChange }: ValueInputProps) {
  switch (field.type) {
    case 'text':
      return (
        <TextValueInput
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );

    case 'number':
      return (
        <NumberValueInput
          value={typeof value === 'number' ? value : null}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );

    case 'amount':
      return (
        <AmountRangeValueInput
          value={(value as AmountRangeValue) ?? { min: null, max: null }}
          onChange={onChange}
          currency={field.currency}
        />
      );

    case 'date':
      return (
        <DateRangeValueInput
          value={(value as DateRangeValue) ?? { from: null, to: null }}
          onChange={onChange}
          operator={operator}
        />
      );

    case 'select':
      return (
        <SelectValueInput
          value={value as string | number | boolean | null}
          onChange={onChange}
          options={field.options ?? []}
        />
      );

    case 'multiSelect':
      return (
        <MultiSelectValueInput
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          options={field.options ?? []}
        />
      );

    case 'boolean':
      return (
        <BooleanValueInput
          value={typeof value === 'boolean' ? value : null}
          onChange={onChange}
        />
      );

    default:
      return assertNever(field.type);
  }
}
