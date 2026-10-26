import { useState, useEffect, useRef, useCallback } from 'react';

// In-memory cache for fast instant retrieval across component mounts
const memoryCache = new Map<string, { data: any; timestamp: number }>();

interface SWROptions<T> {
  initialData?: T;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number; // ms
}

/**
 * Lightweight, zero-dependency Stale-While-Revalidate (SWR) hook.
 * Returns cached data immediately and refetches in the background.
 * Automatically revalidates when window regains focus or network reconnects.
 */
export function useSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: SWROptions<T> = {}
) {
  const {
    initialData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
  } = options;

  // 1. Instant cache lookup
  const cached = key ? memoryCache.get(key) : undefined;
  const [data, setData] = useState<T | undefined>(() => {
    if (cached) return cached.data as T;
    return initialData;
  });

  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const lastFetchTimeRef = useRef<number>(cached ? cached.timestamp : 0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const revalidate = useCallback(
    async (force = false) => {
      if (!key) return;

      const now = Date.now();
      if (!force && now - lastFetchTimeRef.current < dedupingInterval) {
        return;
      }

      setIsValidating(true);
      try {
        const freshData = await fetcherRef.current();
        memoryCache.set(key, { data: freshData, timestamp: now });
        lastFetchTimeRef.current = now;
        setData(freshData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsValidating(false);
      }
    },
    [key, dedupingInterval]
  );

  // Initial background fetch if stale or missing
  useEffect(() => {
    if (!key) return;

    // If cache exists, data is already populated, revalidate in background
    revalidate();
  }, [key, revalidate]);

  // Window focus & network reconnect listeners
  useEffect(() => {
    if (!key) return;

    const onFocus = () => {
      if (revalidateOnFocus) {
        revalidate();
      }
    };

    const onOnline = () => {
      if (revalidateOnReconnect) {
        revalidate(true);
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [key, revalidate, revalidateOnFocus, revalidateOnReconnect]);

  const mutate = useCallback(
    (newData: T | ((current: T | undefined) => T)) => {
      setData((current) => {
        const resolved = typeof newData === 'function' ? (newData as any)(current) : newData;
        if (key) {
          memoryCache.set(key, { data: resolved, timestamp: Date.now() });
        }
        return resolved;
      });
    },
    [key]
  );

  return {
    data: data as T,
    isValidating,
    error,
    mutate,
  };
}
