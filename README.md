# Dynamic Filter Component System

A **reusable, type-safe, configuration-driven** dynamic filter system for React data tables. The same filter components and filtering engine power any table — you only change a configuration object. This repo ships **two completely different datasets** (Employees and Transactions) to prove that reusability.

Built with **React 18 · TypeScript · Vite · Material UI · Lucide icons**.

> **Live demo:** _deploy with one click (see [Deployment](#deployment)) and drop the URL here._

---

## ✨ Highlights

- **Config-driven & reusable** — describe your columns with `FilterFieldConfig[]`; the filter UI, operators, inputs, and filtering logic adapt automatically. No filter code is edited per table.
- **7 field types**, each with type-appropriate operators and inputs: `text`, `number`, `date`, `amount`, `select`, `multiSelect`, `boolean`.
- **Pure filtering engine** — side-effect-free, framework-agnostic, **38 unit tests** covering every operator + AND/OR semantics + edge cases (incl. relative-date boundaries and null/missing values).
- **Combination logic** — `AND` across different fields, `OR` within the same field (per spec).
- **Real-time filtering** with **debounced** text inputs and memoized recomputation.
- **Nested object** (`address.city`) and **array** (`skills`) filtering via dot-notation.
- **Generic sortable table** — sorting, pagination, total/filtered counts, no-results & loading states, smart cell rendering (chips for arrays/booleans, currency/date formatting).
- **Luxury responsive UI** — refined dark/light MUI theme, works on mobile and desktop.
- **Bonus:** filter persistence (localStorage), CSV/JSON export, relative date operators (`last 7/30 days`), advanced `Contains all` operator, accessibility labels, validation with inline hints.

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Type-check + production build
npm run build

# 4. Preview the production build
npm run preview

# 5. Run the filtering-engine test suite
npm test
```

Requires Node 18+ (a `.nvmrc` pins Node 20).

---

## 🧱 Architecture

The codebase is organized by **separation of concerns** — the reusable filter system, the generic table, the data/config, and the app wiring are cleanly separated.

```
src/
├── filter/                     # ⭐ The reusable filter system (UI-agnostic core + components)
│   ├── types.ts                #   All TypeScript types (FieldType, Operator, configs, values)
│   ├── operators.ts            #   Operator registry: FieldType → operators (single source of truth)
│   ├── engine.ts               #   Pure filtering engine (matchers + applyFilters)
│   ├── validation.ts           #   Condition completeness/validity logic
│   ├── utils.ts                #   getValueByPath (dot-notation), toDateKey, formatters, buildOptions
│   ├── describe.ts             #   Condition → human-readable chip label
│   ├── useFilters.ts           #   State hook (add/update/remove/clear + localStorage persistence)
│   ├── useFilteredData.ts      #   Memoized filtering hook
│   ├── useDebouncedCallback.ts #   Debounce hook for text inputs
│   ├── index.ts                #   Public API barrel
│   └── components/
│       ├── FilterPanel.tsx     #   The filter builder container
│       ├── FilterRow.tsx       #   One condition: field · operator · value · remove
│       ├── FieldSelect.tsx     #   Field dropdown
│       ├── OperatorSelect.tsx  #   Operator dropdown (driven by field type)
│       ├── ValueInput.tsx      #   Dispatcher: field type → input component
│       └── inputs/             #   One input per type (Text, Number, AmountRange,
│                               #   DateRange, Select, MultiSelect, Boolean)
├── table/                      # Generic, data-agnostic table
│   ├── DataTable.tsx           #   Sortable + paginated + counts + empty/loading states
│   ├── DefaultCell.tsx         #   Smart default cell rendering (chips, booleans, nested)
│   └── types.ts                #   ColumnDef<T>
├── data/                       # Datasets + their configurations
│   ├── employees.json          #   60 records
│   ├── transactions.json       #   60 records
│   ├── types.ts                #   Domain types (Employee, Transaction)
│   ├── employees.config.tsx    #   Employee filter fields + table columns
│   └── transactions.config.tsx #   Transaction filter fields + table columns (different schema)
├── api/mockApi.ts              # Mock async API over the JSON (latency + error handling)
├── hooks/useMockData.ts        # Generic data-loading hook (loading/error/reload)
├── lib/exportData.ts           # CSV / JSON export
├── components/DatasetView.tsx  # Glue: data + filters + table + export for one dataset
├── theme.ts                    # Luxury MUI theme (dark/light)
└── App.tsx                     # Header, dataset switcher, theme toggle
```

### Data flow

```
mockApi ──▶ useMockData ──▶ data ─┐
                                  ├─▶ useFilteredData ──▶ DataTable
useFilters ──▶ conditions ────────┘        (applyFilters)
     ▲
FilterPanel (renders FilterRow → ValueInput per field type)
```

- **`useFilters`** owns the condition list and exposes intent-named actions.
- **`useFilteredData`** memoizes `applyFilters(data, conditions, fields)`.
- **`FilterPanel`** is fully controlled by `fields` + the `useFilters` controller — that's what makes it reusable.

---

## 🔌 Using the filter system with your own table

Everything is driven by two config arrays. **No filter component is modified.**

```tsx
import { FilterPanel, useFilters, useFilteredData } from './filter';
import type { FilterFieldConfig } from './filter';
import { DataTable } from './table/DataTable';
import type { ColumnDef } from './table/types';

interface Product { id: number; name: string; price: number; inStock: boolean; }

// 1. Describe your filterable fields
const fields: FilterFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'price', label: 'Price', type: 'amount', currency: 'USD' },
  { key: 'inStock', label: 'In stock', type: 'boolean' },
];

