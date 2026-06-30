import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Item } from '../lib/db';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function Inventory() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const showToast = useToastStore(state => state.showToast);
  const isAdmin = profile?.role === 'admin';

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const cachedItems = JSON.parse(localStorage.getItem('tracker_items') || '[]') as Item[];
        if (cachedItems.length > 0) setItems(cachedItems);
        setLoading(false);

        const fetchedItems = await db.getItems();
        setItems(fetchedItems);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <p className="admin-page-subtitle">Manage your store's product catalog</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            style={{ 
              width: '100%', 
              padding: '0.85rem 1rem 0.85rem 3rem', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              fontSize: '0.95rem'
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/add-item')}
          style={{ borderRadius: '8px', padding: '0.85rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading products...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No products found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EFEBE8', color: 'var(--color-text-secondary)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #EFEBE8', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                      <Package size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Featured</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {item.category || '-'}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Rs.{(item.price || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.35rem',
                      background: 'rgba(52, 211, 153, 0.15)', 
                      color: '#059669', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      ✓ In Stock
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/add-item?edit=${item.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        <Edit2 size={16} />
                      </button>
                      {isAdmin && (
                        <button onClick={(e) => handleDeleteItem(e, item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
