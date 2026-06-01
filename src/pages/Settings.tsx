import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { profile, signOut } = useAuthStore();

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your preferences and categories</p>
      </header>
      
      <div className="glass-panel" style={{ marginBottom: '1rem' }}>
        <h3>Categories</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage custom categories here.</p>
        <button className="btn btn-outline" style={{ marginTop: '1rem' }}>Add Category</button>
      </div>

      <div className="glass-panel">
        <h3>Account</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Logged in as: <strong>{profile?.name || 'User'}</strong> ({profile?.role})
        </p>
        <button className="btn btn-danger" onClick={() => signOut()}>
          Log Out
        </button>
      </div>
    </div>
  );
}