// 2. Describe your table columns
const columns: ColumnDef<Product>[] = [
  { key: 'name', header: 'Name' },
  { key: 'price', header: 'Price', align: 'right' },
  { key: 'inStock', header: 'Stock' },
];

function ProductsTable({ products }: { products: Product[] }) {
  const filters = useFilters(fields, { persistKey: 'products.filters' });
  const filtered = useFilteredData(products, filters.conditions, fields);

  return (
    <>
      <FilterPanel fields={fields} controller={filters} title="Product filters" />
      <DataTable
        columns={columns}
        rows={filtered}
        totalCount={products.length}
        rowKey={(p) => p.id}
      />
    </>
  );
}
```

That's the entire integration. Nested fields use dot-notation (`{ key: 'address.city', ... }`), and array fields use `{ type: 'multiSelect', isArray: true }`.

---

## 🧩 Field types & operators

| Field type    | Operators                                                        | Input control                      |
| ------------- | --------------------------------------------------------------- | ---------------------------------- |
| `text`        | Contains, Equals, Starts with, Ends with, Does not contain      | Debounced text field               |
| `number`      | =, ≠, >, ≥, <, ≤                                                 | Validated number field             |
| `amount`      | Between                                                         | Min/Max with currency adornment    |
| `date`        | Between · _Before, After, Last 7/30 days_ (bonus)               | Calendar date picker(s)            |
| `select`      | Is, Is not                                                      | Single-select dropdown             |
| `multiSelect` | In (any), Not in (none) · _Contains all_ (bonus)                | Multi-select with checkboxes/chips |
| `boolean`     | Is                                                             | Toggle switch                      |

Operators are not hard-coded in components — they come from the **operator registry** in `operators.ts`, keyed by field type.

### Combination semantics

- Conditions on the **same field** → combined with **OR**.
- Conditions on **different fields** → combined with **AND**.
- **Incomplete** conditions (e.g. an empty text value, an invalid `min > max` range) are ignored so the table doesn't empty out mid-edit; they show an inline "incomplete" hint.

---

## 🧠 Extending the system

Adding a **new field type** is a localized, three-step change (the type system will guide you):

1. Add the type to `FieldType` and its operators to `OPERATORS_BY_TYPE` (`operators.ts`).
2. Add a matcher branch in `engine.ts` (`matchCondition`) and a completeness rule in `validation.ts`.
3. Add an input component under `components/inputs/` and a `case` in `ValueInput.tsx`.

---

## ⚙️ Performance & robustness

- **Memoization** — `useFilteredData` recomputes only when data/conditions/config change; the table memoizes sorting and the field-config lookup map.
- **Debounced** text filtering avoids running the engine on every keystroke.
- **O(records × conditions)** filtering with conditions grouped by field; pagination keeps the DOM small.
- **Edge cases handled** — null/missing nested values, empty arrays, invalid numbers (`NaN` never matches), invalid/empty date ranges, timezone-safe date comparisons (`toDateKey`), and unknown currency codes.
- **Loading & error states** via the mock API + `useMockData` (with retry).

---

## 🧪 Testing

`npm test` runs `test/engine.test.ts` (via `tsx`) — **38 assertions** over the pure engine:
every operator across all field types, case-insensitive text, nested-path filtering,
array `in/notIn/containsAll`, AND/OR combination, relative-date boundary precision,
null/missing record values, and edge cases (incomplete conditions, invalid ranges,
empty arrays, immutability of input).

---

## 🌐 Deployment

This is a static SPA — deploy the `dist/` folder anywhere.

- **Vercel** — import the repo; `vercel.json` is included (framework: Vite, SPA rewrites).
- **Netlify** — `netlify.toml` is included (build `npm run build`, publish `dist`, SPA redirect).

```bash
npm run build      # outputs to dist/
```

---

## 📝 Design decisions & assumptions

- **Mock API:** The brief suggests the `mock-json-api` npm package, but that library is an **Express/Node server** (it depends on `express` + `dummy-json`) and cannot run in a statically-deployed browser SPA. To honour the same intent — _"mock the API from JSON data"_ — `src/api/mockApi.ts` simulates a REST endpoint on the client: it loads the local JSON, adds network latency, and returns a Promise so the UI exercises real loading/error states. This keeps the demo deployable as a single static site.
- **Real-time vs. "Apply" button:** Filters apply in real time as they change (the modern UX), with text inputs debounced. This satisfies both _"real-time table updates"_ and _"apply filters to update displayed data."_
- **Select options are derived at runtime** from the rows the API actually returned (`buildFields(rows)`), so dropdown options can never drift from the data on screen (and collapse to empty while loading / on error).
- **Dates** are compared as timezone-safe `yyyy-MM-dd` keys to avoid the classic `new Date('2024-03-15')` UTC-midnight off-by-one bug.
- **Amount fields** support open-ended ranges (min-only or max-only).
- **Booleans start neutral** (no option selected) so an added boolean filter doesn't silently apply until the user makes a deliberate choice — consistent with how every other field type stays "incomplete" until filled.
- **Persisted filters are reconciled** with the current field config on load (conditions for removed fields are dropped; invalid operators are reset), so a stale `localStorage` schema can't feed bad values into the UI.
- **Null/missing record values** are treated as "unknown" and never match a comparison, so a record missing a field isn't accidentally returned by `is`/`isNot`/`is false`.

---

## 🛠️ Tech stack

| Concern   | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | React 18 + TypeScript (strict)                     |
| Build     | Vite 5                                             |
| UI        | Material UI v6 (+ MUI X Date Pickers)              |
| Icons     | Lucide React                                       |
| Dates     | date-fns                                            |
| Tests     | tsx + `node:assert`                                |
```
