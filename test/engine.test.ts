/**
 * Correctness tests for the pure filtering engine.
 * Run with:  npm test   (tsx test/engine.test.ts)
 *
 * These assert the required operators across every field type plus the
 * AND-across-fields / OR-within-field combination semantics and edge cases.
 */
import assert from 'node:assert/strict';
import { applyFilters, buildFieldMap } from '../src/filter/engine';
import type { FilterCondition, FilterFieldConfig } from '../src/filter/types';

/* ----------------------------- test harness ------------------------------ */
let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* --------------------------------- data ----------------------------------- */
interface Row {
  id: number;
  name: string;
  dept: string;
  salary: number;
  projects: number;
  active: boolean;
  skills: string[];
  joinDate: string;
  address: { city: string };
}

const rows: Row[] = [
  { id: 1, name: 'John Smith', dept: 'Engineering', salary: 95000, projects: 3, active: true, skills: ['React', 'Node.js'], joinDate: '2021-03-15', address: { city: 'San Francisco' } },
  { id: 2, name: 'Sarah Lee', dept: 'Design', salary: 80000, projects: 5, active: false, skills: ['Figma'], joinDate: '2019-07-01', address: { city: 'New York' } },
  { id: 3, name: 'Mike Brown', dept: 'Engineering', salary: 130000, projects: 1, active: true, skills: ['React', 'TypeScript', 'AWS'], joinDate: '2023-01-20', address: { city: 'Austin' } },
  { id: 4, name: 'Anna Jones', dept: 'Sales', salary: 60000, projects: 3, active: true, skills: [], joinDate: '2024-11-10', address: { city: 'New York' } },
  { id: 5, name: 'JOHN doe', dept: 'Engineering', salary: 110000, projects: 8, active: false, skills: ['Go'], joinDate: isoDaysAgo(5), address: { city: 'Berlin' } },
];

const fields: FilterFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'dept', label: 'Dept', type: 'select', options: [] },
  { key: 'salary', label: 'Salary', type: 'amount', currency: 'USD' },
  { key: 'projects', label: 'Projects', type: 'number' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'skills', label: 'Skills', type: 'multiSelect', isArray: true, options: [] },
  { key: 'joinDate', label: 'Join Date', type: 'date' },
  { key: 'address.city', label: 'City', type: 'select', options: [] },
];
const fieldMap = buildFieldMap(fields);

let counter = 0;
const cond = (field: string, operator: string, value: unknown): FilterCondition => ({
  id: `c${counter++}`,
  field,
  operator: operator as FilterCondition['operator'],
  value: value as FilterCondition['value'],
});

const run = (conditions: FilterCondition[]) => applyFilters(rows, conditions, fieldMap);
const ids = (result: Row[]) => result.map((r) => r.id).sort((a, b) => a - b);

/* --------------------------------- TEXT ----------------------------------- */
console.log('\nText operators');
test('contains is case-insensitive', () => {
  assert.deepEqual(ids(run([cond('name', 'contains', 'john')])), [1, 5]);
});
test('equals (case-insensitive, full match)', () => {
  assert.deepEqual(ids(run([cond('name', 'equals', 'john smith')])), [1]);
});
test('startsWith', () => {
  assert.deepEqual(ids(run([cond('name', 'startsWith', 'an')])), [4]);
});
test('endsWith', () => {
  assert.deepEqual(ids(run([cond('name', 'endsWith', 'brown')])), [3]);
});
test('doesNotContain', () => {
  assert.deepEqual(ids(run([cond('name', 'doesNotContain', 'john')])), [2, 3, 4]);
});

/* -------------------------------- NUMBER ---------------------------------- */
console.log('\nNumber / amount operators');
test('amount between (min & max)', () => {
  assert.deepEqual(ids(run([cond('salary', 'between', { min: 80000, max: 110000 })])), [1, 2, 5]);
});
test('amount between (min only)', () => {
  assert.deepEqual(ids(run([cond('salary', 'between', { min: 100000, max: null })])), [3, 5]);
});
test('amount between (max only)', () => {
  assert.deepEqual(ids(run([cond('salary', 'between', { min: null, max: 80000 })])), [2, 4]);
});

/* ---------------------------- NUMBER (discrete) --------------------------- */
// projects by id → 1:3, 2:5, 3:1, 4:3, 5:8
console.log('\nNumber discrete operators');
test('number eq', () => {
  assert.deepEqual(ids(run([cond('projects', 'eq', 3)])), [1, 4]);
});
test('number neq', () => {
  assert.deepEqual(ids(run([cond('projects', 'neq', 3)])), [2, 3, 5]);
});
test('number gt', () => {
  assert.deepEqual(ids(run([cond('projects', 'gt', 3)])), [2, 5]);
});
test('number gte', () => {
  assert.deepEqual(ids(run([cond('projects', 'gte', 3)])), [1, 2, 4, 5]);
});
test('number lt', () => {
  assert.deepEqual(ids(run([cond('projects', 'lt', 3)])), [3]);
});
test('number lte', () => {
  assert.deepEqual(ids(run([cond('projects', 'lte', 3)])), [1, 3, 4]);
});

/* --------------------------------- DATE ----------------------------------- */
console.log('\nDate operators');
test('date between', () => {
  assert.deepEqual(
    ids(run([cond('joinDate', 'between', { from: '2021-01-01', to: '2023-12-31' })])),
    [1, 3],
  );
});
test('date before (inclusive)', () => {
  assert.deepEqual(ids(run([cond('joinDate', 'before', { from: null, to: '2020-01-01' })])), [2]);
});
test('date after (inclusive)', () => {
  assert.deepEqual(ids(run([cond('joinDate', 'after', { from: '2024-01-01', to: null })])), [4, 5]);
});
test('relative last 30 days', () => {
  assert.deepEqual(ids(run([cond('joinDate', 'last30days', { from: null, to: null })])), [5]);
});

