import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectOption } from '../../types';

type Primitive = string | number | boolean;

interface SelectValueInputProps {
  value: Primitive | null;
  onChange: (value: Primitive | null) => void;
  options: SelectOption[];
}

// Option values may be string | number | boolean; MUI <Select> needs a string
// key, so we round-trip through `String()` and map back on change.
const keyOf = (v: unknown): string => (v == null ? '' : String(v));

/** Single-select dropdown for `select` fields. */
export function SelectValueInput({ value, onChange, options }: SelectValueInputProps) {
  return (
    <FormControl size="small" fullWidth>
      <Select
        displayEmpty
        value={keyOf(value)}
        onChange={(e) => {
          const key = e.target.value;
          const opt = options.find((o) => keyOf(o.value) === key);
          onChange(opt ? opt.value : null);
        }}
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ opacity: 0.55 }}>Select an option…</span>;
          }
          const opt = options.find((o) => keyOf(o.value) === selected);
          return opt ? opt.label : String(selected);
        }}
        inputProps={{ 'aria-label': 'Filter option' }}
      >
        {options.map((o) => (
          <MenuItem key={keyOf(o.value)} value={keyOf(o.value)}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
