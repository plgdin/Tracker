import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Detect if running as an installed PWA (Add to Home Screen)
const isPWA = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);

// If PWA, we forcefully wipe the localStorage cache on a fresh boot.
// This mimics sessionStorage behavior (forgetting credentials on app close) 
// without suffering from iOS's notoriously buggy standalone sessionStorage.
if (isPWA) {
  // Use a simple sessionStorage flag to detect if this is a cold start or just a page reload
  const isColdStart = !window.sessionStorage.getItem('pwa_active');
  
  if (isColdStart) {
    try {
      const keysToWipe = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToWipe.push(key);
        }
      }
      keysToWipe.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('PWA storage wipe failed', e);
    }
    window.sessionStorage.setItem('pwa_active', 'true');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isPWA ? window.localStorage : window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
