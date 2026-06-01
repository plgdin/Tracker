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
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && !profile) {
      // No profile row — create one as pending
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, name: user.email?.split('@')[0] ?? null, role: 'pending' }])
        .select('*')
        .maybeSingle();
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
    }
  } catch (e) {
    console.warn('Profile ensure failed', e);
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
    localStorage.removeItem('admin_session');
    localStorage.removeItem('worker_session');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.auth.signOut({ scope: 'local' } as any);
    } catch (e) {
      console.warn('Supabase sign out failed', e);
    }
    set({ user: null, profile: null });
  },
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, isInitialized: true });

    // Wipe ALL legacy localStorage keys
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_password');
    localStorage.removeItem('admin_changed');
    localStorage.removeItem('worker_session');

    // ─── STEP 1: Resolve the current session on page load ────────────────────
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await ensureProfile(session.user, set);
      }
    } catch (e) {
      console.warn('Auth session check failed', e);
    } finally {
      set({ isLoading: false });

      // ─── STEP 2: Register listener AFTER initial load ─────────────────────
      // Registering BEFORE getSession() causes Supabase to immediately fire the
      // current auth state as a callback, racing with getSession and keeping
      // isLoading stuck at true. Registering here in finally guarantees:
      //   • isLoading is already false before any future auth events fire
      //   • The listener is always registered (no early-returns can skip it)
      //   • Login and logout events are captured reliably going forward
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await ensureProfile(session.user, set);
        } else {
          set({ user: null, profile: null });
        }
      });
    }
  }
}));