/* ------------------------------- BOOLEAN ---------------------------------- */
console.log('\nBoolean / select operators');
test('boolean is true', () => {
  assert.deepEqual(ids(run([cond('active', 'is', true)])), [1, 3, 4]);
});
test('boolean is false', () => {
  assert.deepEqual(ids(run([cond('active', 'is', false)])), [2, 5]);
});
test('select is', () => {
  assert.deepEqual(ids(run([cond('dept', 'is', 'Engineering')])), [1, 3, 5]);
});
test('select isNot', () => {
  assert.deepEqual(ids(run([cond('dept', 'isNot', 'Engineering')])), [2, 4]);
});

/* ----------------------------- MULTI-SELECT ------------------------------- */
console.log('\nMulti-select / array operators');
test('multiSelect in (contains any) on array field', () => {
  assert.deepEqual(ids(run([cond('skills', 'in', ['React', 'Go'])])), [1, 3, 5]);
});
test('multiSelect notIn (contains none)', () => {
  assert.deepEqual(ids(run([cond('skills', 'notIn', ['React'])])), [2, 4, 5]);
});
test('multiSelect containsAll', () => {
  assert.deepEqual(ids(run([cond('skills', 'containsAll', ['React', 'TypeScript'])])), [3]);
});

/* ------------------------------- NESTED ----------------------------------- */
console.log('\nNested path');
test('nested address.city select', () => {
  assert.deepEqual(ids(run([cond('address.city', 'is', 'New York')])), [2, 4]);
});

/* --------------------------- AND / OR semantics --------------------------- */
console.log('\nCombination semantics');
test('AND across different fields', () => {
  assert.deepEqual(
    ids(run([cond('dept', 'is', 'Engineering'), cond('active', 'is', true)])),
    [1, 3],
  );
});
test('OR within the same field', () => {
  assert.deepEqual(
    ids(run([cond('dept', 'is', 'Engineering'), cond('dept', 'is', 'Sales')])),
    [1, 3, 4, 5],
  );
});
test('AND + OR combined', () => {
  // (city = New York OR Berlin) AND active = false  →  ids 2, 5
  assert.deepEqual(
    ids(
      run([
        cond('address.city', 'is', 'New York'),
        cond('address.city', 'is', 'Berlin'),
        cond('active', 'is', false),
      ]),
    ),
    [2, 5],
  );
});

/* -------------------------------- EDGES ----------------------------------- */
console.log('\nEdge cases');
test('incomplete condition is ignored', () => {
  assert.deepEqual(ids(run([cond('name', 'contains', '')])), [1, 2, 3, 4, 5]);
});
test('invalid amount range (min>max) is ignored', () => {
  assert.deepEqual(ids(run([cond('salary', 'between', { min: 200000, max: 1 })])), [1, 2, 3, 4, 5]);
});
test('no conditions returns all rows', () => {
  assert.deepEqual(ids(run([])), [1, 2, 3, 4, 5]);
});
test('empty array field never matches "in"', () => {
  // row 4 has skills: [] — should be excluded from any "in" match
  assert.ok(!ids(run([cond('skills', 'in', ['React'])])).includes(4));
});
test('does not mutate input array', () => {
  const before = rows.map((r) => r.id);
  run([cond('dept', 'is', 'Engineering')]);
  assert.deepEqual(rows.map((r) => r.id), before);
});

/* -------------------------- relative date bounds -------------------------- */
console.log('\nRelative date boundaries');
const boundaryRows: Row[] = [
  { ...rows[0]!, id: 106, joinDate: isoDaysAgo(6) },
  { ...rows[0]!, id: 107, joinDate: isoDaysAgo(7) },
  { ...rows[0]!, id: 129, joinDate: isoDaysAgo(29) },
  { ...rows[0]!, id: 130, joinDate: isoDaysAgo(30) },
];
const runBoundary = (op: string) =>
  applyFilters(boundaryRows, [cond('joinDate', op, { from: null, to: null })], fieldMap)
    .map((r) => r.id)
    .sort((a, b) => a - b);
test('last7days is exactly 7 days (today-6 in, today-7 out)', () => {
  assert.deepEqual(runBoundary('last7days'), [106]);
});
test('last30days is exactly 30 days (today-29 in, today-30 out)', () => {
  assert.deepEqual(runBoundary('last30days'), [106, 107, 129]);
});

/* ----------------------- null / missing record values --------------------- */
console.log('\nNull / missing record values');
const nullRows = [
  { id: 201, active: true, dept: 'Engineering' },
  { id: 202, active: false, dept: 'Sales' },
  { id: 203 }, // missing both active and dept
] as unknown as Row[];
test('boolean "is false" excludes records missing the field', () => {
  const res = applyFilters(nullRows, [cond('active', 'is', false)], fieldMap).map((r) => r.id);
  assert.deepEqual(res, [202]); // 203 (unknown) is NOT treated as false
});
test('select "isNot" excludes records missing the field', () => {
  const res = applyFilters(nullRows, [cond('dept', 'isNot', 'Engineering')], fieldMap)
    .map((r) => r.id)
    .sort((a, b) => a - b);
  assert.deepEqual(res, [202]); // 201 excluded (is Eng), 203 excluded (unknown)
});

/* -------------------------------- summary --------------------------------- */
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
