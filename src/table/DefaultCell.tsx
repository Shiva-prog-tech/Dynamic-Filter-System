import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { HighlightText } from './HighlightText';

const MAX_CHIPS = 4;

/**
 * Smart default renderer for a cell value when a column provides no custom
 * `render`. Handles the data variety required by the spec — arrays render as
 * chips, booleans as Yes/No chips, nullish as an em-dash. When `needles` are
 * supplied (from active text filters), matching substrings are highlighted.
 */
export function DefaultCell({ value, needles }: { value: unknown; needles?: string[] }) {
  if (value == null || value === '') {
    return (
      <Typography component="span" color="text.disabled">
        —
      </Typography>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography component="span" color="text.disabled">
          —
        </Typography>
      );
    }
    const shown = value.slice(0, MAX_CHIPS);
    const extra = value.length - shown.length;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {shown.map((v, i) => {
          const label = String(v);
          const matched = needles?.some((n) => label.toLowerCase() === n.toLowerCase());
          return (
            <Chip
              key={`${label}-${i}`}
              label={<HighlightText text={label} needles={needles} />}
              size="small"
              variant={matched ? 'filled' : 'outlined'}
              color={matched ? 'primary' : 'default'}
            />
          );
        })}
        {extra > 0 && <Chip label={`+${extra}`} size="small" />}
      </Box>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Chip
        label={value ? 'Yes' : 'No'}
        size="small"
        color={value ? 'success' : 'default'}
        variant={value ? 'filled' : 'outlined'}
      />
    );
  }

  if (typeof value === 'object') {
    // Nested object with no custom renderer — show labelled scalar pairs.
    // (Prefer a column `render` or a scalar `key` path for object columns.)
    const pairs = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v != null && typeof v !== 'object')
      .map(([k, v]) => `${k}: ${String(v)}`);
    if (pairs.length === 0) {
      return (
        <Typography component="span" color="text.disabled">
          —
        </Typography>
      );
    }
    return (
      <Typography component="span" variant="body2" color="text.secondary">
        {pairs.join(', ')}
      </Typography>
    );
  }

  return <HighlightText text={String(value)} needles={needles} />;
}
