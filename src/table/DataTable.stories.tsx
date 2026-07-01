import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import type { ColumnDef } from './types';
import type { FilterCondition, FilterFieldConfig } from '../filter';

interface Emp {
  id: number;
  name: string;
  department: string;
  salary: number;
  isActive: boolean;
  skills: string[];
}

const ROWS: Emp[] = [
  { id: 1, name: 'John Smith', department: 'Engineering', salary: 95000, isActive: true, skills: ['React', 'TypeScript'] },
  { id: 2, name: 'Sarah Lee', department: 'Design', salary: 80000, isActive: false, skills: ['Figma'] },
  { id: 3, name: 'Mike Brown', department: 'Engineering', salary: 130000, isActive: true, skills: ['React', 'Go'] },
  { id: 4, name: 'Anna Jones', department: 'Sales', salary: 60000, isActive: true, skills: ['Excel'] },
  { id: 5, name: 'Diego Reyes', department: 'Engineering', salary: 110000, isActive: false, skills: ['Node.js', 'React'] },
];

const COLUMNS: ColumnDef<Emp>[] = [
  { key: 'name', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'salary', header: 'Salary', align: 'right', render: (r) => `$${r.salary.toLocaleString()}`, sortAccessor: (r) => r.salary },
  { key: 'isActive', header: 'Active' },
  { key: 'skills', header: 'Skills', sortable: false },
];

const FIELDS: FilterFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'department', label: 'Department', type: 'select' },
  { key: 'salary', label: 'Salary', type: 'amount' },
  { key: 'skills', label: 'Skills', type: 'multiSelect', isArray: true },
];

const meta: Meta<typeof DataTable<Emp>> = {
  title: 'Table/DataTable',
  component: DataTable<Emp>,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A generic, sortable, paginated table driven by `ColumnDef[]`. Pass active `conditions` + `fields` and it highlights matched text and tints cells inside matched ranges.',
      },
    },
  },
  args: { rowKey: (r: Emp) => r.id, totalCount: ROWS.length },
};
export default meta;

type Story = StoryObj<typeof DataTable<Emp>>;

export const Default: Story = {
  args: { columns: COLUMNS, rows: ROWS, title: 'Employees' },
};

export const WithHighlighting: Story = {
  name: 'With match highlighting',
  args: {
    columns: COLUMNS,
    rows: ROWS,
    totalCount: 60,
    title: 'Employees',
    fields: FIELDS,
    conditions: [
      { id: 'a', field: 'department', operator: 'is', value: 'Engineering' } as FilterCondition,
      { id: 'b', field: 'salary', operator: 'between', value: { min: 100000, max: null } } as FilterCondition,
      { id: 'c', field: 'skills', operator: 'in', value: ['React'] } as FilterCondition,
    ],
  },
};

export const Empty: Story = {
  args: { columns: COLUMNS, rows: [], totalCount: 60, title: 'Employees' },
};

export const Loading: Story = {
  args: { columns: COLUMNS, rows: ROWS, title: 'Employees', loading: true },
};
