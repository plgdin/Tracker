export default function ShoppingList() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Shopping List</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Items to buy</p>
      </header>
      
      <div className="glass-panel">
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Your list is empty.</p>
      </div>
    </div>
  );
}
