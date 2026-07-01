import type { Preview } from '@storybook/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createAppTheme } from '../src/theme';

/**
 * Every story renders inside the real app theme + MUI date-picker localization,
 * with a toolbar toggle to preview light/dark — so the catalog reflects exactly
 * what ships.
 */
const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  globalTypes: {
    mode: {
      description: 'Theme mode',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const mode = ctx.globals.mode === 'light' ? 'light' : 'dark';
      const theme = createAppTheme(mode);
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div style={{ maxWidth: 960 }}>
              <Story />
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
