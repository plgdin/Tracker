import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { Tag, AlertCircle, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function Settings() {
  const showToast = useToastStore(state => state.showToast);
  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningDays, setWarningDays] = useState(30);

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
      showToast(`Warning period updated to ${val} days! 🔔`);
    } catch (err) {
      console.error('Failed to save settings:', err);
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
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Logged in as: <strong style={{ color: 'var(--color-text-primary)' }}>{profile.name}</strong> ({profile.role})
          </p>
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
