import { useCallback, useEffect, useRef, useState } from 'react';

interface MockDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Generic data-loading hook over the mock API. Tracks loading/error state and
 * exposes a `reload`. The `fetcher` must be a stable reference (e.g. a
 * module-level function) so the effect doesn't refire every render.
 */
export function useMockData<T>(fetcher: () => Promise<T[]>): MockDataState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracks the in-flight request so a new load()/reload() cancels the previous
  // one — prevents a slow earlier response from clobbering a newer one
  // (last-write-wins race) and stops post-unmount state updates.
  const cancelRef = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => {
      cancelled = true;
    };
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
