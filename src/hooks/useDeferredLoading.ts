import { useState, useEffect } from 'react';

/**
 * Hook that defers displaying skeleton loaders until loading exceeds a given threshold (default 300ms).
 * Prevents jarring skeleton flashes for fast requests as recommended by Apple HIG.
 */
export function useDeferredLoading(isLoading: boolean, delayMs = 300): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return isLoading && showSkeleton;
}
