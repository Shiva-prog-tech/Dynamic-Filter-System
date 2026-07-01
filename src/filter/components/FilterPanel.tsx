import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { TransitionGroup } from 'react-transition-group';
import { Filter, Plus, SlidersHorizontal, Trash } from 'lucide-react';
import { buildFieldMap } from '../engine';
import { describeCondition } from '../describe';
import type { FilterController } from '../useFilters';
import type { FacetMap } from '../useFacets';
import type { FilterFieldConfig } from '../types';
import { validateCondition } from '../validation';
import { FilterRow } from './FilterRow';

export interface FilterPanelProps {
  /** Column/field configuration that drives the whole panel. */
  fields: FilterFieldConfig[];
  /** The state controller returned by `useFilters`. */
  controller: FilterController;
  title?: string;
  description?: string;
  /**
   * Optional faceted-search metadata (see `useFacets`) — enables per-option
   * match counts and distribution sparklines on the inputs.
   */
  facets?: FacetMap;
}

/**
 * The dynamic filter builder. Renders a stack of {@link FilterRow}s plus the
 * add/clear controls and a live summary of the applied filters. It is purely
 * driven by `fields` + `controller`, so the same component works for any table.
 *
 * Rows and applied-filter chips animate in/out with `TransitionGroup` + MUI
 * `Collapse` for a smooth, "list mutates gracefully" feel.
 */
export function FilterPanel({
  fields,
  controller,
  title = 'Filters',
  description,
  facets,
}: FilterPanelProps) {
  const {
    conditions,
    addCondition,
    updateField,
    updateOperator,
    updateValue,
    removeCondition,
    clearAll,
  } = controller;

  const fieldMap = useMemo(() => buildFieldMap(fields), [fields]);

  const activeCount = useMemo(
    () =>
      conditions.filter((c) => validateCondition(c, fieldMap[c.field]).complete)
        .length,
    [conditions, fieldMap],
  );

  // Connector labels mirror the engine: a field that already appeared earlier
  // is OR-ed (regardless of row order); a new field is AND-ed.
  const connectors = useMemo(() => {
    const seen = new Set<string>();
    return conditions.map((c, i) => {
      const connector = i === 0 ? null : seen.has(c.field) ? 'OR' : 'AND';
      seen.add(c.field);
      return connector;
    });
  }, [conditions]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.75 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        // Subtle gradient hairline along the top edge — a premium accent.
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: 3,
          background: (t) =>
            `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
          opacity: 0.9,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: description ? 0.5 : 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              boxShadow: (t) => `0 8px 20px ${alpha(t.palette.primary.main, 0.45)}`,
            }}
          >
            <SlidersHorizontal size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
              {title}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: activeCount > 0 ? 'primary.main' : 'text.disabled',
                  boxShadow: (t) =>
                    activeCount > 0 ? `0 0 0 3px ${alpha(t.palette.primary.main, 0.2)}` : 'none',
                  transition: 'all 200ms ease',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {activeCount === 0
                  ? 'No active filters'
                  : `${activeCount} active filter${activeCount > 1 ? 's' : ''}`}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => addCondition()}
            disabled={fields.length === 0}
          >
            Add filter
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Trash size={16} />}
            onClick={clearAll}
            disabled={conditions.length === 0}
          >
            Clear all
          </Button>
        </Stack>
      </Box>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      {/* Body */}
      {conditions.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: 'auto',
              mb: 1.5,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            }}
          >
            <Filter size={22} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            No filters yet. Click <strong>Add filter</strong> to narrow down the data.
          </Typography>
        </Box>
      ) : (
        <TransitionGroup>
          {conditions.map((condition, index) => {
            const connector = connectors[index];
            return (
              <Collapse key={condition.id} timeout={280}>
                <Box sx={{ mb: 1.25 }}>
                  {connector && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.75 }}>
                      <Chip
                        label={connector}
                        size="small"
                        color={connector === 'OR' ? 'secondary' : 'primary'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                      />
                      <Divider sx={{ flex: 1 }} />
                    </Box>
                  )}
                  <FilterRow
                    condition={condition}
                    fields={fields}
                    fieldMap={fieldMap}
                    facet={facets?.[condition.field]}
                    onFieldChange={updateField}
                    onOperatorChange={updateOperator}
                    onValueChange={updateValue}
                    onRemove={removeCondition}
                  />
                </Box>
              </Collapse>
            );
          })}
        </TransitionGroup>
      )}

      {/* Active filter summary */}
      <Collapse in={activeCount > 0} timeout={280}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 600 }}>
            Applied:
          </Typography>
          <TransitionGroup style={{ display: 'contents' }}>
            {conditions.map((c) => {
              const field = fieldMap[c.field];
              if (!field || !validateCondition(c, field).complete) return null;
              return (
                <Collapse key={c.id} orientation="horizontal" timeout={240}>
                  <Chip
                    label={describeCondition(c, field)}
                    size="small"
                    onDelete={() => removeCondition(c.id)}
                    sx={{
                      maxWidth: '100%',
                      color: 'primary.main',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      border: '1px solid',
                      borderColor: (t) => alpha(t.palette.primary.main, 0.28),
                      '& .MuiChip-deleteIcon': {
                        color: (t) => alpha(t.palette.primary.main, 0.6),
                        '&:hover': { color: 'primary.main' },
                      },
                    }}
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1.5 }}
        >
          Conditions on the same field are combined with <strong>OR</strong>; different
          fields with <strong>AND</strong>.
        </Typography>
      </Collapse>
    </Paper>
  );
}
