import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, TrendingUp, AlertCircle, BarChart2 } from 'lucide-react';
import PurchasingModule from './ledger/PurchasingModule';
import SellingModule from './ledger/SellingModule';
import OutstandingPage from './ledger/OutstandingPage';
import ReportsPage from './ledger/ReportsPage';
import { ledgerDb } from '../../lib/ledgerDb';

type Tab = 'purchasing' | 'selling' | 'outstanding' | 'reports';

export default function Ledger() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('purchasing');
  const [outstandingCount, setOutstandingCount] = useState(0);

  useEffect(() => {
    if (profile && profile.role !== 'admin') { navigate('/', { replace: true }); }
  }, [profile, navigate]);

  useEffect(() => {
    ledgerDb.getCustomers().then(c => {
      setOutstandingCount(c.filter(cust => cust.outstanding_balance > 0).length);
    });
  }, [tab]);

  if (!profile || profile.role !== 'admin') return null;

  const tabs: { key: Tab; icon: React.ElementType; label: string; badge?: number }[] = [
    { key: 'purchasing', icon: ShoppingCart, label: 'Purchasing' },
    { key: 'selling', icon: TrendingUp, label: 'Selling' },
    { key: 'outstanding', icon: AlertCircle, label: 'Due', badge: outstandingCount },
    { key: 'reports', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <div style={{ paddingBottom: '5rem', width: '100%', minWidth: 0 }}>
      <header style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'var(--color-accent)', color: 'white', padding: '0.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(42,157,143,0.25)' }}>
          <BookOpen size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Ledger</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', margin: 0 }}>Purchasing · Selling · Reports</p>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="panel" style={{ padding: '0.35rem', marginBottom: '1.25rem', display: 'flex', gap: '0.2rem', borderRadius: '16px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '0.45rem 0.4rem', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: 'none', borderRadius: '12px', whiteSpace: 'nowrap', position: 'relative' }}>
            <t.icon size={13} /> {t.label}
            {t.badge ? <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#D97706', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === 'purchasing' && <PurchasingModule />}
      {tab === 'selling' && <SellingModule />}
      {tab === 'outstanding' && <OutstandingPage />}
      {tab === 'reports' && <ReportsPage />}
    </div>
  );
}
