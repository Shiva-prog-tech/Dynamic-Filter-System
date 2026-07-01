import { Fragment, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

interface HighlightTextProps {
  text: string;
  /** Case-insensitive substrings to emphasise. */
  needles?: string[];
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Renders `text`, wrapping every occurrence of any needle in a subtly tinted
 * `<mark>` — the on-screen proof of *why* a row matched the active text filter.
 * Falls back to plain text when there are no needles.
 */
export function HighlightText({ text, needles }: HighlightTextProps) {
  const terms = Array.from(new Set((needles ?? []).map((n) => n.trim()).filter(Boolean)));
  if (terms.length === 0) return <>{text}</>;

  const re = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <Box
        key={`${match.index}-${match[0]}`}
        component="mark"
        sx={{
          px: 0.25,
          borderRadius: 0.5,
          color: 'primary.main',
          fontWeight: 700,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.22),
        }}
      >
        {match[0]}
      </Box>,
    );
    last = match.index + match[0].length;
    if (match.index === re.lastIndex) re.lastIndex++; // guard against zero-length matches
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}
