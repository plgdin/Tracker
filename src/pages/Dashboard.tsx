import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Item, Category, AuditLog } from '../lib/db';
import { useAuthStore } from '../store/authStore';
import { Package, DollarSign, AlertTriangle, Grid, Activity } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [freshItems, freshCats, freshLogs] = await Promise.all([
          db.getItems(),
          db.getCategories(),
          db.getAuditLogs()
        ]);
        setItems(freshItems);
        setCategories(freshCats);
        setLogs(freshLogs.slice(0, 5)); // Get 5 most recent logs
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProducts = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 5).length;
  const totalCategories = categories.length;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome to your admin dashboard, {profile?.name || 'Admin'}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading dashboard...</div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Products</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{totalProducts}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+12% from last month</div>
            </div>

            <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Value</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Rs. {totalValue.toLocaleString()}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+8% from last month</div>
            </div>

            <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Low Stock Items</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{lowStockItems}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>-2 from last month</div>
            </div>

            <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Categories</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{totalCategories}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Grid size={20} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Same as last month</div>
            </div>

          </div>

          {/* Recent Activity */}
          <div className="panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--color-primary)" /> Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>No recent activity.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #EFEBE8' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.action}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        By {log.worker_email} {log.details?.item_name ? `(${log.details.item_name})` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
