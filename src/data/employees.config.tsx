/**
 * Configuration for the **Employees** table. This is the only place employee
 * specifics live — the filter system and table consume it without modification.
 *
 * Filter fields are produced by a factory that derives select options from the
 * rows actually loaded from the API, so the dropdown options can never drift
 * from the data on screen (and collapse to empty while loading/on error).
 */
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { buildOptions, defineFields, formatCurrency, formatDate } from '../filter';
import type { FilterFieldConfig } from '../filter';
import type { ColumnDef } from '../table/types';
import type { Employee } from './types';

/** Builds the employee filter fields, deriving select options from `rows`. */
export function buildEmployeeFields(rows: Employee[]): FilterFieldConfig[] {
  // `defineFields<Employee>` type-checks every `key` against the Employee shape
  // (incl. nested paths like `address.city`) at compile time.
  return defineFields<Employee>([
    { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. John' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'e.g. @company.com' },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: buildOptions(rows.map((e) => e.department)),
    },
    { key: 'role', label: 'Role', type: 'select', options: buildOptions(rows.map((e) => e.role)) },
    { key: 'salary', label: 'Salary', type: 'amount', currency: 'USD' },
    { key: 'joinDate', label: 'Join Date', type: 'date' },
    { key: 'isActive', label: 'Active', type: 'boolean' },
    {
      key: 'skills',
      label: 'Skills',
      type: 'multiSelect',
      isArray: true,
      options: buildOptions(rows.flatMap((e) => e.skills)),
    },
    {
      key: 'address.city',
      label: 'City',
      type: 'select',
      options: buildOptions(rows.map((e) => e.address.city)),
    },
    {
      key: 'address.country',
      label: 'Country',
      type: 'select',
      options: buildOptions(rows.map((e) => e.address.country)),
    },
    { key: 'projects', label: 'Projects', type: 'number' },
    { key: 'lastReview', label: 'Last Review', type: 'date' },
    { key: 'performanceRating', label: 'Performance Rating', type: 'number' },
  ]);
}

function ratingColor(rating: number): 'success' | 'warning' | 'error' {
  if (rating >= 4) return 'success';
  if (rating >= 3) return 'warning';
  return 'error';
}

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    key: 'name',
    header: 'Employee',
    render: (r) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {r.email}
        </Typography>
      </Box>
    ),
  },
  { key: 'department', header: 'Department' },
  { key: 'role', header: 'Role' },
  {
    key: 'salary',
    header: 'Salary',
    align: 'right',
    render: (r) => formatCurrency(r.salary, 'USD'),
    sortAccessor: (r) => r.salary,
  },
  {
    key: 'joinDate',
    header: 'Join Date',
    render: (r) => formatDate(r.joinDate),
    sortAccessor: (r) => r.joinDate,
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (r) => (
      <Chip
        size="small"
        label={r.isActive ? 'Active' : 'Inactive'}
        color={r.isActive ? 'success' : 'default'}
        variant={r.isActive ? 'filled' : 'outlined'}
      />
    ),
    sortAccessor: (r) => (r.isActive ? 1 : 0),
  },
  { key: 'skills', header: 'Skills', sortable: false },
  {
    key: 'address.city',
    header: 'Location',
    render: (r) => `${r.address.city}, ${r.address.country}`,
    sortAccessor: (r) => r.address.city,
  },
  { key: 'projects', header: 'Projects', align: 'right' },
  {
    key: 'performanceRating',
    header: 'Rating',
    align: 'right',
    render: (r) => (
      <Chip size="small" label={r.performanceRating.toFixed(1)} color={ratingColor(r.performanceRating)} />
    ),
    sortAccessor: (r) => r.performanceRating,
  },
];
