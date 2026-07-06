import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ChefHat, User, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router';

export default function StaffRegister() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const trimEmail = email.trim().toLowerCase();
    const trimPassword = password.trim();

    try {
      if (!username.trim()) {
        setError('Username is required for signup.');
        setIsSubmitting(false);
        return;
      }
      if (!trimEmail.includes('@')) {
        setError('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }
      
      // Pass role as 'pending' in metadata
      const { error } = await supabase.auth.signUp({
        email: trimEmail,
        password: trimPassword,
        options: { 
          data: { 
            full_name: username.trim(),
            role: 'pending' // Force role to pending for staff registrations
          } 
        }
      });
      
      if (error) throw error;
      
      setSuccess('✅ Request submitted! The admin will review and activate your account. You can log in once approved.');
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Could not sign up.');
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
          <p className="auth-subtitle">Staff Registration</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-form-title">Request Access</h2>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-error auth-notice">{success}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>

            <Link to="/admin" className="auth-reset" style={{ display: 'block', textAlign: 'center' }}>
              ← Back to Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
