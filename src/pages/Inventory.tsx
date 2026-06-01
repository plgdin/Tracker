import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Trash2 } from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('expiration_date', { ascending: true });
      
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    // Optimistic UI update
    setItems(items.filter(item => item.id !== id));

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      alert('Failed to delete item');
      fetchItems(); // Revert on failure
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Inventory</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>All your tracked food items</p>
      </header>
      
      <div className="glass-panel">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading inventory...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Package size={48} color="var(--color-text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>No items yet. Add one from the Dashboard!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0' }}>{item.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <span>Exp: {item.expiration_date}</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
