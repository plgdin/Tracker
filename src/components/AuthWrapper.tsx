import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize, authNotice, setAuthNotice, profile, signOut } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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

  if (user && !profile) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading profile...</div>;
  }

  if (user) {
    const hasAccess = profile && (profile.role === 'admin' || profile.role === 'worker');
    if (!hasAccess) {
      return (
        <div className="auth-shell">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <h1 className="auth-title" style={{ color: 'var(--color-primary)' }}>Access Denied</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              You do not have permission to access the administrative area.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <a href="/" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                Go to Storefront
              </a>
              <button 
                onClick={async () => {
                  await signOut();
                  window.location.href = '/login';
                }} 
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthNotice('');
    setIsSubmitting(true);

    const trimInput = email.trim();
    const trimPassword = password.trim();

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required for signup.');
          setIsSubmitting(false);
          return;
        }
        if (!trimInput.includes('@')) {
          setError('Please enter a valid email address for signup.');
          setIsSubmitting(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: trimInput.toLowerCase(),
          password: trimPassword,
          options: { data: { full_name: username.trim() } }
        });
        if (error) throw error;
        // Show the access-request notice and switch to login tab
        setAuthNotice('✅ Request submitted! The admin will review and activate your account. Check back once approved.');
        setMode('login');
        setEmail('');
        setPassword('');
        setUsername('');
        setIsSubmitting(false);
        return;
      }

      // LOGIN: resolve username → email if no @ sign
      let loginEmail = trimInput.toLowerCase();
      if (!loginEmail.includes('@')) {
        // Look up email via RPC (runs with SECURITY DEFINER so no auth needed)
        const { data, error: rpcError } = await supabase.rpc('get_email_by_username', { username_input: trimInput });
        if (rpcError || !data) {
          setError('Invalid credentials.');
          setIsSubmitting(false);
          return;
        }
        loginEmail = data as string;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: trimPassword });
      if (error) {
        // Show friendly message for pending accounts
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid credentials.');
        } else {
          setError(error.message);
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = forgotEmail.trim().toLowerCase();
    if (!trimEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Could not send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Chef N Joy</h1>
        <p className="auth-subtitle">Welcome back to your stockroom</p>

        {(authNotice || error) && (
          <div className={`auth-error${authNotice ? ' auth-notice' : ''}`}>{authNotice || error}</div>
        )}

        {/* Mode tabs — hidden when in forgot-password mode */}
        {mode !== 'forgot' && (
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
        )}

        {/* ── FORGOT PASSWORD MODE ─────────────────────────────────── */}
        {mode === 'forgot' && (
          <>
            {forgotSent ? (
              <div className="auth-error auth-notice" style={{ marginBottom: '1rem' }}>
                ✅ Password reset email sent! Check your inbox and click the link to reset your password.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setForgotSent(false); setForgotEmail(''); }}
              className="auth-reset"
            >
              ← Back to Login
            </button>
          </>
        )}

        {/* ── LOGIN / SIGNUP FORM ──────────────────────────────────── */}
        {mode !== 'forgot' && (
          <form onSubmit={handleAuth} className="auth-form">
            <div className="input-group">
              <label className="input-label">{mode === 'signup' ? 'Email' : 'Username or Email'}</label>
              <input
                type={mode === 'signup' ? "email" : "text"}
                className="input-field"
                placeholder={mode === 'signup' ? 'Enter your email' : 'Email or Username'}
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
              {isSubmitting ? (mode === 'signup' ? 'Submitting...' : 'Logging in...') : (mode === 'signup' ? 'Request Access' : 'Log In')}
            </button>

            {/* Forgot Password link — only on login tab */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setAuthNotice(''); }}
                className="auth-reset"
              >
                Forgot your password?
              </button>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
