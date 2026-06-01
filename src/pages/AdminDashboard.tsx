import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          details,
          created_at,
          worker:worker_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, [profile]);

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={28} color="var(--color-primary)" />
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
      </header>
      
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2>Recent Activity (Audit Logs)</h2>
        
        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Loading logs...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>No recent activity.</p>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ padding: '0.5rem', background: 'var(--color-bg-dark)', borderRadius: '50%', color: 'var(--color-text-light)' }}>
                  <User size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>
                    {log.worker?.name || 'Unknown Worker'} <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>{log.action}</span>
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
                    {log.details?.item_name && `Item: ${log.details.item_name}`}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
