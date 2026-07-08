import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { db } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { supabaseEphemeral } from '../../lib/supabaseEphemeral';
import type { Item, AuditLog, Category, OnlineOrder, HeroSlide } from '../../lib/db';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Trash2, Lock, Activity, Key, Plus, Users, AlertTriangle, Tag, Package, ToggleLeft, ToggleRight, Eye, EyeOff, ShoppingCart, Image as ImageIcon, Edit2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

type TabKey = 'logs' | 'workers' | 'categories' | 'items' | 'settings' | 'orders' | 'hero' | 'receipt';

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
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [storeUpiId, setStoreUpiId] = useState('anshajshaji3-2@okicici');
  const [storePhoneNumber, setStorePhoneNumber] = useState('919778052356');
  const [storeBankDetails, setStoreBankDetails] = useState('');
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);
  const [footerDescription, setFooterDescription] = useState('Your premier source for premium cooking and baking ingredients, raw materials, professional utensils, and chef supplies.');
  const [footerPhone, setFooterPhone] = useState('+91-9876543210');
  const [footerHours, setFooterHours] = useState('9 AM - 8 PM');
  const [footerDays, setFooterDays] = useState('Monday - Saturday');
  const [footerCopyright, setFooterCopyright] = useState('© ' + new Date().getFullYear() + ' Chef & Joy. All rights reserved.');
  
  // Receipt State
  const [receiptH1, setReceiptH1] = useState('CHEF & JOY');
  const [receiptH2, setReceiptH2] = useState('KAZHAKUTTOM,TRIVANDRUM');
  const [receiptH3, setReceiptH3] = useState('PH:+91-999507648');
  const [receiptH4, setReceiptH4] = useState('GSTIN:32AKIPA6398K2ZW');
  const [receiptF1, setReceiptF1] = useState('For :  CHEF & JOY');
  const [receiptF2, setReceiptF2] = useState('Thank you . . .      Visit Again . . .');

  const [orderIdPrefix, setOrderIdPrefix] = useState('ORD-');
  const [orderIdSequence, setOrderIdSequence] = useState(1000);

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#E63946');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatStoreType, setNewCatStoreType] = useState<'online' | 'offline'>(() => useAppStore.getState().storeType);
  
  // Hero Slide Form State
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImageUrl, setNewSlideImageUrl] = useState('');
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
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
        const [l, i, c, pw, wList, oList, hSlides, settings] = await Promise.all([
          db.getAuditLogs(), db.getItems(), db.getCategories(), db.getPendingWorkers(), db.getWorkers(), db.getOnlineOrders(), db.getHeroSlides(), db.getStoreSettings()
        ]);
        
        // Merge Supabase workers with local storage (to preserve passwords of admin-created ones)
        const localWorkers: WorkerData[] = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
        const mergedWorkers = wList.map(fw => {
          const localMatch = localWorkers.find(lw => lw.email === fw.email);
          return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
        });

        setLogs(l); setItems(i); setCategories(c); setPendingWorkers(pw); setOnlineOrders(oList); setHeroSlides(hSlides);
        if (settings) {
          setStoreUpiId(settings.upi_id);
          setStorePhoneNumber(settings.phone_number);
          setStoreBankDetails(settings.bank_details || '');
          if (settings.footer_description) setFooterDescription(settings.footer_description);
          if (settings.footer_phone) setFooterPhone(settings.footer_phone);
          if (settings.footer_hours) setFooterHours(settings.footer_hours);
          if (settings.footer_days) setFooterDays(settings.footer_days);
          if (settings.footer_copyright) setFooterCopyright(settings.footer_copyright);
          if (settings.receipt_header_1) setReceiptH1(settings.receipt_header_1);
          if (settings.receipt_header_2) setReceiptH2(settings.receipt_header_2);
          if (settings.receipt_header_3) setReceiptH3(settings.receipt_header_3);
          if (settings.receipt_header_4) setReceiptH4(settings.receipt_header_4);
          if (settings.receipt_footer_1) setReceiptF1(settings.receipt_footer_1);
          if (settings.receipt_footer_2) setReceiptF2(settings.receipt_footer_2);
          if (settings.order_id_prefix) setOrderIdPrefix(settings.order_id_prefix);
          if (settings.order_id_sequence) setOrderIdSequence(settings.order_id_sequence);
        }
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
    const [l, i, c, pw, wList, oList] = await Promise.all([db.getAuditLogs(), db.getItems(), db.getCategories(), db.getPendingWorkers(), db.getWorkers(), db.getOnlineOrders()]);
    
    const localWorkers: WorkerData[] = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
    const mergedWorkers = wList.map(fw => {
      const localMatch = localWorkers.find(lw => lw.email === fw.email);
      return { ...fw, ...localMatch, id: fw.id, email: fw.email || localMatch?.email || '', name: fw.name || localMatch?.name, password: localMatch?.password || 'User Managed' };
    });

    setLogs(l); setItems(i); setCategories(c); setPendingWorkers(pw); setOnlineOrders(oList);
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
        const { data: existingProfile } = await import('../../lib/supabase').then(m =>
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
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStoreSettings(true);
    try {
      await db.updateStoreSettings({
        upi_id: storeUpiId,
        phone_number: storePhoneNumber,
        bank_details: storeBankDetails,
        footer_description: footerDescription,
        footer_phone: footerPhone,
        footer_hours: footerHours,
        footer_days: footerDays,
        footer_copyright: footerCopyright,
        receipt_header_1: receiptH1,
        receipt_header_2: receiptH2,
        receipt_header_3: receiptH3,
        receipt_header_4: receiptH4,
        receipt_footer_1: receiptF1,
        receipt_footer_2: receiptF2,
        order_id_prefix: orderIdPrefix,
        order_id_sequence: orderIdSequence
      });
      showToast('Store settings updated! ⚙️');
      await db.addAuditLog('Updated Store Settings', `UPI: ${storeUpiId}`);
    } catch (err) {
      showToast('Failed to update settings');
    } finally {
      setIsSavingStoreSettings(false);
    }
  };

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

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingSlide(true);
    
    try {
      const result = await db.uploadProductImage(file);
      if (result.success && result.url) {
        setNewSlideImageUrl(result.url);
        showToast('Image uploaded! ✅');
      } else {
        showToast(`Failed to upload image: ${result.error?.message || 'Unknown error'} ❌`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading image ❌');
    } finally {
      setIsUploadingSlide(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim() || !newSlideSubtitle.trim() || !newSlideImageUrl) {
      showToast('Please fill all fields and upload an image.');
      return;
    }
    const maxOrder = heroSlides.reduce((max, s) => Math.max(max, s.order_index), 0);
    const newSlide = await db.saveHeroSlide({
      title: newSlideTitle,
      subtitle: newSlideSubtitle,
      image_url: newSlideImageUrl,
      order_index: maxOrder + 1
    });
    if (newSlide) {
      setHeroSlides([...heroSlides, newSlide]);
      setNewSlideTitle('');
      setNewSlideSubtitle('');
      setNewSlideImageUrl('');
      showToast('Slide added successfully! ✅');
      db.addAuditLog('Added Hero Slide', newSlide.title);
    }
  };

  const handleDeleteSlide = async (id: string, title: string) => {
    if (!confirm(`Delete slide "${title}"?`)) return;
    await db.deleteHeroSlide(id);
    setHeroSlides(heroSlides.filter(s => s.id !== id));
    showToast('Slide deleted! 🗑️');
    db.addAuditLog('Deleted Hero Slide', title);
  };


  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Cannot undo.`)) return;
    await db.deleteItem(id);
    await db.addAuditLog('Deleted Product', name);
    await refreshData();
    showToast('Item deleted! 🗑️');
  };

  // Categories
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingCatImage(true);
    
    try {
      const result = await db.uploadProductImage(file);
      if (result.success && result.url) {
        setNewCatImageUrl(result.url);
        showToast('Category Image uploaded! ✅');
      } else {
        showToast(`Failed to upload image: ${result.error?.message || 'Unknown error'} ❌`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading image ❌');
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    if (editingCategoryId) {
      await db.updateCategory(editingCategoryId, { name: newCatName.trim(), color: newCatColor, image_url: newCatImageUrl || undefined, store_type: newCatStoreType } as any);
      await db.addAuditLog('Updated Category', newCatName.trim());
      showToast('Category updated! 🎨');
    } else {
      await db.addCategory({ name: newCatName.trim(), color: newCatColor, icon: 'Tag', image_url: newCatImageUrl || undefined, store_type: newCatStoreType } as any);
      await db.addAuditLog('Added Category', newCatName.trim());
      showToast('Category added! 🎨');
    }
    
    setNewCatName('');
    setNewCatImageUrl('');
    setNewCatStoreType(useAppStore.getState().storeType);
    setEditingCategoryId(null);
    await refreshData();
  };

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatColor(cat.color);
    setNewCatImageUrl(cat.image_url || '');
    setNewCatStoreType((cat as any).store_type || 'offline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    ...(useAppStore.getState().storeType === 'online' ? [{ key: 'orders' as TabKey, icon: ShoppingCart, label: 'Orders' }] : []),
    { key: 'workers', icon: Users, label: 'Workers' },
    { key: 'items', icon: Package, label: 'Items' },
    { key: 'categories', icon: Tag, label: 'Categories' },
    { key: 'hero', icon: ImageIcon, label: 'Hero Slides' },
    { key: 'logs', icon: Activity, label: 'Logs' },
    { key: 'settings', icon: Key, label: 'Settings' },
    { key: 'receipt', icon: Package, label: 'Receipt' },
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
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>{item.category} · Qty: {item.quantity} {useAppStore.getState().storeType === 'online' && `· Segment: ${(item as any).store_segment === 'hotel' ? 'Hotel Only' : (item as any).store_segment === 'bakery' ? 'Bakery Only' : 'Both'}`}</span>
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
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={18} color="var(--color-primary)" /> Categories ({categories.length})
              </h2>

              <form onSubmit={handleAddCategory} style={{ borderBottom: '1px solid rgba(230,57,70,0.08)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
                  {editingCategoryId ? '✏️ Edit Category' : '➕ Add New Category'}
                </h3>
                <div className="input-group"><label className="input-label">Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Snacks" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginTop: '0.75rem' }}><label className="input-label">Department / Store</label>
                  <select
                    className="input-field"
                    value={newCatStoreType}
                    onChange={e => setNewCatStoreType(e.target.value as 'online' | 'offline')}
                  >
                    <option value="online">Online Store</option>
                    <option value="offline">Offline Store</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginTop: '0.75rem' }}><label className="input-label" style={{ marginBottom: '0.5rem' }}>Color</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {colors.map(c => (
                      <button key={c} type="button" onClick={() => setNewCatColor(c)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: newCatColor === c ? '2px solid white' : 'none', boxShadow: newCatColor === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
                    ))}
                    <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  </div>
                </div>
                <div className="input-group" style={{ marginTop: '0.75rem' }}>
                  <label className="input-label">Category Image (Optional)</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCatImageUpload}
                      disabled={isUploadingCatImage}
                      style={{ fontSize: '0.8rem' }}
                    />
                    {isUploadingCatImage && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                  </div>
                  {newCatImageUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={newCatImageUrl} alt="Preview" style={{ height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isUploadingCatImage} style={{ flex: 1 }}>
                    {editingCategoryId ? (
                      <><Edit2 size={16} /> Update Category</>
                    ) : (
                      <><Plus size={16} /> Add Category</>
                    )}
                  </button>
                  {editingCategoryId && (
                    <button type="button" className="btn btn-outline" onClick={() => {
                      setEditingCategoryId(null);
                      setNewCatName('');
                      setNewCatColor('#E63946');
                      setNewCatImageUrl('');
                      setNewCatStoreType(useAppStore.getState().storeType);
                    }} style={{ flex: 1 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', border: `1.5px solid ${cat.color}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }}></span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button onClick={() => handleEditCategoryClick(cat)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.3rem' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.3rem' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>


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

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {useAppStore.getState().storeType === 'online' && (
              <div className="panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={18} color="var(--color-primary)" /> Store Configuration
                </h2>
                <form onSubmit={handleSaveStoreSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">UPI ID for Payments</label>
                    <input type="text" className="input-field" placeholder="e.g., yourname@bank" value={storeUpiId} onChange={e => setStoreUpiId(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">WhatsApp Number (include country code)</label>
                    <input type="text" className="input-field" placeholder="e.g., 919876543210" value={storePhoneNumber} onChange={e => setStorePhoneNumber(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Bank Details (Optional)</label>
                    <textarea className="input-field" placeholder="Account Number, IFSC Code, Bank Name, etc." value={storeBankDetails} onChange={e => setStoreBankDetails(e.target.value)} rows={3} />
                  </div>
                  
                  <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem 0', color: 'var(--color-primary)' }}>Footer Configuration</h3>
                  
                  <div className="input-group">
                    <label className="input-label">Footer Brand Description</label>
                    <textarea className="input-field" placeholder="Your premier source for premium cooking and baking ingredients..." value={footerDescription} onChange={e => setFooterDescription(e.target.value)} rows={2} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Footer Phone/WhatsApp</label>
                    <input type="text" className="input-field" placeholder="+91-9876543210" value={footerPhone} onChange={e => setFooterPhone(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Store Hours</label>
                    <input type="text" className="input-field" placeholder="9 AM - 8 PM" value={footerHours} onChange={e => setFooterHours(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Operating Days</label>
                    <input type="text" className="input-field" placeholder="Monday - Saturday" value={footerDays} onChange={e => setFooterDays(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Copyright Text</label>
                    <input type="text" className="input-field" placeholder="© 2026 Chef & Joy. All rights reserved." value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} required />
                  </div>

                  <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem 0', color: 'var(--color-primary)' }}>Order ID Configuration</h3>
                  <div className="input-group">
                    <label className="input-label">Order ID Prefix</label>
                    <input type="text" className="input-field" placeholder="ORD-" value={orderIdPrefix} onChange={e => setOrderIdPrefix(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Next Order Sequence Number</label>
                    <input type="number" className="input-field" placeholder="1000" value={orderIdSequence} onChange={e => setOrderIdSequence(parseInt(e.target.value) || 1000)} required />
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>This number will increase by 1 for every new online order.</p>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isSavingStoreSettings}>
                    {isSavingStoreSettings ? 'Saving...' : 'Save Configuration'}
                  </button>
                </form>
              </div>
            )}

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
          </div>
        )}

        {/* RECEIPT TAB */}
        {activeTab === 'receipt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="var(--color-primary)" /> Receipt Configuration
              </h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Editor Side */}
                <div style={{ flex: '1 1 300px' }}>
                  <form onSubmit={handleSaveStoreSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Header Lines</h3>
                    <input type="text" className="input-field" placeholder="CHEF & JOY" value={receiptH1} onChange={e => setReceiptH1(e.target.value)} required />
                    <input type="text" className="input-field" placeholder="KAZHAKUTTOM,TRIVANDRUM" value={receiptH2} onChange={e => setReceiptH2(e.target.value)} required />
                    <input type="text" className="input-field" placeholder="PH:+91-999507648" value={receiptH3} onChange={e => setReceiptH3(e.target.value)} required />
                    <input type="text" className="input-field" placeholder="GSTIN:32AKIPA6398K2ZW" value={receiptH4} onChange={e => setReceiptH4(e.target.value)} required />
                    
                    <h3 style={{ fontSize: '0.9rem', margin: '1rem 0 0 0' }}>Footer Lines</h3>
                    <input type="text" className="input-field" placeholder="For :  CHEF & JOY" value={receiptF1} onChange={e => setReceiptF1(e.target.value)} required />
                    <input type="text" className="input-field" placeholder="Thank you . . . Visit Again . . ." value={receiptF2} onChange={e => setReceiptF2(e.target.value)} required />
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSavingStoreSettings}>
                      {isSavingStoreSettings ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </form>
                </div>

                {/* Live Preview Side */}
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', border: '1px solid #ccc', padding: '1.5rem', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre', color: '#000', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', minWidth: '350px' }}>
                  <div style={{ textAlign: 'center' }}>
                    {receiptH1}<br />
                    {receiptH2}<br />
                    {receiptH3}<br />
                    {receiptH4}
                  </div>
                  <br />
                  Invoice No: 1234       Date :08-07-2026<br />
                  Customer Name : JOHN DOE<br />
                  --------------------------------------------<br />
                  SI  Item       Qty  MRP    Rate GST%  Amount<br />
                  --------------------------------------------<br />
                  1 //001//Bread       1    50    47.62    5    47.62<br />
                  <br />
                  Total :                                50.00<br />
                  ============================================<br />
                  Amount in words payable:<br />
                  Fifty Rupees Only<br />
                  <br />
                  <div style={{ textAlign: 'center' }}>
                    {receiptF1}<br />
                    {receiptF2}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}


        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} color="var(--color-primary)" /> Hero Slides ({heroSlides.length})
            </h2>

            {/* Add New Slide Form */}
            <form onSubmit={handleAddSlide} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-bg-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>Add New Slide</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Slide Title (e.g. Premium Ingredients)" 
                  value={newSlideTitle} 
                  onChange={e => setNewSlideTitle(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Slide Subtitle" 
                  value={newSlideSubtitle} 
                  onChange={e => setNewSlideSubtitle(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Slide Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    disabled={isUploadingSlide}
                    style={{ fontSize: '0.8rem' }}
                  />
                  {isUploadingSlide && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                </div>
                {newSlideImageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={newSlideImageUrl} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUploadingSlide || !newSlideImageUrl || !newSlideTitle.trim()}
                style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Plus size={16} /> Add Slide
              </button>
            </form>

            {/* Slide List */}
            {heroSlides.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>No slides configured.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {heroSlides.sort((a,b) => a.order_index - b.order_index).map(slide => (
                  <div key={slide.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: '12px', border: '1px solid rgba(230,57,70,0.1)', alignItems: 'center' }}>
                    <img src={slide.image_url} alt={slide.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{slide.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{slide.subtitle}</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>Order: {slide.order_index}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteSlide(slide.id, slide.title)}
                      style={{ padding: '0.5rem', color: '#E63946', backgroundColor: 'rgba(230,57,70,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      title="Delete Slide"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} color="var(--color-primary)" /> Online Orders ({onlineOrders.length})
            </h2>
            {onlineOrders.length === 0 ? <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>No orders yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {onlineOrders.map(order => (
                  <div key={order.id} style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(230,57,70,0.05)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{order.id}</span>
                        <p style={{ margin: '0.2rem 0 0', fontWeight: 600, fontSize: '0.85rem' }}>👤 {order.customer_name}</p>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>📞 {order.customer_phone}</p>
                        {order.customer_email && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>📧 {order.customer_email}</p>}
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <strong>{order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</strong>
                          {order.address && ` - ${order.address}`}
                        </p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{new Date(order.created_at || '').toLocaleString()}</p>
                        {order.transaction_id && (
                          <div style={{ marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#E8F5E9', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #A5D6A7' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2E7D32' }}>UTR/Txn: {order.transaction_id}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#D95B35' }}>₹{order.total_amount}</span>
                        <select 
                          value={order.status}
                          onChange={async (e) => {
                            await db.updateOrderStatus(order.id, e.target.value as any);
                            await refreshData();
                            showToast('Order status updated!');
                          }}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: order.status === 'completed' ? '#E8F5E9' : order.status === 'cancelled' ? '#FFEBEE' : 'var(--color-bg-light)',
                            color: order.status === 'completed' ? '#2E7D32' : order.status === 'cancelled' ? '#C62828' : 'var(--color-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Items:</p>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--color-text)' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} <span style={{ color: 'var(--color-text-secondary)' }}>x{item.quantity}</span> 
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginLeft: '0.5rem' }}>(₹{item.price})</span>
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                          <span style={{ fontWeight: 600 }}>Notes:</span> {order.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </>)}
    </div>
  );
}
