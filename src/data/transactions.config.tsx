/**
 * Configuration for the **Transactions** table — a deliberately different
 * schema (currency amounts, payment methods, refund flags, tags, nested
 * merchant) that reuses the exact same filter + table components.
 *
 * Like the employees config, filter fields are built from the loaded rows so
 * select options reflect the actual data.
 */
import Chip from '@mui/material/Chip';
import { buildOptions, formatCurrency, formatDate } from '../filter';
import type { FilterFieldConfig } from '../filter';
import type { ColumnDef } from '../table/types';
import type { Transaction, TransactionStatus } from './types';

/** Builds the transaction filter fields, deriving select options from `rows`. */
export function buildTransactionFields(rows: Transaction[]): FilterFieldConfig[] {
  return [
    { key: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: 'e.g. TXN-1000' },
    { key: 'customer', label: 'Customer', type: 'select', options: buildOptions(rows.map((t) => t.customer)) },
    { key: 'amount', label: 'Amount', type: 'amount' },
    { key: 'currency', label: 'Currency', type: 'select', options: buildOptions(rows.map((t) => t.currency)) },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: buildOptions(rows.map((t) => t.paymentMethod)),
    },
    { key: 'status', label: 'Status', type: 'select', options: buildOptions(rows.map((t) => t.status)) },
    { key: 'isRefunded', label: 'Refunded', type: 'boolean' },
    { key: 'category', label: 'Category', type: 'select', options: buildOptions(rows.map((t) => t.category)) },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiSelect',
      isArray: true,
      options: buildOptions(rows.flatMap((t) => t.tags)),
    },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
    {
      key: 'merchant.name',
      label: 'Merchant',
      type: 'select',
      options: buildOptions(rows.map((t) => t.merchant.name)),
    },
    {
      key: 'merchant.city',
      label: 'Merchant City',
      type: 'select',
      options: buildOptions(rows.map((t) => t.merchant.city)),
    },
  ];
}

const STATUS_COLOR: Record<TransactionStatus, 'success' | 'warning' | 'error' | 'info'> = {
  Completed: 'success',
  Pending: 'warning',
  Failed: 'error',
  Refunded: 'info',
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  { key: 'transactionId', header: 'Txn ID' },
  { key: 'customer', header: 'Customer' },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (r) => formatCurrency(r.amount, r.currency),
    sortAccessor: (r) => r.amount,
  },
  {
    key: 'paymentMethod',
    header: 'Method',
    render: (r) => <Chip size="small" variant="outlined" label={r.paymentMethod} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />,
  },
  {
    key: 'isRefunded',
    header: 'Refunded',
    render: (r) => (
      <Chip
        size="small"
        label={r.isRefunded ? 'Yes' : 'No'}
        color={r.isRefunded ? 'warning' : 'default'}
        variant={r.isRefunded ? 'filled' : 'outlined'}
      />
    ),
    sortAccessor: (r) => (r.isRefunded ? 1 : 0),
  },
  { key: 'category', header: 'Category' },
  { key: 'tags', header: 'Tags', sortable: false },
  {
    key: 'createdAt',
    header: 'Created',
    render: (r) => formatDate(r.createdAt),
    sortAccessor: (r) => r.createdAt,
  },
  {
    key: 'merchant.name',
    header: 'Merchant',
    render: (r) => `${r.merchant.name} · ${r.merchant.city}`,
    sortAccessor: (r) => r.merchant.name,
  },
];
