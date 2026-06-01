import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Welcome to your Expiry Date Tracker</p>
      </header>
      
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2>Expiring Soon</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>No items expiring in the next 7 days.</p>
      </div>

      <div className="fab" onClick={() => navigate('/add-item')}>
        <Plus size={24} />
      </div>
    </div>
  );
}
