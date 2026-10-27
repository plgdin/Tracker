import { useEffect, useState } from 'react';
import { Plus, X, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import type { Item } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import MilkCarton from '../../components/MilkCarton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [warningDays, setWarningDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [bannerWink, setBannerWink] = useState(false);

  // Winks the warning carton periodically on the home page!
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerWink(true);
      setTimeout(() => setBannerWink(false), 800);
    }, 3500); // Winks every 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        // ── Phase 1: Show cached data instantly so the page never gets stuck
        // Pull whatever is already in localStorage so loading=false right away
        const cachedItems = JSON.parse(localStorage.getItem('tracker_items') || '[]') as Item[];
        const cachedSettings = JSON.parse(localStorage.getItem('tracker_settings') || '{"warning_period_days":30}');
        if (cachedItems.length > 0) {
          setItems(cachedItems.sort(
            (a: Item, b: Item) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
          ));
          setWarningDays(cachedSettings.warning_period_days ?? 30);
        }
        setLoading(false);

        // ── Phase 2: Silently fetch fresh data from Supabase in the background
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
  }, []);

  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter items expiring soon based on dynamic warning period or custom warning date
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

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <button className="header-icon-btn" onClick={() => navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/settings`)}>
          <SettingsIcon size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.75rem' }}>Chef N Joy</h1>
          {profile?.name && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
              Welcome back, {profile.name}
            </p>
          )}
        </div>
        <div style={{ width: 40 }} /> {/* Spacer to align title */}
      </header>

      {/* Warning alert banner matching screens */}
      {showBanner && (
        <div className="notification-banner">
          <div className="notification-content">
            <div className="notification-icon-wrapper">
              <MilkCarton winking={bannerWink} size={45} />
            </div>
            <span>
              {expiringSoonItems.length} item(s) will expire in {warningDays} days.
            </span>
          </div>
          <button className="notification-close-btn" onClick={() => setShowBanner(false)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Expiring Soon</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading...</p>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-illustration">
            <MilkCarton winking={true} size={70} />
          </div>
          <p className="empty-state-text">Let's add your first item!</p>
          <div className="empty-state-arrow">↓</div>
        </div>
      ) : expiringSoonItems.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            No items expiring in the next {warningDays} days.
          </p>
        </div>
      ) : (
        /* Grid of Cards matching the screens */
        <div className="items-grid" style={{ paddingBottom: '6rem' }}>
          {expiringSoonItems.map(item => {
            const daysRemaining = getDaysRemaining(item.expiration_date);
            
            // Format dynamic days label
            let daysLabel = `${daysRemaining} d`;
            if (daysRemaining < 0) daysLabel = 'Expired';
            else if (daysRemaining === 0) daysLabel = 'Today';

            // Determine warning state
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
              isWarning = daysRemaining >= 0 && daysRemaining <= 3; // 3 days fallback for winking carton
            }

            return (
              <div 
                key={item.id} 
                className="cute-card"
                onClick={() => navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/add-item?edit=${item.id}`)}
              >
                {/* Quantity badge top right */}
                <div className="cute-card-qty">{item.quantity}</div>
                
                {/* Illustration with label */}
                <div className="cute-card-illustration">
                  <MilkCarton daysRemaining={daysRemaining} size={50} />
                  <span className="cute-card-name">{item.name}</span>

                </div>

                {/* Days remaining band with warning color codes */}
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

      {/* Center FAB plus button */}
      <div className="fab" onClick={() => navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/add-item`)}>
        <Plus size={28} />
      </div>
    </div>
  );
}
