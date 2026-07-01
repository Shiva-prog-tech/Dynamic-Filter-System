import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from './FilterPanel';
import { buildOptions } from '../utils';
import { useFacets } from '../useFacets';
import { useFilters } from '../useFilters';
import { defineFields } from '../types';

/* ------------------------------ sample data ------------------------------- */
interface Emp {
  id: number;
  name: string;
  department: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: { city: string };
}

const ROWS: Emp[] = [
  { id: 1, name: 'John Smith', department: 'Engineering', salary: 95000, joinDate: '2021-03-15', isActive: true, skills: ['React', 'TypeScript'], address: { city: 'San Francisco' } },
  { id: 2, name: 'Sarah Lee', department: 'Design', salary: 80000, joinDate: '2019-07-01', isActive: false, skills: ['Figma'], address: { city: 'New York' } },
  { id: 3, name: 'Mike Brown', department: 'Engineering', salary: 130000, joinDate: '2023-01-20', isActive: true, skills: ['React', 'Go'], address: { city: 'Austin' } },
  { id: 4, name: 'Anna Jones', department: 'Sales', salary: 60000, joinDate: '2024-11-10', isActive: true, skills: ['Excel'], address: { city: 'New York' } },
  { id: 5, name: 'Diego Reyes', department: 'Engineering', salary: 110000, joinDate: '2022-05-05', isActive: false, skills: ['Node.js', 'React'], address: { city: 'Berlin' } },
  { id: 6, name: 'Priya Nair', department: 'Marketing', salary: 72000, joinDate: '2020-09-12', isActive: true, skills: ['SEO'], address: { city: 'London' } },
];

const FIELDS = defineFields<Emp>([
  { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. John' },
  { key: 'department', label: 'Department', type: 'select', options: buildOptions(ROWS.map((r) => r.department)) },
  { key: 'salary', label: 'Salary', type: 'amount', currency: 'USD' },
  { key: 'joinDate', label: 'Join date', type: 'date' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'skills', label: 'Skills', type: 'multiSelect', isArray: true, options: buildOptions(ROWS.flatMap((r) => r.skills)) },
  { key: 'address.city', label: 'City', type: 'select', options: buildOptions(ROWS.map((r) => r.address.city)) },
]);

/** Wires the panel to live state + facets, exactly like the app does. */
function PanelDemo() {
  const fields = useMemo(() => FIELDS, []);
  const controller = useFilters(fields, {});
  const facets = useFacets(ROWS, controller.conditions, fields);
  return (
    <FilterPanel
      fields={fields}
      controller={controller}
      facets={facets}
      title="Employee Filters"
      description="Add conditions across types — same-field conditions OR together, different fields AND."
    />
  );
}

const meta: Meta<typeof PanelDemo> = {
  title: 'Filter/FilterPanel',
  component: PanelDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The full dynamic filter builder, driven entirely by a `FilterFieldConfig[]`. Add/remove conditions (animated), pick fields/operators, and watch faceted counts + sparklines update live.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PanelDemo>;

export const Interactive: Story = {};
