import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface BooleanValueInputProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

/**
 * Two-option segmented control for `boolean` fields. Starts with neither option
 * selected (`value === null`) so the filter only applies once the user makes a
 * deliberate choice — consistent with how select/number start "incomplete".
 */
export function BooleanValueInput({ value, onChange }: BooleanValueInputProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      color="primary"
      value={value}
      onChange={(_, next: boolean | null) => {
        // Ignore deselection (clicking the active button) to keep a value.
        if (next !== null) onChange(next);
      }}
      aria-label="Filter boolean value"
    >
      <ToggleButton value={true} sx={{ px: 2 }} aria-label="True">
        True
      </ToggleButton>
      <ToggleButton value={false} sx={{ px: 2 }} aria-label="False">
        False
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
