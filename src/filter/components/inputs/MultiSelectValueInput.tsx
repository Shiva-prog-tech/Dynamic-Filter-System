import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SelectOption } from '../../types';

interface MultiSelectValueInputProps {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: SelectOption[];
  /** Faceted match counts by stringified option value (optional). */
  counts?: Record<string, number>;
}

const keyOf = (v: unknown): string => String(v);

/** Multi-select dropdown with checkboxes + chips for `multiSelect` fields. */
export function MultiSelectValueInput({
  value,
  onChange,
  options,
  counts,
}: MultiSelectValueInputProps) {
  // Build the selected options from `value` (not by filtering `options`) so a
  // persisted selection isn't silently dropped when it isn't in the current
  // options — e.g. options are still loading, or the data changed. Unknown
  // values are shown with a synthesized label instead of vanishing.
  const selectedOpts = value.map(
    (v) => options.find((o) => keyOf(o.value) === keyOf(v)) ?? { label: String(v), value: v },
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      options={options}
      value={selectedOpts}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => keyOf(a.value) === keyOf(b.value)}
      onChange={(_, opts) =>
        onChange(opts.map((o) => o.value as string | number))
      }
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props as { key?: string } & Record<string, unknown>;
        const count = counts?.[keyOf(option.value)];
        return (
          <li key={keyOf(option.value)} {...rest}>
            <Checkbox size="small" checked={selected} sx={{ mr: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <span>{option.label}</span>
              {count !== undefined && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </Typography>
              )}
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedOpts.length ? '' : 'Select one or more…'}
          // Merge AFTER params.inputProps so the combobox a11y props are kept
          // and the label lands on the real <input> (not the wrapper).
          inputProps={{ ...params.inputProps, 'aria-label': 'Filter values' }}
        />
      )}
    />
  );
}
