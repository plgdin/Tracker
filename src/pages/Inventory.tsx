export default function Inventory() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Inventory</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>All your tracked items</p>
      </header>
      
      <div className="glass-panel">
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No items yet. Add one from the Dashboard!</p>
      </div>
    </div>
  );
}
