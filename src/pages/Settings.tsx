import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { Store, Tag, Users, Key, AlertTriangle, Eye, EyeOff, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { supabase } from '../lib/supabase';
import { supabaseEphemeral } from '../lib/supabaseEphemeral';

export default function Settings() {
  const showToast = useToastStore(state => state.showToast);
  const { profile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Store Information');

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  
  // Workers
  const [workers, setWorkers] = useState<any[]>([]);
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);

  // Security
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Store Info
  const [storeInfo, setStoreInfo] = useState({
    name: 'Bake & Joy',
    phone: '',
    whatsapp: '+1234567890',
    address: '',
    logoUrl: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCats = await db.getCategories();
        setCategories(fetchedCats);
        
        const wList = await db.getWorkers();
        const pw = await db.getPendingWorkers();
        const localWorkers = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
        const mergedWorkers = wList.map(fw => {
          const localMatch = localWorkers.find((lw: any) => lw.email === fw.email);
          return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
        });
        setWorkers(mergedWorkers);
        setPendingWorkers(pw);

        const savedStore = localStorage.getItem('store_info');
        if (savedStore) setStoreInfo(JSON.parse(savedStore));
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    }
    loadData();
  }, []);

  const refreshWorkers = async () => {
    const wList = await db.getWorkers();
    const pw = await db.getPendingWorkers();
    const localWorkers = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
    const mergedWorkers = wList.map(fw => {
      const localMatch = localWorkers.find((lw: any) => lw.email === fw.email);
      return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
    });
    setWorkers(mergedWorkers);
    setPendingWorkers(pw);
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('store_info', JSON.stringify(storeInfo));
    showToast('Store information saved!');
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await db.addCategory({ name: newCatName.trim(), color: '#9CA3AF', icon: 'Tag', image_url: newCatImage.trim() || undefined });
    await db.addAuditLog('Added Category', newCatName.trim());
    setNewCatName('');
    setNewCatImage('');
    setCategories(await db.getCategories());
    showToast('Category added!');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await db.deleteCategory(id);
    await db.addAuditLog('Deleted Category', name);
    setCategories(await db.getCategories());
    showToast('Category deleted!');
  };

  // Worker Actions
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = workerEmail.trim().toLowerCase(), pw = workerPassword.trim();
    if (!em.includes('@') || pw.length < 4) { alert('Invalid email or password (<4 chars)'); return; }
    
    try {
      const { data: signUpData, error } = await supabaseEphemeral.auth.signUp({ 
        email: em, password: pw, options: { data: { full_name: em.split('@')[0], is_admin_created: true } }
      });
      if (error && !error.message.toLowerCase().includes('already registered')) { alert(error.message); return; }
      if (signUpData?.user?.id) await db.approveWorker(signUpData.user.id);
    } catch (err) { alert('Failed to create worker'); return; }

    const w = { id: 'w-'+Math.random().toString(36).substr(2,9), email: em, password: pw, permissions: {}, created_at: new Date().toISOString() };
    const up = [...workers, w]; setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    await db.addAuditLog('Added Worker', em);
    setWorkerEmail(''); setWorkerPassword('');
    showToast('Worker added!');
    refreshWorkers();
  };

  const handleRemoveWorker = async (id: string, email: string) => {
    if (!confirm(`Delete worker ${email}?`)) return;
    await db.rejectWorker(id);
    const up = workers.filter((w) => w.id !== id); setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    db.addAuditLog('Removed Worker', email);
    showToast('Worker removed!');
    refreshWorkers();
  };

  const handleApprovePending = async (id: string, email: string) => {
    await db.approveWorker(id);
    showToast(`Worker ${email} approved!`);
    refreshWorkers();
  };

  const handleRejectPending = async (id: string, email: string) => {
    await db.rejectWorker(id);
    showToast(`Worker ${email} rejected!`);
    refreshWorkers();
  };

  // Security Actions
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const trimUser = newUsername.trim();
    const trimPass = newPassword.trim();
    if (!trimUser && !trimPass) return;
    setIsSavingAccount(true);
    try {
      if (trimUser) {
        await supabase.from('profiles').update({ name: trimUser }).eq('id', profile.id);
        useAuthStore.getState().setProfile({ ...profile, name: trimUser });
      }
      if (trimPass) {
        await supabase.auth.updateUser({ password: trimPass });
      }
      showToast('Credentials updated! Re-login required... 🔑');
      setTimeout(() => signOut().then(() => window.location.href = '/'), 1500);
    } catch (err: unknown) {
      showToast(`❌ Update failed`);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const tabs = ['Store Information', 'Categories', 'Workers', 'Security'];

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">Manage store information and team access</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(f => (
          <button
            key={f}
            onClick={() => setActiveTab(f)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: activeTab === f ? 'var(--color-primary)' : 'white',
              color: activeTab === f ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === f ? '0 4px 10px rgba(199, 92, 65, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel" style={{ padding: '2rem' }}>
        
        {/* STORE INFO TAB */}
        {activeTab === 'Store Information' && (
          <form onSubmit={handleSaveStoreInfo}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Store Name</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                  value={storeInfo.name} onChange={e => setStoreInfo({...storeInfo, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Store Phone</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                  value={storeInfo.phone} onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>WhatsApp Number (for orders)</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                  value={storeInfo.whatsapp} onChange={e => setStoreInfo({...storeInfo, whatsapp: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Logo URL</label>
                <input type="url" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                  value={storeInfo.logoUrl} onChange={e => setStoreInfo({...storeInfo, logoUrl: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Store Address</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                  value={storeInfo.address} onChange={e => setStoreInfo({...storeInfo, address: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #EFEBE8', paddingTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>Save Changes</button>
            </div>
          </form>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'Categories' && (
          <div>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Category Name</label>
                <input type="text" className="input-field" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Image URL</label>
                <input type="url" className="input-field" value={newCatImage} onChange={e => setNewCatImage(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', height: '42px' }}>Add Category</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '8px', border: '1px solid #EFEBE8' }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === 'Workers' && (
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Pending Requests ({pendingWorkers.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {pendingWorkers.map(pw => (
                <div key={pw.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #EFEBE8', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{pw.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{pw.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => handleApprovePending(pw.id, pw.email)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Approve</button>
                    <button onClick={() => handleRejectPending(pw.id, pw.email)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active Workers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {workers.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #EFEBE8', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{w.name || w.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Password: {w.password}</div>
                  </div>
                  <button onClick={() => handleRemoveWorker(w.id, w.email)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add Worker Manually</h3>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Email</label>
                <input type="email" className="input-field" value={workerEmail} onChange={e => setWorkerEmail(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Password</label>
                <input type="text" className="input-field" value={workerPassword} onChange={e => setWorkerPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Add</button>
            </form>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'Security' && (
          <form onSubmit={handleUpdateAccount}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
              <div>
                <label className="input-label">New Username</label>
                <input type="text" className="input-field" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <input type="text" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSavingAccount}>Update Credentials</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
