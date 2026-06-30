import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Role = 'admin' | 'worker' | 'pending' | 'disabled';

interface Profile {
  id: string;
  name: string;
  email?: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  authNotice: string;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthNotice: (notice: string) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  isInitialized: boolean;
}

const ensureProfile = async (user: User, set: (s: Partial<AuthState>) => void) => {
  const withTimeout = <T,>(p: PromiseLike<T>, ms: number): Promise<T> =>
    Promise.race([Promise.resolve(p), new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))]);

  try {
    const { data: profile, error } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      5000
    );

    if (!error && !profile) {
      // No profile row — create one as pending
      const { data: created, error: insertError } = await withTimeout(
        supabase.from('profiles').insert([{ id: user.id, name: user.email?.split('@')[0] ?? null, role: 'pending' }]).select('*').maybeSingle(),
        5000
      );
      if (!insertError && created) {
        set({ authNotice: '⏳ Your access request has been submitted. Please wait for the admin to approve your account before logging in.' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.auth.signOut({ scope: 'local' } as any);
        set({ user: null, profile: null });
      } else {
        console.warn('Profile insert failed', insertError);
        set({ authNotice: '⏳ Your request is pending. The admin has not approved your account yet. Please try again later.' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.auth.signOut({ scope: 'local' } as any);
        set({ user: null, profile: null });
      }
      return;
    }

    if (!error && profile) {
      const prof = profile as Profile;
      if (prof.role === 'pending') {
        set({ authNotice: '⏳ Your access request is pending. The admin has not approved your account yet.' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.auth.signOut({ scope: 'local' } as any);
        set({ user: null, profile: null });
        return;
      }
      if (prof.role === 'disabled') {
        set({ authNotice: '🚫 Your access has been disabled. Please contact the admin.' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.auth.signOut({ scope: 'local' } as any);
        set({ user: null, profile: null });
        return;
      }
      set({ user, profile: prof });
    } else if (error) {
      console.warn('Profile fetch failed', error);
      // Fallback profile if offline or RLS fails
      set({ user, profile: { id: user.id, name: user.email?.split('@')[0] || 'User', role: 'admin' } });
    }
  } catch (e) {
    console.warn('Profile ensure failed', e);
    // Fallback profile if offline
    set({ user, profile: { id: user.id, name: user.email?.split('@')[0] || 'User', role: 'admin' } });
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  authNotice: '',
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthNotice: (authNotice) => set({ authNotice }),
  signOut: async () => {
    // 1. Wipe our own session storage
    localStorage.removeItem('admin_session');
    localStorage.removeItem('worker_session');

    // 2. Wipe Supabase's local storage and session storage keys directly to ensure no session persistence
    const wipeStorage = (storage: Storage) => {
      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
            storage.removeItem(key);
            i--;
          }
        }
      } catch (e) {
        console.warn('Storage wipe failed', e);
      }
    };
    wipeStorage(localStorage);
    wipeStorage(sessionStorage);

    // 3. Update Zustand store state IMMEDIATELY so the UI responds instantly
    set({ user: null, profile: null });

    // 4. Trigger Supabase API sign out in the background without blocking the UI
    try {
      supabase.auth.signOut({ scope: 'local' } as any).catch(err => {
        console.warn('Supabase auth.signOut background call failed:', err);
      });
    } catch (e) {
      console.warn('Supabase sign out call failed', e);
    }
  },
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, isInitialized: true });

    // Wipe ALL legacy localStorage keys safely (can throw in strict PWA environments)
    try {
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_username');
      localStorage.removeItem('admin_password');
      localStorage.removeItem('admin_changed');
      localStorage.removeItem('worker_session');
    } catch (e) {
      console.warn('Could not clear legacy localStorage:', e);
    }

    // ─── STEP 1: Resolve the current session on page load ────────────────────
    try {
      const sessionPromise = supabase.auth.getSession().then(({ data }) => data.session);
      const session = await Promise.race([
        sessionPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
      ]);
      if (session?.user) {
        set({ user: session.user });
        await ensureProfile(session.user, set);
      }
    } catch (e) {
      console.warn('Auth session check failed', e);
    } finally {
      set({ isLoading: false });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user });
          await ensureProfile(session.user, set);
        } else {
          set({ user: null, profile: null });
        }
      });
    }
  }
}));
