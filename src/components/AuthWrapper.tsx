import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // 2. Check admin-created worker accounts
    let workers: any[] = [];
    try {
      workers = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
    } catch {
      localStorage.removeItem('worker_accounts');
    }
    const matchedWorker = workers.find((w: any) => w.email === trimEmail && w.password === trimPassword);
    if (matchedWorker) {
      localStorage.setItem('worker_session', JSON.stringify(matchedWorker));
      useAuthStore.getState().setUser({ id: matchedWorker.id, email: matchedWorker.email } as any);
      useAuthStore.getState().setProfile({ id: matchedWorker.id, name: matchedWorker.email.split('@')[0], role: 'worker' });
      setIsSubmitting(false);
      return;
    }

    // 3. Fallback to standard Supabase Auth
    if (!trimEmail.includes('@')) {
      setError('Invalid username or password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: trimEmail, password: trimPassword });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetLocalAdmin = () => {
    if (!confirm('Reset local admin credentials to admin/admin?')) return;
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_password');
    localStorage.removeItem('admin_changed');
    localStorage.removeItem('admin_session');
    localStorage.removeItem('worker_session');
    setEmail('admin');
    setPassword('admin');
    setError('Local admin reset. Use admin / admin to log in.');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Bake N Joy</h1>
        <p className="auth-subtitle">Welcome back to your stockroom</p>

        {error && <div className="auth-error">{error}</div>}

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

        <button type="button" className="auth-reset" onClick={resetLocalAdmin}>
          Reset local admin login
        </button>
      </div>
    </div>
  );
}
