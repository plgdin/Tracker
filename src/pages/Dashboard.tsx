import { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { addDays, isBefore, parseISO } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringItems = async () => {
      // 7 days from now
      const thresholdDate = addDays(new Date(), 7).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('items')
        .select('*')
        .lte('expiration_date', thresholdDate)
        .order('expiration_date', { ascending: true });
        
      if (data) {
        setExpiringItems(data);
      }
      setLoading(false);
    };

    fetchExpiringItems();
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back, {profile?.name || 'Worker'}</p>
      </header>
      
      <div className="glass-panel" style={{ marginBottom: '2rem', borderColor: expiringItems.length > 0 ? 'var(--color-danger)' : 'var(--glass-border)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: expiringItems.length > 0 ? 'var(--color-danger)' : 'inherit' }}>
          <AlertTriangle size={24} />
          Expiring Soon (Next 7 Days)
        </h2>
        
        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Loading items...</p>
        ) : expiringItems.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>No items expiring soon. Good job!</p>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expiringItems.map(item => {
              const isExpired = isBefore(parseISO(item.expiration_date), new Date());
              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--color-danger)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-danger)' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Qty: {item.quantity}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger">{isExpired ? 'EXPIRED' : item.expiration_date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fab" onClick={() => navigate('/add-item')}>
        <Plus size={24} />
      </div>
    </div>
  );
}
