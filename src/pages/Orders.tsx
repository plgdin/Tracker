import { ShoppingCart } from 'lucide-react';

export default function Orders() {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">Manage customer orders and requests</p>
      </div>

      <div className="panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <ShoppingCart size={48} strokeWidth={1} />
        <p>No orders yet. Customer orders placed via WhatsApp will appear here once the API integration is complete.</p>
      </div>
    </div>
  );
}
