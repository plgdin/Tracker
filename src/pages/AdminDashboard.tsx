import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';
import { supabaseEphemeral } from '../lib/supabaseEphemeral';
import type { Item, AuditLog, Category } from '../lib/db';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Trash2, Lock, Activity, Key, Plus, Users, AlertTriangle, Tag, Package, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

type TabKey = 'logs' | 'workers' | 'categories' | 'items' | 'security';

interface WorkerData {
  id: string;
  email: string;
  name?: string;
  password?: string;
  permissions?: Record<string, boolean>;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();
  const showToast = useToastStore(s => s.showToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('workers');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#E63946');
  const [workers, setWorkers] = useState<WorkerData[]>(() => {
    return JSON.parse(localStorage.getItem('worker_accounts') || '[]');
  });
  const [pendingWorkers, setPendingWorkers] = useState<{id: string, name: string, email: string, created_at: string}[]>([]);
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    (async () => {
      setLoading(true);
      try {
        const [l, i, c, pw, wList] = await Promise.all([db.getAuditLogs(), db.getItems(), db.getCategories(), db.getPendingWorkers(), db.getWorkers()]);
        
        // Merge Supabase workers with local storage (to preserve passwords of admin-created ones)
        const localWorkers: WorkerData[] = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
        const mergedWorkers = wList.map(fw => {
          const localMatch = localWorkers.find(lw => lw.email === fw.email);
          return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
        });

        setLogs(l); setItems(i); setCategories(c); setPendingWorkers(pw);
        setWorkers(mergedWorkers);
        localStorage.setItem('worker_accounts', JSON.stringify(mergedWorkers));

      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [profile]);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      if (location.key !== 'default') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowAccessDenied(true);
      } else {
        signOut().then(() => navigate('/?error=access_denied', { replace: true }));
      }
    }
  }, [profile, location.key, navigate, signOut]);

  if (showAccessDenied) {
    return (
      <div className="container" style={{ paddingBottom: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <AlertTriangle size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            You do not have permission to view the admin dashboard.
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ width: '100%' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  const refreshData = async () => {
    const [l, i, c, pw, wList] = await Promise.all([db.getAuditLogs(), db.getItems(), db.getCategories(), db.getPendingWorkers(), db.getWorkers()]);
    
    const localWorkers: WorkerData[] = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
    const mergedWorkers = wList.map(fw => {
      const localMatch = localWorkers.find(lw => lw.email === fw.email);
      return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
    });

    setLogs(l); setItems(i); setCategories(c); setPendingWorkers(pw);
    if (mergedWorkers.length > 0 || wList.length === 0) setWorkers(mergedWorkers);

  };

  // Access
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = workerEmail.trim().toLowerCase(), pw = workerPassword.trim();
    if (!em.includes('@')) { alert('Enter a valid email!'); return; }
    if (pw.length < 4) { alert('Password must be ≥4 chars!'); return; }
    if (workers.some((w) => w.email === em)) { alert('Already exists!'); return; }

    // Create a real Supabase Auth user so the worker can log in from any device.
    // Ephemeral client avoids overwriting the admin's current session.
    try {
      const { data: signUpData, error } = await supabaseEphemeral.auth.signUp({ 
        email: em, 
        password: pw,
        options: { data: { full_name: em.split('@')[0], is_admin_created: true } }
      });
      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (!msg.includes('already registered')) {
          alert(error.message);
          return;
        }
      }

      // If the user was newly created, immediately approve them (bypass pending state)
      // so they can log in right away without waiting for admin approval
      if (signUpData?.user?.id) {
        await db.approveWorker(signUpData.user.id);
      } else {
        // User already exists — look them up and approve
        const { data: existingProfile } = await import('../lib/supabase').then(m =>
          m.supabase.from('profiles').select('id').eq('email', em).maybeSingle()
        );
        if (existingProfile?.id) await db.approveWorker(existingProfile.id);
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to create worker account.');
      return;
    }
    const w = { id: 'w-'+Math.random().toString(36).substr(2,9), email: em, password: pw, permissions: {}, created_at: new Date().toISOString() };
    const up = [...workers, w]; setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    await db.addAuditLog('Added Worker', em);
    setWorkerEmail(''); setWorkerPassword('');
    showToast('Worker added! 👥');
    refreshData();
  };

  const handleRemoveWorker = async (id: string, email: string) => {
    if (!confirm(`Delete worker ${email}?`)) return;
    
    // Attempt to delete from Supabase profiles
    const success = await db.rejectWorker(id);
    if (!success) {
      alert("Failed to delete worker. Make sure you are logged into Supabase as an admin. Check the browser console for details.");
      return;
    }
    
    const up = workers.filter((w) => w.id !== id); setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    db.addAuditLog('Removed Worker', email);
    showToast('Worker removed! 🗑️');
    
    refreshData();
  };

  const handleApprovePending = async (id: string, email: string) => {
    if (await db.approveWorker(id)) {
      showToast(`Worker ${email} approved! ✅`);
      db.addAuditLog('Approved Worker', email);
      refreshData();
    } else {
      showToast(`Failed to approve ${email} ❌`);
    }
  };

  const handleRejectPending = async (id: string, email: string) => {
    if (!confirm(`Reject signup request from ${email}?`)) return;
    if (await db.rejectWorker(id)) {
      showToast(`Worker ${email} rejected! 🗑️`);
      db.addAuditLog('Rejected Worker', email);
      refreshData();
    } else {
      showToast(`Failed to reject ${email} ❌`);
    }
  };

  const togglePermission = (workerId: string, perm: string) => {
    const up = workers.map((w) => {
      if (w.id === workerId) {
        const perms = w.permissions || {};
        return { ...w, permissions: { ...perms, [perm]: !perms[perm] } };
      }
      return w;
    });
    setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    
    const workerEmail = workers.find(w => w.id === workerId)?.email || 'Unknown';
    db.addAuditLog('Updated Worker Permission', workerEmail, { permission: perm, new_value: up.find(w => w.id === workerId)?.permissions?.[perm] });
    
    showToast('Permission updated! ✅');
  };

  // Security
  const handleCustomizeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const u = newAdminUser.trim();
    const p = newAdminPass.trim();
    
    if (!u && !p) return;
    
    if (u && u.length < 3) { alert('Username must be at least 3 characters!'); return; }
    if (p && p.length < 6) { alert('Password must be at least 6 characters!'); return; }
    
    if (!confirm('You are about to change the admin credentials in the database. Proceed?')) return;
    
    setIsSavingSecurity(true);
    
    const withTimeout = <T,>(p: PromiseLike<T>, ms: number, msg: string): Promise<T> =>
      Promise.race([Promise.resolve(p), new Promise<T>((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);

    try {
      if (u) {
        // Check uniqueness
        const { data: existing } = await withTimeout(
          supabase.from('profiles').select('id').eq('name', u).maybeSingle(),
          8000, 'Username check timed out. Please try again.'
        );
        if (existing && existing.id !== profile.id) {
          showToast('⚠️ Username already taken! Choose a different one.');
          setIsSavingSecurity(false);
          return;
        }
        const { error: usernameErr } = await withTimeout(
          supabase.from('profiles').update({ name: u }).eq('id', profile.id),
          8000, 'Username update timed out. Please try again.'
        );
        if (usernameErr) throw usernameErr;
        useAuthStore.getState().setProfile({ ...profile, name: u });
        await db.addAuditLog('Changed Admin Username', u, { previous_username: profile.name });
      }

      if (p) {
        const { error: passErr } = await withTimeout(
          supabase.auth.updateUser({ password: p }),
          45000, 'Password update timed out. Check your connection and try again.'
        );
        if (passErr) {
          // Surface a friendly message for auth errors (e.g. session expired)
          if (passErr.message.toLowerCase().includes('session') || passErr.message.toLowerCase().includes('auth')) {
            throw new Error('Session expired. Please log out and log back in, then try again.');
          }
          throw passErr;
        }
        await db.addAuditLog('Changed Admin Password', profile.email || profile.name);
      }

      showToast('Credentials updated! Re-login required... 🔑');
      setNewAdminUser('');
      setNewAdminPass('');
      setTimeout(() => {
        signOut().then(() => {
          window.location.href = '/';
        });
      }, 1500);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Something went wrong. Please try again.';
      console.error('Admin update failed:', err);
      showToast(`❌ ${msg}`);
    } finally {
      setIsSavingSecurity(false);
    }
  };


  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Cannot undo.`)) return;
    await db.deleteItem(id);
    await db.addAuditLog('Deleted Product', name);
    await refreshData();
    showToast('Item deleted! 🗑️');
  };

  // Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await db.addCategory({ name: newCatName.trim(), color: newCatColor, icon: 'Tag' });
    await db.addAuditLog('Added Category', newCatName.trim());
    setNewCatName('');
    await refreshData();
    showToast('Category added! 🎨');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const deleted = await db.deleteCategory(id);
    if (!deleted) {
      showToast('Category could not be deleted. Check Supabase category permissions.');
      return;
    }
    await db.addAuditLog('Deleted Category', name);
    await refreshData();
    showToast('Category deleted! 🗑️');
  };

  const tabs: { key: TabKey; icon: React.ElementType; label: string }[] = [
    { key: 'workers', icon: Users, label: 'Workers' },
    { key: 'items', icon: Package, label: 'Items' },
    { key: 'categories', icon: Tag, label: 'Categories' },
    { key: 'logs', icon: Activity, label: 'Logs' },
    { key: 'security', icon: Key, label: 'Security' },
  ];

  const colors = ['#E63946','#E07A5F','#F2CC8F','#81B29A','#3D5A80','#98C1D9','#EE6C4D','#6366F1'];

  return (
    <div style={{ paddingBottom: '5rem', width: '100%', minWidth: 0 }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(230,57,70,0.2)' }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Panel</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', margin: 0 }}>Manage workers, items, categories & settings</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="panel" style={{ padding: '0.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.2rem', overflowX: 'auto', borderRadius: '16px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: 'none', borderRadius: '12px', whiteSpace: 'nowrap' }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      ) : (<>

        {/* WORKERS TAB */}
        {activeTab === 'workers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="var(--color-primary)" /> Add Worker Account
              </h2>
              <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="input-group"><label className="input-label">Email</label>
                  <input type="email" className="input-field" placeholder="worker@gmail.com" value={workerEmail} onChange={e => setWorkerEmail(e.target.value)} required />
                </div>
                <div className="input-group"><label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showWorkerPassword ? "text" : "password"} className="input-field" placeholder="Set password..." value={workerPassword} onChange={e => setWorkerPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowWorkerPassword(!showWorkerPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                      {showWorkerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}><Plus size={16} /> Add Worker</button>
              </form>
            </div>


            <div className="panel" style={{ padding: '1.5rem', border: '1px solid var(--color-primary)', backgroundColor: 'rgba(230,57,70,0.03)' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <AlertTriangle size={18} /> Pending Access Requests ({pendingWorkers.length})
              </h2>
              {pendingWorkers.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>
                  ✅ No pending signup requests right now.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingWorkers.map((pw) => (
                    <div key={pw.id} style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>👤 {pw.name || '(no username)'}</p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>📧 {pw.email}</p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Requested: {new Date(pw.created_at).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApprovePending(pw.id, pw.email)} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          ✓ Accept
                        </button>
                        <button onClick={() => handleRejectPending(pw.id, pw.email)} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-primary)', backgroundColor: 'transparent', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <div className="panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--color-primary)" /> Workers ({workers.length})
              </h2>
              {workers.length === 0 ? <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1.5rem' }}>No workers yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {workers.map((w) => (
                    <div key={w.id} style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(230,57,70,0.05)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{w.name ? `👤 ${w.name}` : `📧 ${w.email}`}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{w.name ? `📧 ${w.email}` : ''}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Pass: <strong>{w.password}</strong></p>
                        </div>
                        <button onClick={() => handleRemoveWorker(w.id, w.email)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.5rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {/* Permissions toggles */}
                      <div style={{ borderTop: '1px solid rgba(230,57,70,0.06)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Permissions</p>
                        {[
                          { key: 'canAddItems', label: '📦 Add Items' },
                          { key: 'canEditItems', label: '✏️ Edit Items' },
                        ].map(p => {
                          const on = w.permissions?.[p.key] ?? false;
                          return (
                            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem' }}>{p.label}</span>
                              <button onClick={() => togglePermission(w.id, p.key)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: on ? 'rgb(46,204,113)' : 'var(--color-text-secondary)', padding: '0.15rem' }}>
                                {on ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--color-primary)" /> All Products ({items.length})
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>Admin can delete any product here. Workers cannot delete items.</p>
            {items.length === 0 ? <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>No products yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(230,57,70,0.05)' }}>
                    <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>📦 {item.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>{item.category} · Qty: {item.quantity}</span>
                    </div>
                    <button onClick={() => handleDeleteItem(item.id, item.name)} style={{ border: 'none', background: 'rgba(230,57,70,0.08)', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={18} color="var(--color-primary)" /> Categories ({categories.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', border: `1.5px solid ${cat.color}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }}></span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.name}</span>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.3rem' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCategory} style={{ borderTop: '1px solid rgba(230,57,70,0.08)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0', fontWeight: 700 }}>➕ Add New Category</h3>
                <div className="input-group"><label className="input-label">Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Snacks" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginTop: '0.75rem' }}><label className="input-label" style={{ marginBottom: '0.5rem' }}>Color</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {colors.map(c => (
                      <button key={c} type="button" onClick={() => setNewCatColor(c)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: newCatColor === c ? '2px solid white' : 'none', boxShadow: newCatColor === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
                    ))}
                    <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Plus size={16} /> Add Category</button>
              </form>
            </div>
          </div>
        )}


        {activeTab === 'logs' && (
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--color-primary)" /> Activity Logs
            </h2>
            {logs.length === 0 ? <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>No activity yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', borderLeft: '3px solid var(--color-primary)', fontSize: '0.8rem', wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong>👤 {log.worker_email}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{log.action}</span>
                      {log.action === 'Updated Worker Permission' ? (
                        ` — 🛡️ ${log.details?.permission} turned ${log.details?.new_value ? 'ON' : 'OFF'} for ${log.details?.item_name}`
                      ) : (
                        <>
                          {log.details?.item_name && ` — 📦 ${log.details.item_name}`}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="var(--color-primary)" /> Admin Credentials
            </h2>

            
            <form onSubmit={handleCustomizeAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(230,57,70,0.05)', border: '1px solid var(--color-primary)', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertTriangle size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600 }}>Save your new credentials safely in the database.</p>
              </div>
              <div className="input-group"><label className="input-label">New Username</label>
                <input type="text" className="input-field" placeholder="e.g., superadmin" value={newAdminUser} onChange={e => setNewAdminUser(e.target.value)} />
              </div>
              <div className="input-group"><label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showAdminPassword ? "text" : "password"} className="input-field" placeholder="e.g., myPass123" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
                    {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSavingSecurity || (!newAdminUser.trim() && !newAdminPass.trim())}>
                <Lock size={16} /> {isSavingSecurity ? 'Saving...' : 'Update Credentials'}
              </button>
            </form>
          </div>
        )}

      </>)}
    </div>
  );
}
