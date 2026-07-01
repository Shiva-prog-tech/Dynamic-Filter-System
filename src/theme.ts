import { alpha, createTheme, type Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const PRIMARY = '#7c5cff'; // violet
const PRIMARY_2 = '#6d4bff'; // deeper violet (gradient partner)
const SECONDARY = '#22d3ee'; // cyan

/** Smooth, natural easing used across every interactive transition. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Layered, soft shadow scale — gives panels/controls real depth. */
function elevation(isDark: boolean) {
  const c = isDark ? '0,0,0' : '31,35,60';
  return {
    sm: isDark
      ? `0 1px 2px rgba(${c},0.4), 0 2px 8px rgba(${c},0.28)`
      : `0 1px 2px rgba(${c},0.06), 0 4px 12px rgba(${c},0.06)`,
    md: isDark
      ? `0 8px 24px rgba(${c},0.45), 0 2px 6px rgba(${c},0.35)`
      : `0 10px 30px rgba(${c},0.10), 0 2px 8px rgba(${c},0.06)`,
    lg: isDark
      ? `0 24px 60px rgba(${c},0.55), 0 8px 24px rgba(${c},0.4)`
      : `0 24px 60px rgba(${c},0.14), 0 8px 24px rgba(${c},0.08)`,
    glow: `0 0 0 1px ${alpha(PRIMARY, isDark ? 0.5 : 0.35)}, 0 8px 28px ${alpha(
      PRIMARY,
      isDark ? 0.35 : 0.25,
    )}`,
  };
}

/**
 * A refined, "aurora glass" Material UI theme — a violet→cyan accent system on
 * frosted-glass surfaces, layered soft shadows, generous radii, Inter/Sora
 * typography and smooth, consistent motion. Works in both light and dark modes.
 */
export function createAppTheme(mode: ThemeMode): Theme {
  const isDark = mode === 'dark';
  const shadow = elevation(isDark);

  const paperBg = isDark ? alpha('#151926', 0.72) : alpha('#ffffff', 0.8);
  const controlBg = isDark ? alpha('#ffffff', 0.03) : alpha('#1a1c25', 0.02);

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: PRIMARY, light: '#9d86ff', dark: '#5b3ed6' },
      secondary: { main: SECONDARY, dark: '#0e9bb5' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: isDark
        ? { default: '#090b11', paper: '#131722' }
        : { default: '#f4f5fb', paper: '#ffffff' },
      text: isDark
        ? { primary: '#eef0f7', secondary: '#a6abbd' }
        : { primary: '#181b25', secondary: '#5b6072' },
      divider: isDark ? alpha('#ffffff', 0.09) : alpha('#1a1c25', 0.09),
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontFamily: '"Sora", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontFamily: '"Sora", sans-serif', fontWeight: 800, letterSpacing: '-0.025em' },
      h5: { fontFamily: '"Sora", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontFamily: '"Sora", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
      caption: { letterSpacing: '0.01em' },
    },
    components: {
      /* ---------------------------------------------------------------- */
      /* Global baseline: aurora backdrop, smooth scrollbars, a11y focus.  */
      /* ---------------------------------------------------------------- */
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
          body: {
            minHeight: '100vh',
            backgroundImage: isDark
              ? 'radial-gradient(1100px 620px at 8% -10%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(900px 560px at 100% 0%, rgba(34,211,238,0.14), transparent 55%), radial-gradient(760px 620px at 60% 120%, rgba(124,92,255,0.10), transparent 60%)'
              : 'radial-gradient(1100px 620px at 8% -10%, rgba(124,92,255,0.14), transparent 60%), radial-gradient(900px 560px at 100% 0%, rgba(34,211,238,0.12), transparent 55%), radial-gradient(760px 620px at 60% 120%, rgba(124,92,255,0.08), transparent 60%)',
            backgroundAttachment: 'fixed',
          },
          '::selection': {
            backgroundColor: alpha(PRIMARY, 0.35),
            color: isDark ? '#fff' : '#111',
          },
          '::-webkit-scrollbar': { width: 11, height: 11 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(PRIMARY, isDark ? 0.35 : 0.28),
            borderRadius: 9,
            border: '2px solid transparent',
            backgroundClip: 'content-box',
            transition: `background-color 180ms ${EASE}`,
          },
          '::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(PRIMARY, isDark ? 0.6 : 0.45),
          },
          // Consistent, visible keyboard focus ring across custom controls.
          ':focus-visible': {
            outline: `2px solid ${alpha(PRIMARY, 0.7)}`,
            outlineOffset: 2,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.001ms !important',
              transitionDuration: '0.001ms !important',
            },
          },
        },
      },

      /* ------------------------------ Surfaces ------------------------- */
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: paperBg,
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#1a1c25', 0.07)}`,
            boxShadow: shadow.sm,
            transition: `box-shadow 260ms ${EASE}, border-color 260ms ${EASE}, transform 260ms ${EASE}`,
          },
        },
      },

      /* ------------------------------ Buttons -------------------------- */
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 11,
            paddingInline: 16,
            transition: `transform 200ms ${EASE}, box-shadow 200ms ${EASE}, background 200ms ${EASE}, border-color 200ms ${EASE}`,
            '&:active': { transform: 'translateY(0) scale(0.98)' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_2} 100%)`,
            boxShadow: `0 6px 18px ${alpha(PRIMARY, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${PRIMARY_2} 0%, ${PRIMARY} 100%)`,
              boxShadow: `0 10px 26px ${alpha(PRIMARY, 0.5)}`,
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: isDark ? alpha('#ffffff', 0.16) : alpha('#1a1c25', 0.16),
            '&:hover': {
              borderColor: alpha(PRIMARY, 0.6),
              backgroundColor: alpha(PRIMARY, 0.06),
              transform: 'translateY(-1px)',
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: `transform 200ms ${EASE}, background-color 200ms ${EASE}, color 200ms ${EASE}`,
            '&:hover': { transform: 'translateY(-1px)' },
          },
        },
      },

      /* --------------------------- Toggle pills ------------------------ */
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: controlBg,
            borderRadius: 14,
            padding: 4,
            gap: 4,
            border: `1px solid ${isDark ? alpha('#ffffff', 0.07) : alpha('#1a1c25', 0.07)}`,
            backdropFilter: 'blur(8px)',
          },
          grouped: {
            border: '0 !important',
            borderRadius: '10px !important',
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: 0,
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            color: isDark ? alpha('#eef0f7', 0.72) : alpha('#181b25', 0.7),
            transition: `all 220ms ${EASE}`,
            '&:hover': { backgroundColor: alpha(PRIMARY, 0.1) },
            '&.Mui-selected': {
              color: '#fff',
              background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_2})`,
              boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${PRIMARY_2}, ${PRIMARY})`,
              },
            },
          },
        },
      },

      /* ------------------------------ Inputs --------------------------- */
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 11,
            backgroundColor: controlBg,
            transition: `box-shadow 200ms ${EASE}, background-color 200ms ${EASE}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? alpha('#ffffff', 0.12) : alpha('#1a1c25', 0.14),
              transition: `border-color 200ms ${EASE}`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(PRIMARY, 0.5),
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? alpha('#ffffff', 0.05) : '#fff',
              boxShadow: `0 0 0 4px ${alpha(PRIMARY, 0.16)}`,
            },
          },
        },
      },

      /* ------------------------------ Chips ---------------------------- */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            fontWeight: 600,
            transition: `all 180ms ${EASE}`,
          },
          deleteIcon: { transition: `color 160ms ${EASE}` },
        },
      },

      /* --------------------------- Data table -------------------------- */
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isDark ? alpha('#181d2b', 0.96) : alpha('#eef0f8', 0.96),
            backdropFilter: 'blur(8px)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            fontSize: 11.5,
            color: isDark ? alpha('#eef0f7', 0.8) : alpha('#181b25', 0.72),
          },
          root: {
            borderColor: isDark ? alpha('#ffffff', 0.06) : alpha('#1a1c25', 0.07),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color 160ms ${EASE}`,
            '&:hover': {
              backgroundColor: `${alpha(PRIMARY, isDark ? 0.08 : 0.05)} !important`,
            },
          },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            transition: `color 160ms ${EASE}`,
            '&:hover': { color: PRIMARY },
          },
        },
      },

      /* ------------------------ Menus / tooltips ----------------------- */
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 12, boxShadow: shadow.lg, marginTop: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginInline: 4,
            transition: `background-color 140ms ${EASE}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            backgroundColor: isDark ? alpha('#0b0d14', 0.94) : alpha('#181b25', 0.94),
            backdropFilter: 'blur(6px)',
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 10px',
            boxShadow: shadow.md,
          },
          arrow: { color: isDark ? alpha('#0b0d14', 0.94) : alpha('#181b25', 0.94) },
        },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
    },
  });

  return theme;
}
