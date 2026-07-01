import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Inbox, SearchX } from 'lucide-react';
import { buildFieldMap, buildHighlights, getValueByPath } from '../filter';
import type { FilterCondition, FilterFieldConfig, HighlightMap } from '../filter';
import { DefaultCell } from './DefaultCell';
import type { ColumnDef, SortState } from './types';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  /** Rows to display — already filtered by the caller. */
  rows: T[];
  /** Total number of records before filtering (for the "X of Y" summary). */
  totalCount: number;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  title?: string;
  /** Optional content (e.g. export buttons) rendered on the right of the header. */
  toolbar?: ReactNode;
  emptyMessage?: string;
  /**
   * Active filter conditions + field config — when supplied, matched text is
   * highlighted and cells inside a matched numeric/date range are tinted.
   */
  conditions?: FilterCondition[];
  fields?: FilterFieldConfig[];
}

/** Null-safe comparator: numbers numerically, everything else as natural strings. */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

/**
 * A generic, sortable, paginated table. It is intentionally data-type agnostic
 * — every dataset-specific detail comes through `columns`.
 */
export function DataTable<T>({
  columns,
  rows,
  totalCount,
  rowKey,
  loading = false,
  title,
  toolbar,
  emptyMessage = 'No records match your filters.',
  conditions,
  fields,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Text needles + range predicates derived from the active filters, keyed by
  // column key. Empty when the caller doesn't opt in.
  const highlights: HighlightMap = useMemo(() => {
    if (!conditions || !fields || conditions.length === 0) return {};
    return buildHighlights(conditions, buildFieldMap(fields));
  }, [conditions, fields]);

  // Reset to the first page whenever the result set changes. `rows` is a new
  // reference only when the filtered output actually changes (see
  // useFilteredData), so this also covers same-length result swaps.
  useEffect(() => {
    setPage(0);
  }, [rows]);

  const columnByKey = useMemo(() => {
    const map = new Map<string, ColumnDef<T>>();
    for (const c of columns) map.set(c.key, c);
    return map;
  }, [columns]);

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const column = columnByKey.get(sort.key);
    if (!column) return rows;
    const accessor = column.sortAccessor ?? ((row: T) => getValueByPath(row, column.key) as never);
    const factor = sort.direction === 'asc' ? 1 : -1;
    // Copy before sorting — never mutate the incoming array.
    return [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)) * factor);
  }, [rows, sort, columnByKey]);

  const safePage = Math.min(page, Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1));
  const pagedRows = useMemo(
    () => sortedRows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage),
    [sortedRows, safePage, rowsPerPage],
  );

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' }; // third click clears sort
    });
  };

  const isFiltered = rows.length !== totalCount;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
    >
      {/* Header / summary */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
          {/* Count badge: emphasises the filtered result out of the total. */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: (t) =>
                isFiltered ? alpha(t.palette.primary.main, 0.35) : 'divider',
              bgcolor: (t) =>
                isFiltered ? alpha(t.palette.primary.main, 0.1) : 'transparent',
              transition: 'all 220ms ease',
            }}
          >
            {loading ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Loading…
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, color: isFiltered ? 'primary.main' : 'text.primary' }}
                >
                  {rows.length.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isFiltered ? `of ${totalCount.toLocaleString()}` : 'records'}
                </Typography>
              </>
            )}
          </Box>
          {isFiltered && !loading && (
            <Chip
              size="small"
              label="Filtered"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                color: 'secondary.dark',
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.16),
              }}
            />
          )}
        </Stack>
        {toolbar && <Box>{toolbar}</Box>}
      </Box>

      {/* Always-mounted polite live region: announces loading + result counts. */}
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {loading
          ? 'Loading data…'
          : isFiltered
            ? `${rows.length} of ${totalCount} records match your filters.`
            : `${totalCount} records.`}
      </Box>

      <TableContainer sx={{ maxHeight: 620 }} aria-busy={loading}>
        <Table stickyHeader size="small" aria-label={title ?? 'Data table'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                const active = sort.key === col.key;
                return (
                  <TableCell
                    key={col.key}
                    align={col.align}
                    sx={{ width: col.width, whiteSpace: 'nowrap', fontWeight: 700 }}
                    sortDirection={active ? sort.direction : false}
                  >
                    {sortable ? (
                      <TableSortLabel
                        active={active}
                        direction={active ? sort.direction : 'asc'}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.header}
                      </TableSortLabel>
                    ) : (
                      col.header
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, r) => (
                <TableRow key={`skeleton-${r}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagedRows.length === 0 ? (
              <TableRow sx={{ '&:hover': { backgroundColor: 'transparent !important' } }}>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'primary.main',
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      }}
                    >
                      {isFiltered ? (
                        <SearchX size={30} strokeWidth={1.75} />
                      ) : (
                        <Inbox size={30} strokeWidth={1.75} />
                      )}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      No results
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow key={rowKey(row)} hover>
                  {columns.map((col) => {
                    const raw = getValueByPath(row, col.key);
                    const hl = highlights[col.key];
                    const tinted = hl?.inRange?.(raw) ?? false;
                    return (
                      <TableCell
                        key={col.key}
                        align={col.align}
                        sx={{
                          verticalAlign: 'top',
                          ...(tinted && {
                            bgcolor: (t) =>
                              alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.1),
                            boxShadow: (t) => `inset 2px 0 0 ${t.palette.primary.main}`,
                          }),
                        }}
                      >
                        {col.render ? (
                          col.render(row)
                        ) : (
                          <DefaultCell value={raw} needles={hl?.text} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && sortedRows.length > 0 && (
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={safePage}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        />
      )}
    </Paper>
  );
}
