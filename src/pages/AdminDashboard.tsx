import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/db';
import type { AuditLog } from '../lib/db';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (profile?.role !== 'admin') {
      signOut().then(() => navigate('/?error=access_denied', { replace: true }));
      return;
    }
    db.getAuditLogs().then(l => {
      setLogs(l);
      setLoading(false);
    });
  }, [profile, navigate, signOut]);

  if (profile?.role !== 'admin') return null;

  const filters = ['All', 'Product', 'Order', 'Category', 'Offer', 'Settings'];

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'All') return true;
    return log.action.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit Logs</h1>
        <p className="admin-page-subtitle">Track all admin activities and changes</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: activeFilter === f ? 'var(--color-primary)' : 'white',
              color: activeFilter === f ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeFilter === f ? '0 4px 10px rgba(199, 92, 65, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ClipboardList size={48} strokeWidth={1} />
            <p>No audit logs found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EFEBE8', color: 'var(--color-text-secondary)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Entity</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>By</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #EFEBE8', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {log.details?.item_name || log.details?.permission || '-'}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {log.worker_email}
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
