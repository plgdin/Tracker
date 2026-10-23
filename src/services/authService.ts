import type { DemoUser } from '../types/ecommerce';

const DEMO_USER_KEY = 'bnj_demo_session';

export const DEMO_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'Demo@123',
};

export const authService = {
  /**
   * Check if an active authenticated admin session exists
   */
  getSession(): DemoUser | null {
    try {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Demo Login with validation against demo credentials.
   * 
   * Supabase Auth Integration Point:
   * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   * if (error) throw error;
   * return data.user;
   */
  async login(email: string, password: string): Promise<DemoUser> {
    // Artificial latency for authentic UI feel
    await new Promise((res) => setTimeout(res, 400));

    const cleanEmail = email.trim().toLowerCase();
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

    throw new Error('Invalid demo credentials. Use admin@demo.com and Demo@123');
  },

  /**
   * Demo Logout
   * 
   * Supabase Auth Integration Point:
   * await supabase.auth.signOut();
   */
  async logout(): Promise<void> {
    localStorage.removeItem(DEMO_USER_KEY);
  },

  /**
   * Helper to verify if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};
