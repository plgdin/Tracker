import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Item, Category } from '../lib/db';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warningDays, setWarningDays] = useState(7);
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

  // Filtered & Sorted Items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const days = getDaysRemaining(item.expiration_date);
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Expired' ? days < 0 :
        statusFilter === 'Expiring Soon' ? (days >= 0 && days <= warningDays) : // dynamic warning period setting!
        statusFilter === 'Fresh' ? days > warningDays : true;

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
        return b.name.localeCompare(b.name);
      }
      return 0;
    });

  // Cartoon Cute Milk Carton SVG Component
  const MilkCartonIcon = ({ winking = false }) => (
    <svg viewBox="0 0 60 70" width="40" height="45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 52V28L30 18L45 28V52C45 54.2 43.2 56 41 56H19C16.8 56 15 54.2 15 52Z" fill="#FFFDF9" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 28H45" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18V28" stroke="#5C5552" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M30 18L15 28" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18L45 28" stroke="#5C5552" strokeWidth="2.5" />
      {winking ? (
        <>
          <path d="M22 36L25 38L22 40" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="35" cy="38" r="2" fill="#5C5552" />
        </>
      ) : (
        <>
          <circle cx="23" cy="38" r="2.2" fill="#5C5552" />
          <circle cx="35" cy="38" r="2.2" fill="#5C5552" />
        </>
      )}
      <path d="M26 43C27 44.5 29 44.5 30 43" stroke="#5C5552" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

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

            return (
              <div 
                key={item.id} 
                className="cute-card"
                onClick={() => navigate(`/add-item?edit=${item.id}`)}
              >
                <div className="cute-card-qty">{item.quantity}</div>
                
                <div className="cute-card-illustration">
                  <MilkCartonIcon winking={daysRemaining <= warningDays} />
                  <span className="cute-card-name">{item.name}</span>
                </div>

                <div 
                  className={`cute-card-days-band ${
                    daysRemaining < 0 ? '' : daysRemaining <= warningDays ? 'warning' : 'fresh'
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
