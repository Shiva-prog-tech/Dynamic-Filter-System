import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ValueInput } from './ValueInput';
import { getDefaultValue } from '../operators';
import type { FieldFacet } from '../useFacets';
import type { FilterFieldConfig, FilterValue, Operator } from '../types';

/* --------------------------- sample facet data ---------------------------- */
const SALARIES = [
  60, 62, 65, 68, 70, 72, 75, 78, 80, 80, 82, 85, 88, 90, 90, 92, 95, 95, 98,
  100, 102, 105, 108, 110, 110, 112, 115, 120, 125, 130, 135, 140,
].map((k) => k * 1000);

const DATES = [
  '2019-02-10', '2019-07-01', '2020-01-15', '2020-05-20', '2020-11-03',
  '2021-03-15', '2021-08-09', '2022-01-20', '2022-06-30', '2022-12-11',
  '2023-02-01', '2023-07-19', '2023-10-05', '2024-01-15', '2024-06-22',
].map((s) => new Date(`${s}T00:00:00`).getTime());

const DEPT_OPTS = ['Engineering', 'Design', 'Sales', 'Marketing'].map((v) => ({ label: v, value: v }));
const SKILL_OPTS = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Go', 'Python'].map((v) => ({ label: v, value: v }));

/**
 * Stateful harness so each input is fully interactive inside Storybook and its
 * live value is shown — this is the "one input per field type" showcase.
 */
interface DemoProps {
  field: FilterFieldConfig;
  operator: Operator;
  facet?: FieldFacet;
}
function Demo({ field, operator, facet }: DemoProps) {
  const [value, setValue] = useState<FilterValue>(getDefaultValue(field.type));
  return (
    <Box sx={{ maxWidth: 470 }}>
      <ValueInput field={field} operator={operator} value={value} facet={facet} onChange={setValue} />
      <Typography
        variant="caption"
        color="text.secondary"
        component="pre"
        sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover', overflowX: 'auto' }}
      >
        value = {JSON.stringify(value)}
      </Typography>
    </Box>
  );
}

const meta: Meta<typeof Demo> = {
  title: 'Filter/Value inputs',
  component: Demo,
  parameters: {
    docs: {
      description: {
        component:
          'Every field type renders a type-appropriate, self-contained input via the single `ValueInput` dispatcher. `select`/`multiSelect` show faceted match counts; `amount`/`date` show a distribution sparkline with the selection highlighted.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Demo>;

export const Text: Story = {
  args: { field: { key: 'name', label: 'Name', type: 'text' }, operator: 'contains' },
};

export const NumberField: Story = {
  name: 'Number',
  args: { field: { key: 'projects', label: 'Projects', type: 'number' }, operator: 'gte' },
};

export const AmountRange: Story = {
  args: {
    field: { key: 'salary', label: 'Salary', type: 'amount', currency: 'USD' },
    operator: 'between',
    facet: { values: SALARIES, base: SALARIES.length },
  },
};

export const DateRange: Story = {
  args: {
    field: { key: 'joinDate', label: 'Join date', type: 'date' },
    operator: 'between',
    facet: { values: DATES, base: DATES.length },
  },
};

export const SingleSelect: Story = {
  args: {
    field: { key: 'department', label: 'Department', type: 'select', options: DEPT_OPTS },
    operator: 'is',
    facet: { counts: { Engineering: 23, Design: 9, Sales: 16, Marketing: 12 }, base: 60 },
  },
};

export const MultiSelect: Story = {
  args: {
    field: { key: 'skills', label: 'Skills', type: 'multiSelect', isArray: true, options: SKILL_OPTS },
    operator: 'in',
    facet: {
      counts: { React: 31, TypeScript: 24, 'Node.js': 18, GraphQL: 9, Go: 6, Python: 14 },
      base: 60,
    },
  },
};

export const BooleanToggle: Story = {
  name: 'Boolean',
  args: { field: { key: 'isActive', label: 'Active', type: 'boolean' }, operator: 'is' },
};
