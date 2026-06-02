import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { Tag, AlertCircle, LogIn, Eye, EyeOff, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const showToast = useToastStore(state => state.showToast);
  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningDays, setWarningDays] = useState(30);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCats = await db.getCategories();
        setCategories(fetchedCats);

        const settings = await db.getSettings();
        setWarningDays(settings.warning_period_days);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWarningDaysChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value) || 7;
    setWarningDays(val);
    try {
      await db.saveSettings({ warning_period_days: val });
      db.addAuditLog('Updated Warning Period', `Global Setting: ${val} days`);
      showToast(`Warning period updated to ${val} days! 🔔`);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const trimUser = newUsername.trim();
    const trimPass = newPassword.trim();
    if (!trimUser && !trimPass) return;

    setIsSavingAccount(true);

    // Helper: race a promise against a timeout so it can never hang forever
    // Uses PromiseLike so Supabase query builders (which aren't full Promises) are accepted
    const withTimeout = <T,>(p: PromiseLike<T>, ms: number, msg: string): Promise<T> =>
      Promise.race([Promise.resolve(p), new Promise<T>((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);


    try {
      // ── 1. Username update ──────────────────────────────────────────────────
      if (trimUser) {
        // Check uniqueness
        const { data: existing } = await withTimeout(
          supabase.from('profiles').select('id').eq('name', trimUser).maybeSingle(),
          8000, 'Username check timed out. Please try again.'
        );
        if (existing && existing.id !== profile.id) {
          showToast('⚠️ Username already taken! Choose a different one.');
          return;
        }
        const { error: usernameErr } = await withTimeout(
          supabase.from('profiles').update({ name: trimUser }).eq('id', profile.id),
          8000, 'Username update timed out. Please try again.'
        );
        if (usernameErr) throw usernameErr;
        useAuthStore.getState().setProfile({ ...profile, name: trimUser });
        db.addAuditLog('Changed Username', trimUser, { previous_username: profile.name });
        showToast('Username updated! ✅');
      }

      // ── 2. Password update ──────────────────────────────────────────────────
      if (trimPass) {
        if (trimPass.length < 6) {
          showToast('⚠️ Password must be at least 6 characters.');
          return;
        }

        // Verify the session is still active before attempting
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          showToast('❌ Your session has expired. Please log in again.');
          return;
        }

        const { error: passErr } = await withTimeout(
          supabase.auth.updateUser({ password: trimPass }),
          12000, 'Password update timed out. Check your connection and try again.'
        );

        if (passErr) throw passErr;
        db.addAuditLog('Changed Password', profile.email || profile.name);
        showToast('Password updated! 🔐 Use your new password next time you log in.');
      }

      setNewUsername('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Something went wrong. Please try again.';
      console.error('Account update failed:', err);
      showToast(`❌ ${msg}`);
    } finally {
      setIsSavingAccount(false);
    }
  };


  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Manage your preferences and categories</p>
      </header>

      {/* Warning Notification Period Card */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
          <AlertCircle size={20} style={{ color: 'var(--color-primary)' }} />
          Warning Notification Period
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Choose how early you want to receive warnings and countdown alerts for expiring items.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="input-label" style={{ fontSize: '0.85rem' }}>Notify me before:</label>
          <select 
            className="input-field"
            value={warningDays}
            onChange={handleWarningDaysChange}
          >
            <option value={7}>7 Days (1 Week)</option>
            <option value={14}>14 Days (2 Weeks)</option>
            <option value={30}>30 Days (1 Month)</option>
            <option value={60}>60 Days (2 Months)</option>
            <option value={90}>90 Days (3 Months)</option>
          </select>
        </div>
      </div>

      {/* Account Info */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Account</h3>
        {profile ? (
          <>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              Logged in as: <strong style={{ color: 'var(--color-text-primary)' }}>{profile.name}</strong> ({profile.role})
            </p>
            {profile && (
              <form onSubmit={handleUpdateAccount} style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Update Account Details</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">New Username</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter new username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSettingsPassword ? "text" : "password"}
                        className="input-field"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button type="button" onClick={() => setShowSettingsPassword(!showSettingsPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                        {showSettingsPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }} disabled={isSavingAccount || (!newUsername.trim() && !newPassword.trim())}>
                    <Save size={16} /> {isSavingAccount ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>You are not logged in.</p>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => {
                localStorage.removeItem('admin_session');
                window.location.reload();
              }}
            >
              <LogIn size={16} /> Log in now
            </button>
          </div>
        )}
      </div>

      {/* Product Categories (read-only view) */}
      <div className="panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}>
          <Tag size={20} style={{ color: 'var(--color-primary)' }} />
          Product Categories
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading categories...</p>
          ) : (
            categories.map(cat => (
              <div 
                key={cat.id}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${cat.color}`,
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></span>
                <span style={{ fontWeight: 500 }}>{cat.name}</span>
              </div>
            ))
          )}
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', margin: 0 }}>
          {profile?.role === 'admin' ? '💡 Manage categories from the Admin Panel → Categories tab.' : '💡 Ask your admin to add or remove categories.'}
        </p>
      </div>
    </div>
  );
}
