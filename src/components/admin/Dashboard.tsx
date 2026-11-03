import React, { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  X, 
  ArrowRight, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { db } from '../../lib/db';
import type { Item } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import MilkCarton from '../../components/MilkCarton';

interface RuixenTabProps {
  icon: React.ElementType;
  title: string;
  badge?: string | number;
  selected: boolean;
  onClick: () => void;
}

const RuixenTab: React.FC<RuixenTabProps> = ({
  icon: Icon,
  title,
  badge,
  selected,
  onClick,
}) => {
  const tabRef = useRef<HTMLDivElement>(null);

  const xPercent = useMotionValue(100);
  const yPercent = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(120px 60px at ${xPercent}% ${yPercent}%, black, transparent)`;

  useEffect(() => {
    if (!tabRef.current || !selected) return;

    xPercent.set(0);
    yPercent.set(0);
    const { height, width } = tabRef.current?.getBoundingClientRect() || { height: 44, width: 220 };
    const circumference = height * 2 + width * 2;
    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    animate(xPercent, [0, 100, 100, 0, 0], {
      duration: 4,
      times,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    animate(yPercent, [0, 0, 100, 100, 0], {
      times,
      duration: 4,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
  }, [selected, xPercent, yPercent]);

  return (
    <div
      ref={tabRef}
      onClick={onClick}
      className={`border rounded-xl flex items-center gap-2 pr-4 py-2 relative cursor-pointer transition-all duration-300 select-none ${
        selected
          ? 'bg-[#FAF2EB] border-[#8B4513]/40 shadow-xs'
          : 'bg-white border-[#EADBCE] hover:border-[#8B4513]/30'
      }`}
    >
      {selected && (
        <motion.div
          style={{ maskImage }}
          className="absolute inset-0 -m-px border-2 border-[#C87D55] rounded-xl pointer-events-none"
        />
      )}

      <div className={`h-8 w-8 px-2 py-1 rounded-lg ml-3 inline-flex items-center justify-center transition-colors ${
        selected ? 'bg-[#8B4513] text-white' : 'bg-[#FAF2EB] text-[#8B4513]'
      }`}>
        <Icon size={16} />
      </div>
      <div className="text-xs sm:text-sm font-semibold text-[#361B0E]">{title}</div>
      {badge !== undefined && (
        <div className={`rounded-lg px-2 py-0.5 font-bold text-xs ml-auto ${
          selected ? 'bg-[#8B4513] text-white' : 'bg-[#FAF2EB] text-[#8B4513] border border-[#EADBCE]'
        }`}>
          {badge}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [warningDays, setWarningDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [bannerWink, setBannerWink] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  const isOnline = window.location.pathname.includes('online');
  const basePath = isOnline ? '/adminonline' : '/adminoffline';

  // Winks the warning carton periodically on the home page
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerWink(true);
      setTimeout(() => setBannerWink(false), 800);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const storeKey = isOnline ? 'online' : 'offline';
        const cachedItems = JSON.parse(
          localStorage.getItem(`tracker_items_${storeKey}`) || 
          localStorage.getItem('tracker_items') || 
          '[]'
        ) as Item[];
        const cachedSettings = JSON.parse(localStorage.getItem('tracker_settings') || '{"warning_period_days":30}');
        if (cachedItems.length > 0) {
          setItems(cachedItems.sort(
            (a: Item, b: Item) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
          ));
          setWarningDays(cachedSettings.warning_period_days ?? 30);
        }
        setLoading(false);

        const [freshItems, freshSettings] = await Promise.all([
          db.getItems(),
          db.getSettings()
        ]);
        setItems(freshItems);
        setWarningDays(freshSettings.warning_period_days);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [isOnline]);

  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiringSoonItems = items.filter(item => {
    if (item.warning_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const warningDate = new Date(item.warning_date);
      warningDate.setHours(0, 0, 0, 0);
      const expiryDate = new Date(item.expiration_date);
      expiryDate.setHours(0, 0, 0, 0);
      return today.getTime() >= warningDate.getTime() && today.getTime() <= expiryDate.getTime();
    }
    const days = getDaysRemaining(item.expiration_date);
    return days >= 0 && days <= warningDays;
  }).sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

  const freshCount = Math.max(0, items.length - expiringSoonItems.length);

  return (
    <div className="w-full pb-16">
      {/* Ruixen-Style Hero Section Header */}
      <div className="text-left mb-8 pb-6 border-b border-[#EADBCE]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#361B0E] tracking-tight">
                NayaKart {isOnline ? 'Online Store' : 'Offline Counter'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isOnline ? '🌐 Online' : '🏪 Offline'}
              </span>
            </div>
            <p className="text-sm text-[#7C6053] tracking-tight mt-1 max-w-2xl">
              Welcome back{profile?.name ? `, ${profile.name}` : ''}! Supercharge your stock control with automated batch freshness tracking and catalog management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`${basePath}/inventory`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#63300C] bg-[#FAF2EB] hover:bg-[#F3E3D3] border border-[#EADBCE] rounded-xl transition-all cursor-pointer"
            >
              <span>View Catalog</span>
              <ArrowRight size={13} />
            </button>
            <button 
              onClick={() => navigate(`${basePath}/add-item`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#8B4513] hover:bg-[#63300C] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ruixen Interactive Animated Feature Tabs with Moving Border Glow */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RuixenTab
            icon={AlertTriangle}
            title={`Expiring Soon (≤${warningDays}d)`}
            badge={loading ? '—' : expiringSoonItems.length}
            selected={activeTab === 0}
            onClick={() => setActiveTab(0)}
          />
          <RuixenTab
            icon={CheckCircle2}
            title="Fresh & Safe Stock"
            badge={loading ? '—' : freshCount}
            selected={activeTab === 1}
            onClick={() => setActiveTab(1)}
          />
          <RuixenTab
            icon={Sparkles}
            title="Total Catalog SKUs"
            badge={loading ? '—' : items.length}
            selected={activeTab === 2}
            onClick={() => setActiveTab(2)}
          />
        </div>
      </div>

      {/* Ruixen-Style Framed Showcase Canvas */}
      <div className="border-2 border-[#EADBCE] rounded-3xl p-4 sm:p-6 bg-white shadow-xs">
        {/* Tab 0: Expiring Soon */}
        {activeTab === 0 && (
          <div>
            {/* Warning alert banner */}
            {showBanner && expiringSoonItems.length > 0 && (
              <div className="notification-banner mb-5">
                <div className="notification-content">
                  <div className="notification-icon-wrapper">
                    <MilkCarton winking={bannerWink} size={40} />
                  </div>
                  <span>
                    <strong>{expiringSoonItems.length} item(s)</strong> require stock rotation or priority sale within {warningDays} days.
                  </span>
                </div>
                <button className="notification-close-btn" onClick={() => setShowBanner(false)}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#361B0E]">Priority Shelf Rotation</h3>
                <p className="text-xs text-[#7C6053]">Click any item to edit batch date, pricing, or stock</p>
              </div>
              {expiringSoonItems.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF2EB] text-[#8B4513] rounded-lg border border-[#EADBCE]">
                  {expiringSoonItems.length} items
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-xs text-[#7C6053]">Loading inventory batches...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-illustration">
                  <MilkCarton winking={true} size={60} />
                </div>
                <p className="empty-state-text">No inventory added yet!</p>
                <button 
                  onClick={() => navigate(`${basePath}/add-item`)}
                  className="btn btn-primary mt-3"
                >
                  <Plus size={15} /> Add First Product
                </button>
              </div>
            ) : expiringSoonItems.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-bold text-[#361B0E] text-base">All stock is completely fresh!</p>
                <p className="text-xs text-[#7C6053] mt-1 max-w-sm mx-auto">
                  None of your {items.length} tracked items are expiring in the next {warningDays} days.
                </p>
              </div>
            ) : (
              <div className="items-grid">
                {expiringSoonItems.map(item => {
                  const daysRemaining = getDaysRemaining(item.expiration_date);
                  let daysLabel = `${daysRemaining} d`;
                  if (daysRemaining < 0) daysLabel = 'Expired';
                  else if (daysRemaining === 0) daysLabel = 'Today';

                  let isWarning: boolean;
                  if (item.warning_date) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const warningDate = new Date(item.warning_date);
                    warningDate.setHours(0, 0, 0, 0);
                    const expiryDate = new Date(item.expiration_date);
                    expiryDate.setHours(0, 0, 0, 0);
                    isWarning = today.getTime() >= warningDate.getTime() && today.getTime() <= expiryDate.getTime();
                  } else {
                    isWarning = daysRemaining >= 0 && daysRemaining <= 3;
                  }

                  return (
                    <div 
                      key={item.id} 
                      className="cute-card"
                      onClick={() => navigate(`${basePath}/add-item?edit=${item.id}`)}
                    >
                      <div className="cute-card-qty">{item.quantity}</div>
                      <div className="cute-card-illustration">
                        <MilkCarton daysRemaining={daysRemaining} size={48} />
                        <span className="cute-card-name">{item.name}</span>
                      </div>
                      <div 
                        className={`cute-card-days-band ${
                          daysRemaining < 0 ? '' : isWarning ? 'warning' : 'fresh'
                        }`}
                      >
                        {daysLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Fresh Stock */}
        {activeTab === 1 && (
          <div className="py-6">
            <div className="text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#361B0E]">
                {freshCount} Products Fresh & Stable
              </h3>
              <p className="text-xs text-[#7C6053] mt-1">
                These products have plenty of shelf life remaining beyond your {warningDays}-day warning threshold.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => navigate(`${basePath}/inventory`)}
                  className="px-4 py-2 bg-[#8B4513] hover:bg-[#63300C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  Inspect Fresh Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Total Catalog Overview & Shortcuts */}
        {activeTab === 2 && (
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#361B0E]">NayaKart Operations Hub</h3>
                <p className="text-xs text-[#7C6053]">Quick shortcuts to manage your store environment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => navigate(`${basePath}/inventory`)}
                className="p-5 rounded-2xl bg-[#FAF2EB] border border-[#EADBCE] hover:border-[#8B4513]/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8B4513] flex items-center justify-center shadow-xs mb-3">
                    <Package size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-[#361B0E]">Inventory & Pricing</h4>
                  <p className="text-xs text-[#7C6053] mt-1">
                    Filter {items.length} items by category, price, GST and expiry status.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B4513] flex items-center gap-1 mt-4">
                  Open Catalog <ArrowRight size={13} />
                </span>
              </div>

              <div 
                onClick={() => navigate(`${basePath}/add-item`)}
                className="p-5 rounded-2xl bg-[#FAF2EB] border border-[#EADBCE] hover:border-[#8B4513]/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8B4513] flex items-center justify-center shadow-xs mb-3">
                    <Plus size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-[#361B0E]">Add New Product</h4>
                  <p className="text-xs text-[#7C6053] mt-1">
                    Enter name, quantity, price, image, GST rate, and expiry dates.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B4513] flex items-center gap-1 mt-4">
                  Create SKU <ArrowRight size={13} />
                </span>
              </div>

              <div 
                onClick={() => navigate(`${basePath}/dashboard`)}
                className="p-5 rounded-2xl bg-[#FAF2EB] border border-[#EADBCE] hover:border-[#8B4513]/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8B4513] flex items-center justify-center shadow-xs mb-3">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-[#361B0E]">Admin Desk</h4>
                  <p className="text-xs text-[#7C6053] mt-1">
                    Manage staff, categories, {isOnline ? 'online orders' : 'receipt printers'}, and settings.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B4513] flex items-center gap-1 mt-4">
                  Enter Desk <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
