import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download, FileJson } from 'lucide-react';
import { FilterPanel, useFilteredData, useFilters } from '../filter';
import type { FilterFieldConfig } from '../filter';
import { useMockData } from '../hooks/useMockData';
import { exportToCsv, exportToJson } from '../lib/exportData';
import { DataTable } from '../table/DataTable';
import type { ColumnDef } from '../table/types';

interface DatasetViewProps<T> {
  title: string;
  description?: string;
  fetcher: () => Promise<T[]>;
  /** Builds filter fields from the loaded rows (so options reflect real data). */
  buildFields: (rows: T[]) => FilterFieldConfig[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string | number;
  /** localStorage key for filter persistence. */
  persistKey: string;
  /** Base filename for exports. */
  exportName: string;
}

/**
 * Glue component: connects the mock API, the filter state, the filtering
 * engine and the table for one dataset. It is fully generic — the two demo
 * tables differ only by the props passed in.
 */
export function DatasetView<T>({
  title,
  description,
  fetcher,
  buildFields,
  columns,
  rowKey,
  persistKey,
  exportName,
}: DatasetViewProps<T>) {
  const { data, loading, error, reload } = useMockData(fetcher);
  // Select options come from the loaded data, not a build-time import.
  const fields = useMemo(() => buildFields(data), [buildFields, data]);
  const controller = useFilters(fields, { persistKey });
  const filtered = useFilteredData(data, controller.conditions, fields);

  const toolbar = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 600 }}>
        Export
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<Download size={16} />}
        onClick={() => exportToCsv(filtered, columns, `${exportName}.csv`)}
        disabled={filtered.length === 0}
      >
        CSV
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<FileJson size={16} />}
        onClick={() => exportToJson(filtered, `${exportName}.json`)}
        disabled={filtered.length === 0}
      >
        JSON
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2.5}>
      <FilterPanel
        fields={fields}
        controller={controller}
        title={`${title} Filters`}
        description={description}
      />

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <DataTable
        title={title}
        columns={columns}
        rows={filtered}
        totalCount={data.length}
        rowKey={rowKey}
        loading={loading}
        toolbar={toolbar}
      />
    </Stack>
  );
}
