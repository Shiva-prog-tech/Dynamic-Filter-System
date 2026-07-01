import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getOperatorsForField } from '../operators';
import type { FilterFieldConfig, Operator } from '../types';

interface OperatorSelectProps {
  field: FilterFieldConfig;
  value: Operator;
  onChange: (operator: Operator) => void;
}

/** Dropdown of operators valid for the current field (type + shape aware). */
export function OperatorSelect({ field, value, onChange }: OperatorSelectProps) {
  const operators = getOperatorsForField(field);

  return (
    <FormControl size="small" fullWidth>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as Operator)}
        inputProps={{ 'aria-label': 'Filter operator' }}
      >
        {operators.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
