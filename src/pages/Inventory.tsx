import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Item, Category } from '../lib/db';
import { Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import MilkCarton from '../components/MilkCarton';

export default function Inventory() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const showToast = useToastStore(state => state.showToast);
  const isAdmin = profile?.role === 'admin';

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warningDays, setWarningDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedItems, fetchedCategories, fetchedSettings] = await Promise.all([
          db.getItems(),
          db.getCategories(),
          db.getSettings()
        ]);
        setItems(fetchedItems);
        setCategories(fetchedCategories);
        setWarningDays(fetchedSettings.warning_period_days);
      } catch (err) {
        console.error('Error fetching inventory:', err);
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

  const handleDeleteItem = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await db.deleteItem(item.id);
      await db.addAuditLog('Deleted Product', item.name);
      setItems(items.filter(i => i.id !== item.id));
      showToast('Item deleted! 🗑️');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filtered & Sorted Items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const days = getDaysRemaining(item.expiration_date);

      // Determine if item is "Expiring Soon" based on warning_date or dynamic warningDays
      let isExpiringSoon = false;
      if (item.warning_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const warningDate = new Date(item.warning_date);
        warningDate.setHours(0, 0, 0, 0);
        const expiryDate = new Date(item.expiration_date);
        expiryDate.setHours(0, 0, 0, 0);
        isExpiringSoon = today.getTime() >= warningDate.getTime() && today.getTime() <= expiryDate.getTime();
      } else {
        isExpiringSoon = days >= 0 && days <= warningDays;
      }

      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Expired' ? days < 0 :
        statusFilter === 'Expiring Soon' ? isExpiringSoon :
        statusFilter === 'Fresh' ? (!isExpiringSoon && days >= 0) : true;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
      }
      if (sortBy === 'date-desc') {
        return new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  return (
    <div className="container">
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ display: 'inline-block' }}>All Items</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Your complete tracked inventory</p>
      </header>

      {/* Filters panel */}
      <div className="panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="input-field" 
            style={{ paddingLeft: '2.5rem' }} 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            style={{ flex: 1, minWidth: '110px' }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select 
            className="input-field" 
            style={{ flex: 1, minWidth: '110px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Expired">Expired</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Fresh">Fresh</option>
          </select>

          <select 
            className="input-field" 
            style={{ flex: 1, minWidth: '110px' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date-asc">Expiry (Newest First)</option>
            <option value="date-desc">Expiry (Oldest First)</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading...</p>
      ) : filteredItems.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No items found.</p>
        </div>
      ) : (
        <div className="items-grid" style={{ paddingBottom: '6rem' }}>
          {filteredItems.map(item => {
            const daysRemaining = getDaysRemaining(item.expiration_date);
            let daysLabel = `${daysRemaining} d`;
            if (daysRemaining < 0) daysLabel = 'Expired';
            else if (daysRemaining === 0) daysLabel = 'Today';

            // Determine warning state
            let isWarning = false;
            if (item.warning_date) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const warningDate = new Date(item.warning_date);
              warningDate.setHours(0, 0, 0, 0);
              const expiryDate = new Date(item.expiration_date);
              expiryDate.setHours(0, 0, 0, 0);
              isWarning = today.getTime() >= warningDate.getTime() && today.getTime() <= expiryDate.getTime();
            } else {
              isWarning = daysRemaining >= 0 && daysRemaining <= warningDays;
            }

            return (
              <div 
                key={item.id} 
                className="cute-card"
                onClick={() => navigate(`/add-item?edit=${item.id}`)}
                style={{ position: 'relative' }}
              >
                <div className="cute-card-qty">{item.quantity}</div>

                {/* Admin-only delete button */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteItem(e, item)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(230, 57, 70, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      zIndex: 5,
                      boxShadow: '0 2px 6px rgba(230, 57, 70, 0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                
                <div className="cute-card-illustration">
                  <MilkCarton daysRemaining={daysRemaining} size={50} />
                  <span className="cute-card-name">{item.name}</span>
                  {item.price !== undefined && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--color-primary)', 
                      fontWeight: 'bold', 
                      backgroundColor: 'rgba(230, 57, 70, 0.08)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '8px',
                      marginTop: '0.15rem',
                      display: 'inline-block'
                    }}>
                      ${item.price.toFixed(2)}
                    </span>
                  )}
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
  );
}
