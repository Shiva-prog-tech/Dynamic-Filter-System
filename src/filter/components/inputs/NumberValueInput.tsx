import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';

interface NumberValueInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

/**
 * Numeric input with inline validation. Emits `null` while empty/invalid so the
 * engine treats the condition as incomplete rather than filtering on `NaN`.
 */
export function NumberValueInput({ value, onChange, placeholder }: NumberValueInputProps) {
  const [local, setLocal] = useState(value == null ? '' : String(value));

  useEffect(() => {
    setLocal(value == null ? '' : String(value));
  }, [value]);

  const invalid = local.trim() !== '' && Number.isNaN(Number(local));

  return (
    <TextField
      size="small"
      fullWidth
      type="number"
      placeholder={placeholder ?? 'Enter a number…'}
      value={local}
      error={invalid}
      helperText={invalid ? 'Enter a valid number' : undefined}
      onChange={(e) => {
        const raw = e.target.value;
        setLocal(raw);
        if (raw.trim() === '') {
          onChange(null);
          return;
        }
        const n = Number(raw);
        onChange(Number.isNaN(n) ? null : n);
      }}
      inputProps={{ 'aria-label': 'Filter number value', inputMode: 'decimal' }}
    />
  );
}
