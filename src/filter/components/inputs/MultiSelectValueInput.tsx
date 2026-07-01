import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import type { SelectOption } from '../../types';

interface MultiSelectValueInputProps {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: SelectOption[];
}

const keyOf = (v: unknown): string => String(v);

/** Multi-select dropdown with checkboxes + chips for `multiSelect` fields. */
export function MultiSelectValueInput({
  value,
  onChange,
  options,
}: MultiSelectValueInputProps) {
  const selectedKeys = value.map(keyOf);
  const selectedOpts = options.filter((o) => selectedKeys.includes(keyOf(o.value)));

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
        return (
          <li key={keyOf(option.value)} {...rest}>
            <Checkbox size="small" checked={selected} sx={{ mr: 1 }} />
            {option.label}
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
