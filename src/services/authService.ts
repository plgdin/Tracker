import type { DemoUser } from '../types/ecommerce';
import { supabase } from '../lib/supabase';

const DEMO_USER_KEY = 'bnj_demo_session';

export const DEMO_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'Demo@123',
};

export const authService = {
  getSession(): DemoUser | null {
    try {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<DemoUser> {
    const cleanEmail = email.trim().toLowerCase();

    // Try Supabase Auth
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          let role: 'admin' | 'customer' = 'admin';
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, name')
              .eq('id', data.user.id)
              .single();

            if (profile?.role === 'admin' || profile?.role === 'worker') {
              role = 'admin';
            }
          } catch {
            // Profile fallback
          }

          const user: DemoUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.full_name || 'Admin User',
            role,
          };
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
          return user;
        }
      } catch (e) {
        console.warn('Supabase auth signIn error, fallback to demo:', e);
      }
    }

    // Demo credentials fallback
    if (cleanEmail === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password) {
      const user: DemoUser = {
        id: 'usr-admin-demo',
        email: cleanEmail,
        name: 'Store Manager',
        role: 'admin',
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
      return user;
    }

    throw new Error('Invalid credentials. Please verify your email and password, or use admin@demo.com and Demo@123');
  },

  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(DEMO_USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};
