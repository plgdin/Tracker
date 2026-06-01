export default function Settings() {
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
        <p style={{ color: 'var(--color-text-secondary)' }}>You are not logged in.</p>
      </div>
    </div>
  );
}
