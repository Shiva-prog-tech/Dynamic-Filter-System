import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { SelectOption } from '../../types';

type Primitive = string | number | boolean;

interface SelectValueInputProps {
  value: Primitive | null;
  onChange: (value: Primitive | null) => void;
  options: SelectOption[];
  /** Faceted match counts by stringified option value (optional). */
  counts?: Record<string, number>;
}

// Option values may be string | number | boolean; MUI <Select> needs a string
// key, so we round-trip through `String()` and map back on change.
const keyOf = (v: unknown): string => (v == null ? '' : String(v));

/** Single-select dropdown for `select` fields, with optional facet counts. */
export function SelectValueInput({ value, onChange, options, counts }: SelectValueInputProps) {
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
        {options.map((o) => {
          const count = counts?.[keyOf(o.value)];
          const empty = count === 0;
          return (
            <MenuItem key={keyOf(o.value)} value={keyOf(o.value)} sx={{ opacity: empty ? 0.5 : 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                <span>{o.label}</span>
                {count !== undefined && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {count}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
