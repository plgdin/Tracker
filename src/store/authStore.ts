import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Role = 'admin' | 'worker';

interface Profile {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('worker_session');
    try {
      // Always clear local session even if the network call fails.
      await supabase.auth.signOut({ scope: 'local' } as any);
    } catch (e) {
      console.warn('Supabase sign out failed', e);
    }
    set({ user: null, profile: null });
  },
  initialize: async () => {
    set({ isLoading: true });

    try {
      const ensureProfile = async (user: User) => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          // If profile row doesn't exist yet, create it (allowed by policy: auth.uid() = id).
          if (!error && !profile) {
            const { data: created, error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: user.id, name: user.email?.split('@')[0] ?? null, role: 'worker' }])
              .select('*')
              .maybeSingle();
            if (!insertError && created) {
              set({ profile: created as Profile });
              return;
            }
          }

          if (!error && profile) {
            set({ profile: profile as Profile });
          } else if (error) {
            console.warn('Profile fetch failed', error);
          }
        } catch (e) {
          console.warn('Profile ensure failed', e);
        }
      };

      // 1. Check local admin session
      const isAdminSession = localStorage.getItem('admin_session') === 'true';
      if (isAdminSession) {
        const adminUser = localStorage.getItem('admin_username') || 'admin';
        set({
          user: { id: 'admin-id', email: adminUser } as any,
          profile: { id: 'admin-id', name: 'Admin', role: 'admin' },
          isLoading: false
        });
        return;
      }

      // 2. Check local worker session
      const localWorkerStr = localStorage.getItem('worker_session');
      if (localWorkerStr) {
        try {
          const worker = JSON.parse(localWorkerStr);
          set({
            user: { id: worker.id, email: worker.email } as any,
            profile: { id: worker.id, name: worker.email.split('@')[0], role: 'worker' },
            isLoading: false
          });
          return;
        } catch (e) {
          localStorage.removeItem('worker_session');
        }
      }
      
      // 3. Check Supabase session if available.
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user });
        
        await ensureProfile(session.user);
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user });
          await ensureProfile(session.user);
        } else {
          set({ user: null, profile: null });
        }
      });
    } catch (e) {
      console.warn('Auth initialization failed; local login is still available', e);
    } finally {
      set({ isLoading: false });
    }
  }
}));
