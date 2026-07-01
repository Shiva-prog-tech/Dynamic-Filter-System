import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download, FileJson, Link2 } from 'lucide-react';
import { FilterPanel, useFacets, useFilteredData, useFilters } from '../filter';
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
  /** URL query parameter for deep-linkable / shareable filters. */
  urlParam: string;
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
  urlParam,
  exportName,
}: DatasetViewProps<T>) {
  const { data, loading, error, reload } = useMockData(fetcher);
  // Select options come from the loaded data, not a build-time import.
  const fields = useMemo(() => buildFields(data), [buildFields, data]);
  const controller = useFilters(fields, { persistKey, urlParam });
  const filtered = useFilteredData(data, controller.conditions, fields);
  // Faceted counts + value distributions, computed against the *other* filters.
  const facets = useFacets(data, controller.conditions, fields);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API blocked (e.g. insecure context) — fall back to a temp field.
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {
        /* give up silently */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
  };

  const toolbar = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<Link2 size={16} />}
        onClick={handleCopyLink}
      >
        Copy link
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, mr: 0.5, fontWeight: 600 }}>
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
        facets={facets}
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
        conditions={controller.conditions}
        fields={fields}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2600}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)} sx={{ borderRadius: 2 }}>
          Link copied — your filters travel with it.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
