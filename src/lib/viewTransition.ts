/**
 * Executes a state change or navigation inside document.startViewTransition if supported.
 * Always respects prefers-reduced-motion to avoid unwanted motion sickness.
 */
export function safeStartViewTransition(updateFn: () => void | Promise<void>) {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    (document as any).startViewTransition(updateFn);
  } else {
    updateFn();
  }
}
