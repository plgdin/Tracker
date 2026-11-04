import { useState, useEffect } from 'react';

export function useScroll(threshold: number = 25) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
          setScrolled((prev) => {
            // Enter scrolled state
            if (!prev && y > threshold) {
              return true;
            }
            // Return to initial full-length state with hysteresis
            if (prev && y <= Math.max(8, threshold - 15)) {
              return false;
            }
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrolled;
}
