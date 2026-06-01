import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize, authNotice, setAuthNotice } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    initialize();
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'access_denied') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Access denied. You have been logged out.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
      setIsSubmitting(true);
      const adminEmail = `${normalizedAdminUser}@example.com`;
      // Ensure password has minimum 6 characters required by Supabase auth
      const adminPassword = trimPassword.length >= 6 ? trimPassword : `${trimPassword}123456`;

      try {
        let user: User | null = null;
        const authResult = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
        
        if (authResult.error) {
          // If the user doesn't exist yet on Supabase auth, create it
          if (authResult.error.message.includes('Invalid login credentials') || authResult.error.message.includes('not found')) {
            const signUpResult = await supabase.auth.signUp({ email: adminEmail, password: adminPassword });
            if (signUpResult.error) throw signUpResult.error;
            user = signUpResult.data.user;
          } else {
            throw authResult.error;
          }
        } else {
          user = authResult.data.user;
        }

        if (user) {
          // Establish the Admin profile in Supabase database
          await supabase.from('profiles').upsert({
            id: user.id,
            name: 'Admin',
            role: 'admin',
            created_at: new Date().toISOString()
          });
          
          localStorage.setItem('admin_session', 'true');
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setProfile({ id: user.id, name: 'Admin', role: 'admin' });
        }
      } catch (err: unknown) {
        console.warn('Failed to authenticate admin on Supabase, falling back to local fallback mode', err);
        // Clean fallback to standard offline local admin if Supabase is offline/not ready
        localStorage.setItem('admin_session', 'true');
        useAuthStore.getState().setUser({ id: 'admin-id', email: adminUser } as unknown as User);
        useAuthStore.getState().setProfile({ id: 'admin-id', name: 'Admin', role: 'admin' });
      } finally {
        setIsSubmitting(false);
      }
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
        if (!username.trim()) {
          setError('Username is required for signup.');
          setIsSubmitting(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ 
          email: trimEmail, 
          password: trimPassword,
          options: { data: { full_name: username.trim() } }
        });
        if (error) throw error;
        setError('Sign up successful. Wait for admin approval, then log in.');
        setMode('login');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: trimEmail, password: trimPassword });
      if (error) throw error;
    } catch (err: unknown) {
      setError((err as Error).message || 'Could not sign in.');
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
            <label className="input-label">{mode === 'signup' ? 'Email' : 'Username or Email'}</label>
            <input
              type={mode === 'signup' ? "email" : "text"}
              className="input-field"
              placeholder={mode === 'signup' ? "Enter your email" : "Enter Username or Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={mode === 'signup'}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

      </div>
    </div>
  );
}
