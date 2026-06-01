import { useEffect, useState } from 'react';
import { db, supabase } from '../lib/db';
import type { Category } from '../lib/db';
import { Plus, Trash2, Tag, Database, Cloud, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { profile, signOut } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warningDays, setWarningDays] = useState(7);

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
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    try {
      const added = await db.addCategory({
        name: newCatName.trim(),
        color: newCatColor,
        icon: 'Tag'
      });
      setCategories([...categories, added]);
      setNewCatName('');
    } catch (err) {
      console.error('Failed to add category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Prevent deleting default categories
    if (id.startsWith('cat-')) {
      alert('Default categories cannot be deleted.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const success = await db.deleteCategory(id);
        if (success) {
          setCategories(categories.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    }
  };

  const presetColors = ['#E07A5F', '#F2CC8F', '#81B29A', '#3D5A80', '#98C1D9', '#EE6C4D', '#293241', '#F4F1DE'];

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Manage your preferences and categories</p>
      </header>

      {/* Database Mode Card */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
          <Database size={20} style={{ color: 'var(--color-primary)' }} />
          Database Connection Status
        </h3>
        
        {supabase ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
            <Cloud size={20} />
            <div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Supabase Cloud Online</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>Data is synchronized with your cloud database.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)', background: 'rgba(224, 122, 95, 0.08)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
            <Database size={20} />
            <div>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Local Storage Mode (Offline)</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>No Supabase credentials found in `.env`. Data is saved locally in your browser.</p>
            </div>
          </div>
        )}
      </div>

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
          <div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              Logged in as: <strong style={{ color: 'var(--color-text-primary)' }}>{profile.name}</strong> ({profile.role})
            </p>
            <button className="btn btn-primary" style={{ background: 'var(--color-primary)' }} onClick={() => signOut()}>Log Out</button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>You are currently utilizing guest mode.</p>
            {supabase && (
              <button className="btn btn-primary" onClick={() => {
                const email = prompt('Enter your email:');
                const password = prompt('Enter your password:');
                if (email && password && supabase) {
                  supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
                    if (error) alert(error.message);
                    else window.location.reload();
                  });
                }
              }}>Sign In to Supabase</button>
            )}
          </div>
        )}
      </div>

      {/* Custom Categories Manager */}
      <div className="panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}>
          <Tag size={20} style={{ color: 'var(--color-primary)' }} />
          Product Categories
        </h3>

        {/* Categories List */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
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
                {!cat.id.startsWith('cat-') && (
                  <button 
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} style={{ borderTop: '1px solid rgba(141, 131, 126, 0.08)', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Add Custom Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Category Name</label>
              <input 
                type="text" 
                placeholder="e.g., Snacks" 
                className="input-field" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>Category Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: color, 
                      border: newCatColor === color ? '2px solid white' : 'none',
                      boxShadow: newCatColor === color ? '0 0 0 2px var(--color-primary)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease'
                    }}
                    onClick={() => setNewCatColor(color)}
                  />
                ))}
                <input 
                  type="color" 
                  style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  value={newCatColor}
                  onChange={e => setNewCatColor(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-outline" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '12px' }} disabled={saving}>
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
