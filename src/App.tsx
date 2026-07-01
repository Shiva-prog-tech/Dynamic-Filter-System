import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CreditCard, Moon, Sun, Users } from 'lucide-react';
import { DatasetView } from './components/DatasetView';
import { buildEmployeeFields, employeeColumns } from './data/employees.config';
import { buildTransactionFields, transactionColumns } from './data/transactions.config';
import { fetchEmployees, fetchTransactions } from './api/mockApi';
import { readUrlParam, writeUrlParam } from './filter';
import type { Employee, Transaction } from './data/types';
import { createAppTheme, type ThemeMode } from './theme';

type Dataset = 'employees' | 'transactions';

const THEME_KEY = 'dfs.theme-mode';

export default function App() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });
  // The active dataset is part of the shareable URL, so a copied link reopens
  // the same table (with its filters).
  const [dataset, setDataset] = useState<Dataset>(() =>
    readUrlParam('ds') === 'transactions' ? 'transactions' : 'employees',
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* non-fatal */
    }
  }, [mode]);

  useEffect(() => {
    writeUrlParam('ds', dataset === 'employees' ? null : dataset);
  }, [dataset]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          {/* ---------------------------------------------------------------- */}
          {/* Hero header                                                       */}
          {/* ---------------------------------------------------------------- */}
          <Fade in timeout={600}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    // Solid fallback so the title stays visible if gradient-clip
                    // is unsupported (print, forced-colors / high-contrast).
                    color: 'text.primary',
                    fontSize: { xs: '1.9rem', sm: '2.4rem' },
                    '@supports ((-webkit-background-clip: text) or (background-clip: text))': {
                      background: (t) =>
                        `linear-gradient(120deg, ${t.palette.text.primary} 10%, ${t.palette.primary.main} 55%, ${t.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                    '@media (forced-colors: active)': {
                      background: 'none',
                      WebkitTextFillColor: 'currentColor',
                      color: 'CanvasText',
                    },
                  }}
                >
                  Dynamic Filter System
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 660 }}>
                  A reusable, type-safe, configuration-driven filter engine. The same
                  components power both tables below — only the configuration differs.
                </Typography>
              </Box>

              <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton
                  onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                  }}
                  aria-label="Toggle color mode"
                >
                  {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>

          {/* ---------------------------------------------------------------- */}
          {/* Dataset switcher                                                  */}
          {/* ---------------------------------------------------------------- */}
          <ToggleButtonGroup
            value={dataset}
            exclusive
            onChange={(_, value: Dataset | null) => value && setDataset(value)}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="employees" sx={{ px: 2.5, gap: 1 }}>
              <Users size={18} /> Employees
            </ToggleButton>
            <ToggleButton value="transactions" sx={{ px: 2.5, gap: 1 }}>
              <CreditCard size={18} /> Transactions
            </ToggleButton>
          </ToggleButtonGroup>

          {/* ---------------------------------------------------------------- */}
          {/* Active dataset — keyed so switching re-triggers the fade-in.      */}
          {/* ---------------------------------------------------------------- */}
          <Fade in key={dataset} timeout={450}>
            <Box>
              {dataset === 'employees' ? (
                <DatasetView<Employee>
                  title="Employees"
                  description="Filter by text, number, salary range, date, status, skills and nested location."
                  fetcher={fetchEmployees}
                  buildFields={buildEmployeeFields}
                  columns={employeeColumns}
                  rowKey={(r) => r.id}
                  persistKey="dfs.filters.employees"
                  urlParam="fe"
                  exportName="employees"
                />
              ) : (
                <DatasetView<Transaction>
                  title="Transactions"
                  description="A completely different schema — amounts, payment methods, refund flags, tags and nested merchant."
                  fetcher={fetchTransactions}
                  buildFields={buildTransactionFields}
                  columns={transactionColumns}
                  rowKey={(r) => r.id}
                  persistKey="dfs.filters.transactions"
                  urlParam="ft"
                  exportName="transactions"
                />
              )}
            </Box>
          </Fade>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 5, color: 'text.secondary' }}
          >
            <Typography variant="caption">
              Built with React 18 · TypeScript · Vite · Material UI — client-side
              filtering with AND across fields, OR within a field.
            </Typography>
          </Stack>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
