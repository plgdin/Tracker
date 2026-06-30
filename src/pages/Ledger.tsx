import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, TrendingUp, AlertCircle, BarChart2, FileText } from 'lucide-react';
import PurchasingModule from './ledger/PurchasingModule';
import SellingModule from './ledger/SellingModule';
import OutstandingPage from './ledger/OutstandingPage';
import ReportsPage from './ledger/ReportsPage';
import InvoiceGenerator from './ledger/InvoiceGenerator';
import { ledgerDb } from '../lib/ledgerDb';

type Tab = 'purchasing' | 'selling' | 'invoice' | 'outstanding' | 'reports';

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
    { key: 'invoice', icon: FileText, label: 'Invoice Gen' },
    { key: 'outstanding', icon: AlertCircle, label: 'Due', badge: outstandingCount },
    { key: 'reports', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ledger & Invoices</h1>
        <p className="admin-page-subtitle">Purchasing · Selling · Reports</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: tab === t.key ? 'var(--color-primary)' : 'white',
              color: tab === t.key ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: tab === t.key ? '0 4px 10px rgba(199, 92, 65, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative'
            }}
          >
            <t.icon size={16} /> {t.label}
            {t.badge ? (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#D97706', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'purchasing' && <PurchasingModule />}
      {tab === 'selling' && <SellingModule />}
      {tab === 'invoice' && <InvoiceGenerator />}
      {tab === 'outstanding' && <OutstandingPage />}
      {tab === 'reports' && <ReportsPage />}
    </div>
  );
}
