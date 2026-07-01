import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

interface SparklineProps {
  /** Raw numeric values (use timestamps for dates). */
  values: number[];
  /** Selected range lower bound (inclusive); `null` = open. */
  selectionMin?: number | null;
  /** Selected range upper bound (inclusive); `null` = open. */
  selectionMax?: number | null;
  bins?: number;
  height?: number;
}

/**
 * A tiny distribution histogram drawn as inline SVG (no chart dependency).
 * Bars whose bucket overlaps the selected range are drawn in the accent colour,
 * the rest muted — turning blind range-typing into faceted search: you can *see*
 * where the data lives and what your range captures.
 */
export function Sparkline({
  values,
  selectionMin,
  selectionMax,
  bins = 32,
  height = 40,
}: SparklineProps) {
  const theme = useTheme();

  // Guard against a caller passing bins <= 0 (would make width Infinity → NaN).
  const binCount = Number.isFinite(bins) && bins > 0 ? Math.floor(bins) : 32;

  const { bars, hasData } = useMemo(() => {
    if (values.length === 0) return { bars: [] as { h: number; active: boolean }[], hasData: false };

    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      // Single distinct value — widen slightly so it renders a centred bar.
      min -= 0.5;
      max += 0.5;
    }
    const width = (max - min) / binCount;
    const counts = new Array(binCount).fill(0) as number[];
    for (const v of values) {
      const idx = Math.min(binCount - 1, Math.max(0, Math.floor((v - min) / width)));
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    const peak = Math.max(...counts, 1);

    const lo = selectionMin ?? -Infinity;
    const hi = selectionMax ?? Infinity;

    const result = counts.map((count, i) => {
      const binStart = min + i * width;
      const binEnd = binStart + width;
      const active = binEnd >= lo && binStart <= hi; // bucket overlaps selection
      return { h: count / peak, active };
    });
    return { bars: result, hasData: true };
  }, [values, selectionMin, selectionMax, binCount]);

  if (!hasData) return null;

  const activeColor = theme.palette.primary.main;
  const idleColor = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.18 : 0.14);
  const gap = 0.12;

  return (
    <Box sx={{ width: '100%', height, mb: 0.5 }} aria-hidden>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${binCount} 100`}
        preserveAspectRatio="none"
        role="presentation"
      >
        {bars.map((b, i) => {
          const barH = Math.max(b.h * 100, b.h > 0 ? 3 : 0); // floor so tiny counts stay visible
          return (
            <rect
              key={i}
              x={i + gap}
              y={100 - barH}
              width={1 - gap * 2}
              height={barH}
              rx={0.3}
              fill={b.active ? activeColor : idleColor}
            />
          );
        })}
      </svg>
    </Box>
  );
}
