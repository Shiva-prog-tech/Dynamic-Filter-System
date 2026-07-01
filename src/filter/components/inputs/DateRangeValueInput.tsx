import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parseISO } from 'date-fns';
import type { DateRangeValue, Operator } from '../../types';

interface DateRangeValueInputProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  operator: Operator;
}

const toDate = (s: string | null): Date | null => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
};
const toIso = (d: Date | null): string | null =>
  d && isValid(d) ? format(d, 'yyyy-MM-dd') : null;

const textFieldSlot = { textField: { size: 'small' as const, fullWidth: true } };

/**
 * Date input whose shape adapts to the chosen operator:
 *   • `between`            → From + To pickers
 *   • `before` / `after`   → a single picker
 *   • `last7days`/`last30days` → no input (relative to today)
 */
export function DateRangeValueInput({
  value,
  onChange,
  operator,
}: DateRangeValueInputProps) {
  const v = value ?? { from: null, to: null };

  if (operator === 'last7days' || operator === 'last30days') {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        Relative to today — no date input needed.
      </Typography>
    );
  }

  if (operator === 'before') {
    return (
      <DatePicker
        label="Before"
        value={toDate(v.to)}
        onChange={(d) => onChange({ ...v, to: toIso(d) })}
        slotProps={textFieldSlot}
      />
    );
  }

  if (operator === 'after') {
    return (
      <DatePicker
        label="After"
        value={toDate(v.from)}
        onChange={(d) => onChange({ ...v, from: toIso(d) })}
        slotProps={textFieldSlot}
      />
    );
  }

  // between
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <DatePicker
        label="From"
        value={toDate(v.from)}
        maxDate={toDate(v.to) ?? undefined}
        onChange={(d) => onChange({ ...v, from: toIso(d) })}
        slotProps={{ textField: { size: 'small' } }}
        sx={{ flex: 1, minWidth: 150 }}
      />
      <DatePicker
        label="To"
        value={toDate(v.to)}
        minDate={toDate(v.from) ?? undefined}
        onChange={(d) => onChange({ ...v, to: toIso(d) })}
        slotProps={{ textField: { size: 'small' } }}
        sx={{ flex: 1, minWidth: 150 }}
      />
    </Box>
  );
}
