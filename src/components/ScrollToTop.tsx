import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that whenever the route pathname changes (e.g., clicking "See All Products"
 * from the Home page), the browser viewport automatically and instantly resets
 * to the top (0, 0) so the destination page header and layout render in their proper position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

