import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize, authNotice, setAuthNotice } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthNotice('');
    setIsSubmitting(true);

    const trimEmail = email.trim().toLowerCase();
    const trimPassword = password.trim();

    // 1. Check custom admin credentials
    const storedAdminUser = localStorage.getItem('admin_username');
    const storedAdminPass = localStorage.getItem('admin_password');
    const hasCustomAdmin = localStorage.getItem('admin_changed') === 'true' && !!storedAdminUser && !!storedAdminPass;
    const adminUser = hasCustomAdmin ? storedAdminUser! : 'admin';
    const adminPass = hasCustomAdmin ? storedAdminPass! : 'admin';
    const normalizedAdminUser = adminUser.toLowerCase();

    // If it has been changed, reject 'admin'/'admin'
    if (hasCustomAdmin && trimEmail === 'admin' && trimPassword === 'admin') {
      setError('Invalid admin credentials.');
      setIsSubmitting(false);
      return;
    }

    if (trimEmail === normalizedAdminUser && trimPassword === adminPass) {
      localStorage.setItem('admin_session', 'true');
      useAuthStore.getState().setUser({ id: 'admin-id', email: adminUser } as any);
      useAuthStore.getState().setProfile({ id: 'admin-id', name: 'Admin', role: 'admin' });
      setIsSubmitting(false);
      return;
    }

    // 2. Supabase Auth (login/signup)
    if (!trimEmail.includes('@')) {
      setError('Invalid username or password.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: trimEmail, password: trimPassword });
        if (error) throw error;
        setError('Sign up successful. Wait for admin approval, then log in.');
        setMode('login');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: trimEmail, password: trimPassword });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Bake N Joy</h1>
        <p className="auth-subtitle">Welcome back to your stockroom</p>

        {(authNotice || error) && <div className="auth-error">{authNotice || error}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, minHeight: 40, padding: '0.55rem 1rem', fontSize: '0.9rem' }}
            onClick={() => { setMode('login'); setError(''); setAuthNotice(''); }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, minHeight: 40, padding: '0.55rem 1rem', fontSize: '0.9rem' }}
            onClick={() => { setMode('signup'); setError(''); setAuthNotice(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <label className="input-label">Username or Email</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

      </div>
    </div>
  );
}
