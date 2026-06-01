import { useEffect, useState } from 'react';
import { Plus, X, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import type { Item } from '../lib/db';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [warningDays, setWarningDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedItems, fetchedSettings] = await Promise.all([
          db.getItems(),
          db.getSettings()
        ]);
        setItems(fetchedItems);
        setWarningDays(fetchedSettings.warning_period_days);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
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

  // Filter items expiring soon based on dynamic warning period
  const expiringSoonItems = items.filter(item => {
    const days = getDaysRemaining(item.expiration_date);
    return days >= 0 && days <= warningDays;
  }).sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

  // Cartoon Cute Milk Carton SVG Component
  const MilkCartonIcon = ({ winking = false }) => (
    <svg viewBox="0 0 60 70" width="45" height="50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cartoon carton body */}
      <path d="M15 52V28L30 18L45 28V52C45 54.2 43.2 56 41 56H19C16.8 56 15 54.2 15 52Z" fill="#FFFDF9" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top creasing details */}
      <path d="M15 28H45" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18V28" stroke="#5C5552" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M30 18L15 28" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18L45 28" stroke="#5C5552" strokeWidth="2.5" />
      
      {/* Cute face */}
      {winking ? (
        <>
          {/* Wink eye left */}
          <path d="M22 36L25 38L22 40" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dot eye right */}
          <circle cx="35" cy="38" r="2" fill="#5C5552" />
        </>
      ) : (
        <>
          {/* Standard dots for eyes */}
          <circle cx="23" cy="38" r="2.2" fill="#5C5552" />
          <circle cx="35" cy="38" r="2.2" fill="#5C5552" />
        </>
      )}
      {/* Cheeks */}
      <circle cx="19" cy="42" r="2" fill="#F4A261" opacity="0.6" />
      <circle cx="39" cy="42" r="2" fill="#F4A261" opacity="0.6" />
      {/* Smiling Mouth */}
      <path d="M26 43C27 44.5 29 44.5 30 43" stroke="#5C5552" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <button className="header-icon-btn" onClick={() => navigate('/settings')}>
          <SettingsIcon size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Fresh things</h1>
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
              <MilkCartonIcon winking={expiringSoonItems.length > 0} />
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
            <MilkCartonIcon winking={true} />
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

            return (
              <div 
                key={item.id} 
                className="cute-card"
                onClick={() => navigate(`/add-item?edit=${item.id}`)}
              >
                {/* Quantity badge top right */}
                <div className="cute-card-qty">{item.quantity}</div>
                
                {/* Illustration with label */}
                <div className="cute-card-illustration">
                  <MilkCartonIcon winking={daysRemaining <= 3} />
                  <span className="cute-card-name">{item.name}</span>
                </div>

                {/* Days remaining band with warning color codes */}
                <div 
                  className={`cute-card-days-band ${
                    daysRemaining < 0 ? '' : daysRemaining <= 3 ? 'warning' : 'fresh'
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
      <div className="fab" onClick={() => navigate('/add-item')}>
        <Plus size={28} />
      </div>
    </div>
  );
}
