import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { db } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { supabaseEphemeral } from '../../lib/supabaseEphemeral';
import type { AuditLog, Category, OnlineOrder, HeroSlide } from '../../lib/db';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Trash2, 
  Activity, 
  Plus, 
  Users, 
  AlertTriangle, 
  Tag, 
  Eye, 
  EyeOff, 
  ShoppingCart, 
  Image as ImageIcon, 
  Edit2, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  Sliders, 
  Receipt,
  Search,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

type TabKey = 'orders' | 'workers' | 'categories' | 'hero' | 'settings' | 'logs';

interface WorkerData {
  id: string;
  email: string;
  name?: string;
  password?: string;
  permissions?: Record<string, boolean>;
}

interface AdminDashboardProps {
  isOrdersOnly?: boolean;
}

export default function AdminDashboard({ isOrdersOnly }: AdminDashboardProps = {}) {
  const { profile, signOut } = useAuthStore();
  const showToast = useToastStore(s => s.showToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isOnline = location.pathname.includes('online');

  // Dedicated Orders Hub mode vs Administrative Desk mode
  const isOrdersMode = Boolean(isOrdersOnly) || 
    location.pathname.endsWith('/orders') || 
    location.pathname.includes('/orders') || 
    searchParams.get('tab') === 'orders';

  // URL query parameter support for tab selection (e.g. ?tab=categories)
  const tabParam = searchParams.get('tab') as TabKey;
  const activeTab: TabKey = isOrdersMode 
    ? 'orders' 
    : (tabParam && tabParam !== 'orders' ? tabParam : 'workers');

  const showAccessDenied = Boolean(profile && profile.role !== 'admin' && location.key !== 'default');
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data Lists
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [workers, setWorkers] = useState<WorkerData[]>(() => {
    return JSON.parse(localStorage.getItem('worker_accounts') || '[]');
  });
  const [pendingWorkers, setPendingWorkers] = useState<{id: string, name: string, email: string, created_at: string}[]>([]);

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Store & Receipt Settings
  const [storeUpiId, setStoreUpiId] = useState('anshajshaji3-2@okicici');
  const [storePhoneNumber, setStorePhoneNumber] = useState('919778052356');
  const [storeBankDetails, setStoreBankDetails] = useState('');
  const [footerDescription, setFooterDescription] = useState('Your premier source for premium cooking and baking ingredients, raw materials, professional utensils, and chef supplies.');
  const [footerPhone, setFooterPhone] = useState('+91-9876543210');
  const [footerHours, setFooterHours] = useState('9 AM - 8 PM');
  const [footerDays, setFooterDays] = useState('Monday - Saturday');
  const [footerCopyright, setFooterCopyright] = useState('© ' + new Date().getFullYear() + ' NayaKart. All rights reserved.');
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);

  // POS Thermal Receipt Settings
  const [receiptH1, setReceiptH1] = useState(() => isOnline ? 'CHEF & JOY' : 'NAYAKART');
  const [receiptH2, setReceiptH2] = useState('KAZHAKUTTOM,TRIVANDRUM');
  const [receiptH3, setReceiptH3] = useState('PH:+91-999507648');
  const [receiptH4, setReceiptH4] = useState('GSTIN:32AKIPA6398K2ZW');
  const [receiptF1, setReceiptF1] = useState(() => isOnline ? 'For :  CHEF & JOY' : 'For :  NAYAKART');
  const [receiptF2, setReceiptF2] = useState('Thank you . . .      Visit Again . . .');
  const [orderIdPrefix, setOrderIdPrefix] = useState(() => isOnline ? 'ORD-' : 'POS-');
  const [orderIdSequence, setOrderIdSequence] = useState(1000);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B4513');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatStoreType, setNewCatStoreType] = useState<'online' | 'offline'>(() => isOnline ? 'online' : 'offline');

  // Hero Slide Form State
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImageUrl, setNewSlideImageUrl] = useState('');
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  // Worker Form State
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');

  const handleTabChange = (tab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const currentStoreType: 'online' | 'offline' = isOnline ? 'online' : 'offline';
      const [l, c, pw, wList, oList, hSlides, settings] = await Promise.all([
        db.getAuditLogs(),
        db.getCategories(),
        db.getPendingWorkers(),
        db.getWorkers(),
        db.getOnlineOrders(),
        db.getHeroSlides(),
        db.getStoreSettings(currentStoreType)
      ]);

      const localWorkers: WorkerData[] = JSON.parse(localStorage.getItem('worker_accounts') || '[]');
      const mergedWorkers = wList.map(fw => {
        const localMatch = localWorkers.find(lw => lw.email === fw.email);
        return { 
          ...fw, 
          ...localMatch, 
          id: fw.id, 
          email: fw.email || localMatch?.email || '', 
          name: fw.name || localMatch?.name
        };
      });

      setLogs(l || []);
            setCategories(c || []);
      setPendingWorkers(pw || []);
      setOnlineOrders(oList || []);
      setHeroSlides(hSlides || []);

      if (settings) {
        if (settings.upi_id) setStoreUpiId(settings.upi_id);
        if (settings.phone_number) setStorePhoneNumber(settings.phone_number);
        setStoreBankDetails(settings.bank_details || '');
        if (settings.footer_description) setFooterDescription(settings.footer_description);
        if (settings.footer_phone) setFooterPhone(settings.footer_phone);
        if (settings.footer_hours) setFooterHours(settings.footer_hours);
        if (settings.footer_days) setFooterDays(settings.footer_days);
        if (settings.footer_copyright) setFooterCopyright(settings.footer_copyright);
        setReceiptH1(settings.receipt_header_1 || (isOnline ? 'CHEF & JOY' : 'NAYAKART'));
        setReceiptH2(settings.receipt_header_2 || 'KAZHAKUTTOM,TRIVANDRUM');
        setReceiptH3(settings.receipt_header_3 || 'PH:+91-999507648');
        setReceiptH4(settings.receipt_header_4 || 'GSTIN:32AKIPA6398K2ZW');
        setReceiptF1(settings.receipt_footer_1 || `For :  ${settings.receipt_header_1 || (isOnline ? 'CHEF & JOY' : 'NAYAKART')}`);
        setReceiptF2(settings.receipt_footer_2 || 'Thank you . . .      Visit Again . . .');
        setOrderIdPrefix(settings.order_id_prefix || (isOnline ? 'ORD-' : 'POS-'));
        setOrderIdSequence(settings.order_id_sequence || 1000);
      }
      setWorkers(mergedWorkers);
      localStorage.setItem('worker_accounts', JSON.stringify(mergedWorkers));
    } catch (e) {
      console.error('Error refreshing admin data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    refreshData();
  }, [profile, isOnline]);

  useEffect(() => {
    if (profile && profile.role !== 'admin' && location.key === 'default') {
      signOut().then(() => navigate('/?error=access_denied', { replace: true }));
    }
  }, [profile, location.key, navigate, signOut]);

  // Worker Actions
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = workerEmail.trim().toLowerCase();
    const pw = workerPassword.trim();
    if (!em || !pw) return;

    try {
      const { error } = await supabaseEphemeral.auth.signUp({
        email: em,
        password: pw,
        options: { data: { name: em.split('@')[0], role: 'worker' } }
      });
      if (error) {
        if (!error.message.includes('already registered')) throw error;
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', em).maybeSingle();
        if (existingProfile?.id) await db.approveWorker(existingProfile.id);
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to create worker account.');
      return;
    }

    const w = { id: 'w-' + Math.random().toString(36).substr(2, 9), email: em, permissions: {}, created_at: new Date().toISOString() };
    const up = [...workers, w];
    setWorkers(up);
    localStorage.setItem('worker_accounts', JSON.stringify(up));
    await db.addAuditLog('Added Worker', em);
    setWorkerEmail('');
    setWorkerPassword('');
    showToast('Staff worker account added! 👥');
    refreshData();
  };

  const handleRemoveWorker = async (id: string, email: string) => {
    if (!confirm(`Delete worker ${email}?`)) return;
    const success = await db.rejectWorker(id);
    if (!success) {
      alert("Failed to delete worker. Check your admin permissions.");
      return;
    }
    const up = workers.filter((w) => w.id !== id);
    setWorkers(up);
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

  // Category Actions
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingCatImage(true);
    try {
      const result = await db.uploadProductImage(file);
      if (result.success && result.url) {
        setNewCatImageUrl(result.url);
        showToast('Category image uploaded! ✅');
      } else {
        showToast(`Failed to upload: ${result.error?.message || 'Error'} ❌`);
      }
    } catch (err) {
      showToast('Error uploading image ❌');
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCategoryId) {
      await db.updateCategory(editingCategoryId, { 
        name: newCatName.trim(), 
        color: newCatColor, 
        image_url: newCatImageUrl || undefined, 
        store_type: newCatStoreType 
      } as any);
      await db.addAuditLog('Updated Category', newCatName.trim());
      showToast('Category updated! 🎨');
    } else {
      await db.addCategory({ 
        name: newCatName.trim(), 
        color: newCatColor, 
        icon: 'Tag', 
        image_url: newCatImageUrl || undefined, 
        store_type: newCatStoreType 
      } as any);
      await db.addAuditLog('Added Category', newCatName.trim());
      showToast('Category added! 🎨');
    }

    setNewCatName('');
    setNewCatImageUrl('');
    setNewCatStoreType(isOnline ? 'online' : 'offline');
    setEditingCategoryId(null);
    await refreshData();
  };

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatColor(cat.color);
    setNewCatImageUrl(cat.image_url || '');
    setNewCatStoreType((cat as any).store_type || 'offline');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const deleted = await db.deleteCategory(id);
    if (!deleted) {
      showToast('Category could not be deleted.');
      return;
    }
    await db.addAuditLog('Deleted Category', name);
    await refreshData();
    showToast('Category deleted! 🗑️');
  };

  // Hero Slide Actions
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingSlide(true);
    try {
      const result = await db.uploadProductImage(file);
      if (result.success && result.url) {
        setNewSlideImageUrl(result.url);
        showToast('Banner image uploaded! ✅');
      } else {
        showToast(`Failed: ${result.error?.message || 'Error'} ❌`);
      }
    } catch (err) {
      showToast('Error uploading slide image ❌');
    } finally {
      setIsUploadingSlide(false);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim() || !newSlideSubtitle.trim() || !newSlideImageUrl) {
      showToast('Please provide a title, subtitle, and banner image.');
      return;
    }

    if (editingSlideId) {
      const existing = heroSlides.find(s => s.id === editingSlideId);
      const updated = await db.saveHeroSlide({
        id: editingSlideId,
        title: newSlideTitle.trim(),
        subtitle: newSlideSubtitle.trim(),
        image_url: newSlideImageUrl,
        order_index: existing ? existing.order_index : 1
      });

      if (updated) {
        setHeroSlides(heroSlides.map(s => s.id === updated.id ? updated : s));
        setEditingSlideId(null);
        setNewSlideTitle('');
        setNewSlideSubtitle('');
        setNewSlideImageUrl('');
        showToast('Hero banner updated! ✅');
        db.addAuditLog('Updated Hero Slide', updated.title);
      }
    } else {
      const maxOrder = heroSlides.reduce((max, s) => Math.max(max, s.order_index), 0);
      const newSlide = await db.saveHeroSlide({
        title: newSlideTitle.trim(),
        subtitle: newSlideSubtitle.trim(),
        image_url: newSlideImageUrl,
        order_index: maxOrder + 1
      });
      if (newSlide) {
        setHeroSlides([...heroSlides, newSlide]);
        setNewSlideTitle('');
        setNewSlideSubtitle('');
        setNewSlideImageUrl('');
        showToast('Hero banner added! ✅');
        db.addAuditLog('Added Hero Slide', newSlide.title);
      }
    }
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setNewSlideTitle(slide.title);
    setNewSlideSubtitle(slide.subtitle);
    setNewSlideImageUrl(slide.image_url);
    const formElem = document.getElementById('hero-slide-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditSlide = () => {
    setEditingSlideId(null);
    setNewSlideTitle('');
    setNewSlideSubtitle('');
    setNewSlideImageUrl('');
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...heroSlides].sort((a, b) => a.order_index - b.order_index);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentSlide = sorted[index];
    const targetSlide = sorted[targetIndex];

    const tempOrder = currentSlide.order_index;
    currentSlide.order_index = targetSlide.order_index;
    targetSlide.order_index = tempOrder;

    if (currentSlide.order_index === targetSlide.order_index) {
      sorted[index] = targetSlide;
      sorted[targetIndex] = currentSlide;
      sorted.forEach((s, idx) => { s.order_index = idx + 1; });
    }

    const updatedList = [...sorted].sort((a, b) => a.order_index - b.order_index);
    setHeroSlides(updatedList);

    await Promise.all([
      db.saveHeroSlide(currentSlide),
      db.saveHeroSlide(targetSlide)
    ]);
    showToast('Slide arrangement updated! ↕️');
  };

  const handleDeleteSlide = async (id: string, title: string) => {
    if (!confirm(`Delete banner slide "${title}"?`)) return;
    await db.deleteHeroSlide(id);
    setHeroSlides(heroSlides.filter(s => s.id !== id));
    showToast('Slide deleted! 🗑️');
    db.addAuditLog('Deleted Hero Slide', title);
  };

  // Store & Receipt Settings
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStoreSettings(true);
    const targetStoreType: 'online' | 'offline' = isOnline ? 'online' : 'offline';
    try {
      await db.updateStoreSettings({
        id: targetStoreType,
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
      }, targetStoreType);
      showToast(`${isOnline ? 'Online' : 'Offline'} Store & POS settings saved! ⚙️`);
      await db.addAuditLog(`Updated ${isOnline ? 'Online' : 'Offline'} Settings`, `UPI: ${storeUpiId}`);
    } catch (err) {
      showToast('Failed to update settings ❌');
    } finally {
      setIsSavingStoreSettings(false);
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    await db.updateOrderStatus(orderId, newStatus);
    await refreshData();
    showToast(`Order marked as ${newStatus}!`);
  };

  const handleSendWhatsApp = (order: OnlineOrder) => {
    const cleanPhone = order.customer_phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = `Hi ${order.customer_name}, this is NayaKart regarding your order ${order.id}. Current status: ${order.status.toUpperCase()}. Total amount: ₹${order.total_amount}. Let us know if you need any assistance!`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Lists
  const filteredOrders = useMemo(() => {
    return onlineOrders.filter(order => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch = !q || 
        order.id.toLowerCase().includes(q) || 
        order.customer_name.toLowerCase().includes(q) || 
        order.customer_phone.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [onlineOrders, orderStatusFilter, orderSearchQuery]);

  const filteredLogs = useMemo(() => {
    if (!logSearchQuery) return logs;
    const q = logSearchQuery.toLowerCase();
    return logs.filter(l => 
      l.action.toLowerCase().includes(q) || 
      l.worker_email.toLowerCase().includes(q) ||
      (l.details?.item_name && String(l.details.item_name).toLowerCase().includes(q))
    );
  }, [logs, logSearchQuery]);

  const pendingOrdersCount = onlineOrders.filter(o => o.status === 'pending').length;
  const completedOrdersCount = onlineOrders.filter(o => o.status === 'completed').length;
  const cancelledOrdersCount = onlineOrders.filter(o => o.status === 'cancelled').length;
  const completedRevenue = onlineOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Swatch colors
  const colorPalette = ['#8B4513', '#C87D55', '#E07A5F', '#D4A373', '#81B29A', '#3D5A80', '#98C1D9', '#EE6C4D'];

  if (showAccessDenied) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#361B0E] mb-2">Access Denied</h2>
          <p className="text-sm text-[#7C6053] mb-6">
            You need Super Admin privileges to view the Management Desk.
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-2.5 px-4 bg-[#8B4513] hover:bg-[#63300C] text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[#EADBCE]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#361B0E] tracking-tight">
              {isOrdersMode ? 'Customer Orders' : 'Admin Management Desk'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isOrdersMode
                ? 'bg-emerald-100 text-emerald-800'
                : isOnline 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-900'
            }`}>
              {isOrdersMode ? '🛍️ Live Orders Hub' : isOnline ? '🌐 Online Hub' : '🏪 Counter Hub'}
            </span>
          </div>
          <p className="text-sm text-[#7C6053] mt-1">
            {isOrdersMode
              ? 'Track, fulfill and manage online orders placed by customers in real-time.'
              : isOnline 
              ? 'Configure staff permissions, storefront categories, hero promotional banners & store settings.' 
              : 'Configure showroom counter staff, in-store categories, thermal POS receipts & audit trail.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#63300C] bg-[#FAF2EB] hover:bg-[#F3E3D3] border border-[#EADBCE] rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* High-Level Executive Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {isOrdersMode ? (
          <>
            <div 
              onClick={() => setOrderStatusFilter('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'all' 
                  ? 'bg-[#FAF2EB] border-[#8B4513] shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6053]">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingCart size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#361B0E] mt-2">{onlineOrders.length}</p>
              <p className="text-[11px] font-semibold text-[#7C6053] mt-1">All customer orders</p>
            </div>

            <div 
              onClick={() => setOrderStatusFilter('pending')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'pending' 
                  ? 'bg-amber-50 border-amber-600 shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-amber-500/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">Pending</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-2">{pendingOrdersCount}</p>
              <p className="text-[11px] font-semibold text-amber-700 mt-1">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} require fulfillment` : 'All caught up'}
              </p>
            </div>

            <div 
              onClick={() => setOrderStatusFilter('completed')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'completed' 
                  ? 'bg-emerald-50 border-emerald-600 shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-emerald-500/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-800">Completed</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-2">{completedOrdersCount}</p>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">Fulfilled orders</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6053]">Completed Value</span>
                <div className="w-8 h-8 rounded-lg bg-[#FAF2EB] text-[#8B4513] flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#361B0E] mt-2">₹{completedRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-semibold text-[#7C6053] mt-1">{cancelledOrdersCount} cancelled</p>
            </div>
          </>
        ) : (
          <>
            <div 
              onClick={() => handleTabChange('workers')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'workers' 
                  ? 'bg-[#FAF2EB] border-[#8B4513] shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6053]">Staff Workers</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#361B0E] mt-2">{workers.length}</p>
              <p className="text-[11px] font-semibold text-amber-700 mt-1">
                {pendingWorkers.length > 0 ? `${pendingWorkers.length} pending approval` : 'Fully approved'}
              </p>
            </div>

            <div 
              onClick={() => handleTabChange('categories')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'categories' 
                  ? 'bg-[#FAF2EB] border-[#8B4513] shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6053]">Categories</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Tag size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#361B0E] mt-2">{categories.length}</p>
              <p className="text-[11px] font-semibold text-purple-700 mt-1">Active categories</p>
            </div>

            {isOnline ? (
              <div 
                onClick={() => handleTabChange('hero')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'hero' 
                    ? 'bg-[#FAF2EB] border-[#8B4513] shadow-xs' 
                    : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7C6053]">Hero Banners</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                    <ImageIcon size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#361B0E] mt-2">{heroSlides.length}</p>
                <p className="text-[11px] font-semibold text-rose-700 mt-1">Storefront slides</p>
              </div>
            ) : (
              <div 
                onClick={() => navigate('/adminoffline/ledger')}
                className="p-4 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7C6053]">POS Ledger</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Receipt size={16} />
                  </div>
                </div>
                <p className="text-lg font-bold text-[#361B0E] mt-2">Active</p>
                <p className="text-[11px] font-semibold text-amber-800 mt-1">Sales & Purchasing</p>
              </div>
            )}

            <div 
              onClick={() => handleTabChange('settings')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-[#FAF2EB] border-[#8B4513] shadow-xs' 
                  : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/40 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6053]">Store Config</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Sliders size={16} />
                </div>
              </div>
              <p className="text-lg font-bold text-[#361B0E] mt-2">Ready</p>
              <p className="text-[11px] font-semibold text-[#8B4513] mt-1">UPI & POS Receipts</p>
            </div>
          </>
        )}
      </div>

      {/* Sub-Tab Bar - ONLY on Admin Desk (Orders view has dedicated status pills and search) */}
      {!isOrdersMode && (
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F5ECE3] rounded-2xl border border-[#EADBCE] mb-6 overflow-x-auto">
          <button
            onClick={() => handleTabChange('workers')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'workers'
                ? 'bg-[#8B4513] text-white shadow-xs'
                : 'text-[#7C6053] hover:text-[#361B0E] hover:bg-white/50'
            }`}
          >
            <Users size={15} />
            <span>Staff & Access</span>
            {pendingWorkers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('categories')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-[#8B4513] text-white shadow-xs'
                : 'text-[#7C6053] hover:text-[#361B0E] hover:bg-white/50'
            }`}
          >
            <Tag size={15} />
            <span>Categories</span>
          </button>

          {isOnline && (
            <button
              onClick={() => handleTabChange('hero')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'hero'
                  ? 'bg-[#8B4513] text-white shadow-xs'
                  : 'text-[#7C6053] hover:text-[#361B0E] hover:bg-white/50'
              }`}
            >
              <ImageIcon size={15} />
              <span>Hero Banners</span>
            </button>
          )}

          <button
            onClick={() => handleTabChange('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#8B4513] text-white shadow-xs'
                : 'text-[#7C6053] hover:text-[#361B0E] hover:bg-white/50'
            }`}
          >
            <Sliders size={15} />
            <span>Store & POS Config</span>
          </button>

          <button
            onClick={() => handleTabChange('logs')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#8B4513] text-white shadow-xs'
                : 'text-[#7C6053] hover:text-[#361B0E] hover:bg-white/50'
            }`}
          >
            <Activity size={15} />
            <span>Audit Trail</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE]">
          <RefreshCw size={28} className="animate-spin text-[#8B4513] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#7C6053]">Loading administrative records...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. ORDERS TAB */}
          {/* ========================================================================= */}
          {(isOrdersMode || activeTab === 'orders') && isOnline && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {(['all', 'pending', 'completed', 'cancelled'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#8B4513] text-white shadow-xs'
                          : 'bg-[#FAF2EB] text-[#7C6053] hover:bg-[#F3E3D3]'
                      }`}
                    >
                      {st} {st === 'pending' && pendingOrdersCount > 0 ? `(${pendingOrdersCount})` : ''}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C6053]" />
                  <input
                    type="text"
                    placeholder="Search by ID, name or phone..."
                    value={orderSearchQuery}
                    onChange={e => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF2EB] text-[#8B4513] flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={28} />
                  </div>
                  <h3 className="text-base font-bold text-[#361B0E]">No orders found</h3>
                  <p className="text-xs text-[#7C6053] mt-1 max-w-sm mx-auto">
                    {orderSearchQuery ? 'No customer orders match your search criteria.' : 'Customer orders placed through your online storefront will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-2xl border border-[#EADBCE] shadow-xs p-5 flex flex-col justify-between hover:border-[#8B4513]/40 transition-all"
                    >
                      <div>
                        {/* Header: ID, Date, Amount */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F2E7DC]">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#8B4513] bg-[#FAF2EB] px-2 py-0.5 rounded-md">
                                {order.id}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7C6053] mt-1">
                              {order.created_at ? new Date(order.created_at).toLocaleString() : 'Recent'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#361B0E]">₹{order.total_amount}</span>
                            <p className="text-[10px] text-[#7C6053] capitalize">
                              {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏪 Counter Pickup'}
                            </p>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="py-3 text-xs space-y-1 text-[#361B0E]">
                          <p className="font-semibold">{order.customer_name}</p>
                          <p className="text-[#7C6053] flex items-center gap-1.5">
                            <Phone size={11} /> {order.customer_phone}
                          </p>
                          {order.address && (
                            <p className="text-[#7C6053] text-[11px]">📍 {order.address}</p>
                          )}
                          {order.transaction_id && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold mt-1">
                              <span>UTR/Txn: {order.transaction_id}</span>
                            </div>
                          )}
                        </div>

                        {/* Items Breakdown */}
                        <div className="py-2 border-t border-[#F2E7DC]">
                          <p className="text-[11px] font-bold text-[#7C6053] mb-1.5">Ordered Items:</p>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-[#361B0E] bg-[#FAF2EB] px-2.5 py-1 rounded-lg">
                                <span>{item.name} <strong className="text-[#8B4513]">×{item.quantity}</strong></span>
                                <span className="font-semibold">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <p className="text-[11px] text-[#7C6053] italic mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#F2E7DC] flex items-center justify-between gap-2 mt-3">
                        <button
                          onClick={() => handleSendWhatsApp(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. STAFF & ACCESS TAB */}
          {/* ========================================================================= */}
          {!isOrdersMode && activeTab === 'workers' && (
            <div className="space-y-6">
              {/* Pending Signup Approvals Banner */}
              {pendingWorkers.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-amber-700" />
                    <h3 className="text-sm font-bold text-amber-900">
                      Pending Staff Signup Requests ({pendingWorkers.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {pendingWorkers.map(pw => (
                      <div key={pw.id} className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#361B0E]">{pw.name || 'New Staff'}</p>
                          <p className="text-[11px] text-[#7C6053]">{pw.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprovePending(pw.id, pw.email)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectPending(pw.id, pw.email)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer"
                          >
                            <X size={12} /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two Column Layout: Add Staff Form + Active Staff List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Add Worker Form */}
                <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs h-fit">
                  <h3 className="text-sm font-bold text-[#361B0E] mb-3 flex items-center gap-2">
                    <Plus size={16} className="text-[#8B4513]" /> Add Staff Member
                  </h3>
                  <form onSubmit={handleAddWorker} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="worker@nayakart.in"
                        value={workerEmail}
                        onChange={e => setWorkerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Set Password</label>
                      <div className="relative">
                        <input
                          type={showWorkerPassword ? "text" : "password"}
                          placeholder="Temporary password..."
                          value={workerPassword}
                          onChange={e => setWorkerPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513] pr-9"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowWorkerPassword(!showWorkerPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7C6053] hover:text-[#361B0E]"
                        >
                          {showWorkerPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-[#8B4513] hover:bg-[#63300C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Add Staff Account
                    </button>
                  </form>
                </div>

                {/* Right: Active Staff List */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#361B0E]">Active Staff Accounts ({workers.length})</h3>
                  </div>

                  {workers.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-[#EADBCE] text-center text-xs text-[#7C6053]">
                      No active workers registered yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {workers.map(w => (
                        <div 
                          key={w.id} 
                          className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#361B0E]">{w.email}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF2EB] text-[#8B4513]">
                                Staff
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7C6053] font-mono mt-0.5">
                              Status: Verified Staff Account
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => handleRemoveWorker(w.id, w.email)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Revoke Access
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. CATEGORIES TAB */}
          {/* ========================================================================= */}
          {!isOrdersMode && activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Category Creator / Editor */}
              <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#361B0E] flex items-center gap-2">
                    <Tag size={16} className="text-[#8B4513]" />
                    {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  {editingCategoryId && (
                    <button
                      onClick={() => {
                        setEditingCategoryId(null);
                        setNewCatName('');
                        setNewCatImageUrl('');
                      }}
                      className="text-xs text-[#7C6053] hover:text-[#361B0E] underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Silicone Cake Moulds, Couverture Chocolate..."
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Store Assignment</label>
                      <select
                        value={newCatStoreType}
                        onChange={e => setNewCatStoreType(e.target.value as 'online' | 'offline')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                      >
                        <option value="online">Online Web Store</option>
                        <option value="offline">Offline Counter Showroom</option>
                      </select>
                    </div>
                  </div>

                  {/* Swatch & Upload */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#7C6053]">Color Swatch:</span>
                      <div className="flex items-center gap-1.5">
                        {colorPalette.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCatColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                              newCatColor === c ? 'scale-125 ring-2 ring-offset-2 ring-[#8B4513]' : 'hover:scale-110'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-[#FAF2EB] hover:bg-[#F3E3D3] text-[#63300C] text-xs font-semibold rounded-xl border border-[#EADBCE] cursor-pointer transition-all">
                        {isUploadingCatImage ? 'Uploading...' : 'Upload Icon/Image'}
                        <input type="file" accept="image/*" onChange={handleCatImageUpload} className="hidden" />
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#8B4513] hover:bg-[#63300C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        {editingCategoryId ? 'Update Category' : 'Save Category'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <div 
                    key={cat.id} 
                    className="bg-white rounded-2xl border border-[#EADBCE] p-4 shadow-xs flex flex-col justify-between hover:border-[#8B4513]/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shadow-xs" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#7C6053]">
                          {(cat as any).store_type || 'offline'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#361B0E] line-clamp-1">{cat.name}</h4>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-[#F2E7DC]">
                      <button
                        onClick={() => handleEditCategoryClick(cat)}
                        className="p-1.5 rounded-lg text-[#7C6053] hover:text-[#8B4513] hover:bg-[#FAF2EB] transition-colors"
                        title="Edit category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. HERO BANNERS TAB */}
          {/* ========================================================================= */}
          {!isOrdersMode && activeTab === 'hero' && isOnline && (
            <div className="space-y-6">
              {/* Add / Edit Banner Form */}
              <div id="hero-slide-form" className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#361B0E] flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#8B4513]" /> 
                    {editingSlideId ? 'Edit Hero Carousel Slide' : 'Add Homepage Hero Carousel Slide'}
                  </h3>
                  {editingSlideId && (
                    <button
                      type="button"
                      onClick={handleCancelEditSlide}
                      className="text-xs font-semibold text-[#8B4513] hover:underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleSaveSlide} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Banner Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Belgian Chocolate Fest"
                        value={newSlideTitle}
                        onChange={e => setNewSlideTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#7C6053] mb-1">Subtitle / Offer Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 15% off on all couverture chocolate slabs"
                        value={newSlideSubtitle}
                        onChange={e => setNewSlideSubtitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                        required
                      />
                    </div>
                  </div>

                  {newSlideImageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-[#FDFBF7] rounded-xl border border-[#EADBCE]">
                      <img src={newSlideImageUrl} alt="Preview" className="w-16 h-10 object-cover rounded-lg border border-[#EADBCE]" />
                      <div className="text-[11px] text-[#7C6053] truncate flex-1">{newSlideImageUrl}</div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAF2EB] hover:bg-[#F3E3D3] text-[#63300C] text-xs font-semibold rounded-xl border border-[#EADBCE] cursor-pointer transition-all">
                      <ImageIcon size={14} />
                      <span>{isUploadingSlide ? 'Uploading banner...' : newSlideImageUrl ? 'Replace Banner Image' : 'Upload Banner Image'}</span>
                      <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                    </label>

                    <div className="flex items-center gap-2">
                      {editingSlideId && (
                        <button
                          type="button"
                          onClick={handleCancelEditSlide}
                          className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#7C6053] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!newSlideImageUrl}
                        className="px-4 py-2 bg-[#8B4513] hover:bg-[#63300C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {editingSlideId ? 'Save Changes' : 'Publish Banner Slide'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Current Slides */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#361B0E]">Current Slides ({heroSlides.length})</h3>
                {heroSlides.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[#EADBCE] text-center text-xs text-[#7C6053]">
                    No homepage promo slides uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...heroSlides].sort((a, b) => a.order_index - b.order_index).map((slide, index, arr) => (
                      <div 
                        key={slide.id} 
                        className={`bg-white rounded-2xl border ${editingSlideId === slide.id ? 'border-[#8B4513] ring-2 ring-[#8B4513]/20' : 'border-[#EADBCE]'} overflow-hidden shadow-xs flex flex-col justify-between transition-all`}
                      >
                        <div className="relative">
                          <img 
                            src={slide.image_url} 
                            alt={slide.title} 
                            className="w-full h-36 object-cover bg-neutral-100"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                            Slide #{index + 1}
                          </span>
                        </div>
                        <div className="p-3.5 flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-xs font-bold text-[#361B0E] truncate">{slide.title}</h4>
                            <p className="text-[11px] text-[#7C6053] mt-0.5 line-clamp-1">{slide.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Reordering Arrows */}
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-[#7C6053] hover:text-[#361B0E] hover:bg-[#FAF2EB] rounded-lg transition-colors disabled:opacity-25 disabled:pointer-events-none"
                              title="Move slide up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(index, 'down')}
                              disabled={index === arr.length - 1}
                              className="p-1.5 text-[#7C6053] hover:text-[#361B0E] hover:bg-[#FAF2EB] rounded-lg transition-colors disabled:opacity-25 disabled:pointer-events-none"
                              title="Move slide down"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditSlide(slide)}
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit slide text and image"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(slide.id, slide.title)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete slide"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. STORE & POS SETTINGS TAB */}
          {/* ========================================================================= */}
          {!isOrdersMode && activeTab === 'settings' && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Digital Payments & Store Contact */}
                <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#361B0E] flex items-center gap-2 border-b border-[#F2E7DC] pb-3">
                    <Sliders size={16} className="text-[#8B4513]" /> Digital Payments & Store Info
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-[#7C6053] mb-1">Store UPI VPA (for QR payments)</label>
                    <input
                      type="text"
                      value={storeUpiId}
                      onChange={e => setStoreUpiId(e.target.value)}
                      placeholder="e.g. anshajshaji3-2@okicici"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7C6053] mb-1">Customer Support Phone</label>
                    <input
                      type="text"
                      value={storePhoneNumber}
                      onChange={e => setStorePhoneNumber(e.target.value)}
                      placeholder="e.g. 919778052356"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7C6053] mb-1">Store Operating Hours</label>
                    <input
                      type="text"
                      value={footerHours}
                      onChange={e => setFooterHours(e.target.value)}
                      placeholder="e.g. 9:00 AM - 8:30 PM"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7C6053] mb-1">Store Description (Footer / About)</label>
                    <textarea
                      value={footerDescription}
                      onChange={e => setFooterDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                    />
                  </div>
                </div>

                {/* Right Card: Counter Thermal Receipt & Order Sequence */}
                <div className="bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#361B0E] flex items-center gap-2 border-b border-[#F2E7DC] pb-3">
                    <Receipt size={16} className="text-[#8B4513]" /> Counter Thermal Receipt (POS)
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Header Line 1 (Store Name)</label>
                      <input
                        type="text"
                        value={receiptH1}
                        onChange={e => setReceiptH1(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Header Line 2 (Location)</label>
                      <input
                        type="text"
                        value={receiptH2}
                        onChange={e => setReceiptH2(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Header Line 3 (Phone)</label>
                      <input
                        type="text"
                        value={receiptH3}
                        onChange={e => setReceiptH3(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Header Line 4 (GSTIN)</label>
                      <input
                        type="text"
                        value={receiptH4}
                        onChange={e => setReceiptH4(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Invoice Prefix</label>
                      <input
                        type="text"
                        value={orderIdPrefix}
                        onChange={e => setOrderIdPrefix(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Start Sequence #</label>
                      <input
                        type="number"
                        value={orderIdSequence}
                        onChange={e => setOrderIdSequence(parseInt(e.target.value) || 1000)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Footer Line 1 (Store Sign-off)</label>
                      <input
                        type="text"
                        value={receiptF1}
                        onChange={e => setReceiptF1(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                        placeholder="For :  NAYAKART"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6053] mb-1">Footer Greeting Line</label>
                      <input
                        type="text"
                        value={receiptF2}
                        onChange={e => setReceiptF2(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7]"
                        placeholder="Thank you . . .      Visit Again . . ."
                      />
                    </div>
                  </div>

                  {/* Thermal Receipt Live Preview */}
                  <div className="pt-4 border-t border-[#F2E7DC]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#361B0E]">Live Receipt Preview</span>
                      <span className="text-[10px] text-[#7C6053] font-medium bg-[#F5EDE4] px-2 py-0.5 rounded-full">Thermal 80mm</span>
                    </div>
                    <div className="flex justify-center p-3 bg-[#FAF5F0] rounded-xl border border-[#EADBCE] overflow-x-auto">
                      <div
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #d4d4d8',
                          padding: '1.5rem',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          whiteSpace: 'pre',
                          color: '#000',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          minWidth: '350px'
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          {receiptH1}<br />
                          {receiptH2}<br />
                          {receiptH3}<br />
                          {receiptH4}
                        </div>
                        <br />
                        Invoice No: {(orderIdPrefix || '')}1234       Date :08-07-2026<br />
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
                          {receiptF1 || ('For :  ' + (receiptH1 || ''))}<br />
                          {receiptF2}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingStoreSettings}
                  className="px-6 py-2.5 bg-[#8B4513] hover:bg-[#63300C] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingStoreSettings ? 'Saving Configuration...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 6. AUDIT TRAIL TAB */}
          {/* ========================================================================= */}
          {!isOrdersMode && activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-xs flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C6053]" />
                  <input
                    type="text"
                    placeholder="Search logs by staff email or action..."
                    value={logSearchQuery}
                    onChange={e => setLogSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#EADBCE] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
                <span className="text-xs text-[#7C6053] hidden sm:inline">
                  Showing {filteredLogs.length} events
                </span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-[#EADBCE] text-center text-xs text-[#7C6053]">
                  No audit log entries found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="bg-white p-3.5 rounded-xl border border-[#EADBCE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#8B4513]" />
                        <div>
                          <p className="text-xs font-bold text-[#361B0E]">{log.action}</p>
                          <p className="text-[11px] text-[#7C6053]">
                            By <strong className="text-[#361B0E]">{log.worker_email}</strong>
                            {log.details?.item_name && ` — ${String(log.details.item_name)}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#7C6053] font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
