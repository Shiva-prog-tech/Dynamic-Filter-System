import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import type { AmountRangeValue } from '../../types';

interface AmountRangeValueInputProps {
  value: AmountRangeValue;
  onChange: (value: AmountRangeValue) => void;
  currency?: string;
}

/** Resolves a currency symbol (e.g. "$") from an ISO code, falling back to "#". */
function currencySymbol(code?: string): string {
  if (!code) return '#';
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? code;
  } catch {
    return code;
  }
}

const parseNum = (s: string): number | null => {
  if (s.trim() === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
};

/**
 * Min/Max numeric range input for currency/amount fields. Each side keeps a
 * local string buffer (like NumberValueInput) so intermediate/decimal input
 * such as "1.50" isn't snapped back by the numeric round-trip while typing.
 */
export function AmountRangeValueInput({
  value,
  onChange,
  currency,
}: AmountRangeValueInputProps) {
  const v = value ?? { min: null, max: null };
  const symbol = currencySymbol(currency);
  const rangeInvalid = v.min != null && v.max != null && v.min > v.max;

  const [minStr, setMinStr] = useState(v.min == null ? '' : String(v.min));
  const [maxStr, setMaxStr] = useState(v.max == null ? '' : String(v.max));

  // Re-sync when the value changes from the outside (e.g. "Clear all").
  useEffect(() => {
    setMinStr(v.min == null ? '' : String(v.min));
  }, [v.min]);
  useEffect(() => {
    setMaxStr(v.max == null ? '' : String(v.max));
  }, [v.max]);

  const adornment = <InputAdornment position="start">{symbol}</InputAdornment>;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        type="number"
        label="Min"
        value={minStr}
        onChange={(e) => {
          setMinStr(e.target.value);
          onChange({ ...v, min: parseNum(e.target.value) });
        }}
        InputProps={{ startAdornment: adornment }}
        sx={{ flex: 1, minWidth: 120 }}
        inputProps={{ 'aria-label': 'Minimum amount' }}
      />
      <TextField
        size="small"
        type="number"
        label="Max"
        value={maxStr}
        error={rangeInvalid}
        helperText={rangeInvalid ? 'Max < Min' : undefined}
        onChange={(e) => {
          setMaxStr(e.target.value);
          onChange({ ...v, max: parseNum(e.target.value) });
        }}
        InputProps={{ startAdornment: adornment }}
        sx={{ flex: 1, minWidth: 120 }}
        inputProps={{ 'aria-label': 'Maximum amount' }}
      />
    </Box>
  );
}
