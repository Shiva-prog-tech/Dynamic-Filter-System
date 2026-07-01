import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type {
  FilterCondition,
  FilterFieldConfig,
  FilterFieldConfigMap,
  FilterValue,
  Operator,
} from '../types';
import { validateCondition } from '../validation';
import { FieldSelect } from './FieldSelect';
import { OperatorSelect } from './OperatorSelect';
import { ValueInput } from './ValueInput';

interface FilterRowProps {
  condition: FilterCondition;
  fields: FilterFieldConfig[];
  fieldMap: FilterFieldConfigMap;
  onFieldChange: (id: string, fieldKey: string) => void;
  onOperatorChange: (id: string, operator: Operator) => void;
  onValueChange: (id: string, value: FilterValue) => void;
  onRemove: (id: string) => void;
}

/**
 * A single filter condition: field selector, operator selector, a
 * type-appropriate value input, and a remove button. Fully responsive —
 * stacks vertically on mobile, lays out in a row on larger screens — with a
 * smooth hover lift and a warning accent while the condition is incomplete.
 */
export function FilterRow({
  condition,
  fields,
  fieldMap,
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onRemove,
}: FilterRowProps) {
  const theme = useTheme();
  const field = fieldMap[condition.field];
  if (!field) return null;

  const validation = validateCondition(condition, field);
  const incomplete = !validation.complete;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: { xs: 'stretch', md: 'flex-start' },
        flexDirection: { xs: 'column', md: 'row' },
        p: 1.75,
        borderRadius: 3,
        bgcolor: (t) =>
          incomplete
            ? alpha(t.palette.warning.main, 0.06)
            : alpha(t.palette.mode === 'dark' ? '#ffffff' : '#1a1c25', 0.025),
        border: '1px solid',
        borderColor: incomplete ? alpha(theme.palette.warning.main, 0.4) : 'divider',
        transition: 'border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        '&:hover': {
          borderColor: incomplete
            ? alpha(theme.palette.warning.main, 0.6)
            : alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 6px 18px ${alpha('#000', theme.palette.mode === 'dark' ? 0.35 : 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0 }}>
        <FieldSelect
          fields={fields}
          value={condition.field}
          onChange={(key) => onFieldChange(condition.id, key)}
        />
      </Box>

      <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0 }}>
        <OperatorSelect
          field={field}
          value={condition.operator}
          onChange={(op) => onOperatorChange(condition.id, op)}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
        <ValueInput
          field={field}
          operator={condition.operator}
          value={condition.value}
          onChange={(value) => onValueChange(condition.id, value)}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          alignSelf: { xs: 'flex-end', md: 'center' },
          gap: 0.5,
        }}
      >
        {incomplete && (
          <Tooltip title={`${validation.message ?? 'Incomplete'} — not applied yet`}>
            <Box sx={{ display: 'grid', placeItems: 'center', cursor: 'help' }}>
              <AlertTriangle
                size={18}
                color={theme.palette.warning.main}
                aria-label="Incomplete filter"
              />
            </Box>
          </Tooltip>
        )}
        <Tooltip title="Remove filter">
          <IconButton
            size="small"
            onClick={() => onRemove(condition.id)}
            aria-label="Remove filter"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                bgcolor: (t) => alpha(t.palette.error.main, 0.1),
              },
            }}
          >
            <Trash2 size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
