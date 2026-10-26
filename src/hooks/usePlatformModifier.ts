import { useState, useEffect } from 'react';

/**
 * Detects client OS to show correct Superhuman-style shortcut hints:
 * ⌘ on Apple platforms, Ctrl elsewhere.
 */
export function usePlatformModifier() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const isApple = /(Mac|iPhone|iPod|iPad)/i.test(
      navigator.platform || navigator.userAgent || ''
    );
    setIsMac(isApple);
  }, []);

  return {
    isMac,
    modKey: isMac ? '⌘' : 'Ctrl',
    modName: isMac ? 'Cmd' : 'Ctrl',
    altKey: isMac ? '⌥' : 'Alt',
    shiftKey: isMac ? '⇧' : 'Shift',
  };
}
