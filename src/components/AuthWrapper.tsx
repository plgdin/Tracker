import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ChefHat, User, Lock } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize, authNotice, setAuthNotice } = useAuthStore();
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

  if (user) {
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
      <div>
        <div className="auth-header">
          <div className="auth-logo-icon">
            <ChefHat size={32} strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Bake & Joy</h1>
          <p className="auth-subtitle">Admin Panel</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-form-title">Sign In</h2>

          {(authNotice || error) && (
            <div className={`auth-error${authNotice ? ' auth-notice' : ''}`}>{authNotice || error}</div>
          )}

        {/* Mode tabs removed to match design exactly */}

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

        {/* ── LOGIN FORM ──────────────────────────────────── */}
        {mode !== 'forgot' && (
          <form onSubmit={handleAuth} className="auth-form">
            <div className="input-group">
              <label className="input-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type={mode === 'signup' ? "email" : "text"}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <button type="button" className="auth-reset" onClick={() => window.location.href = '/store'}>
              ← Back to store
            </button>
          </form>
        )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
          Default: admin / admin123
        </div>

      </div>
    </div>
  );
}
