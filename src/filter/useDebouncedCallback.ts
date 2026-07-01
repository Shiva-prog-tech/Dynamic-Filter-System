import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `callback`. The latest callback reference is
 * always used, so it is safe to pass inline closures. Pending timers are
 * cleared on unmount. Used to debounce text-input filtering (a UX bonus that
 * also reduces re-renders while typing).
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300,
): (...args: A) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );
}
