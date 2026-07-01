/**
 * Mock API layer.
 *
 * The assessment suggests the `mock-json-api` npm package, but that library is
 * an Express/Node server (it depends on `express` + `dummy-json`) and cannot
 * run in a statically-deployed browser SPA. To honour the same intent — "mock
 * the API from JSON data" — this module simulates a REST endpoint entirely on
 * the client: it loads the local JSON, adds realistic network latency, and
 * returns a Promise, so the UI exercises real loading/error states.
 */
import employeesJson from '../data/employees.json';
import transactionsJson from '../data/transactions.json';
import type { Employee, Transaction } from '../data/types';

const employees = employeesJson as Employee[];
const transactions = transactionsJson as Transaction[];

const LATENCY_MS = 550;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** GET /api/employees */
export function fetchEmployees(): Promise<Employee[]> {
  if (!Array.isArray(employees)) {
    return Promise.reject(new Error('Failed to load employees dataset'));
  }
  return delay(employees);
}

/** GET /api/transactions */
export function fetchTransactions(): Promise<Transaction[]> {
  if (!Array.isArray(transactions)) {
    return Promise.reject(new Error('Failed to load transactions dataset'));
  }
  return delay(transactions);
}
