import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the reset link is clicked.
    // This gives us a temporary session to call updateUser().
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (page reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatus('success');
      setMessage('Password updated! Redirecting to login…');
      // Sign out so they log in fresh with new password
      await supabase.auth.signOut({ scope: 'local' } as Parameters<typeof supabase.auth.signOut>[0]);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err: unknown) {
      setStatus('error');
      setMessage((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Bake N Joy</h1>
        <p className="auth-subtitle">Reset your password</p>

        {status === 'success' && (
          <div className="auth-error auth-notice" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
        {status === 'error' && (
          <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {message}
          </div>
        )}

        {!sessionReady ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <p>Verifying reset link…</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>If nothing happens, the link may have expired. <br />
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                Request a new one
              </button>
            </p>
          </div>
        ) : status !== 'success' ? (
          <form onSubmit={handleReset} className="auth-form">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                  autoFocus
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Set New Password'}
            </button>

            <button type="button" onClick={() => navigate('/')} className="auth-reset">
              Back to Login
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
