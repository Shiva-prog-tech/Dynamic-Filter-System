import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { FilterFieldConfig } from '../types';

interface FieldSelectProps {
  fields: FilterFieldConfig[];
  value: string;
  onChange: (fieldKey: string) => void;
}

/** Dropdown to pick which column a condition applies to. */
export function FieldSelect({ fields, value, onChange }: FieldSelectProps) {
  return (
    <FormControl size="small" fullWidth>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ 'aria-label': 'Filter field' }}
      >
        {fields.map((f) => (
          <MenuItem key={f.key} value={f.key}>
            {f.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
