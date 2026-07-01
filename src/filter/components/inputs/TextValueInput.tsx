import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useDebouncedCallback } from '../../useDebouncedCallback';

interface TextValueInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Free-text input. Keeps a local copy for instant typing feedback and
 * propagates upward on a 300 ms debounce so filtering doesn't run per keystroke.
 */
export function TextValueInput({ value, onChange, placeholder }: TextValueInputProps) {
  const [local, setLocal] = useState(value ?? '');

  // Re-sync when the value changes from the outside (e.g. "Clear all").
  useEffect(() => {
    setLocal(value ?? '');
  }, [value]);

  const debounced = useDebouncedCallback(onChange, 300);

  return (
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder ?? 'Enter text…'}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        debounced(e.target.value);
      }}
      inputProps={{ 'aria-label': 'Filter value' }}
    />
  );
}
