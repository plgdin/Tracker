import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AddItem() {
  const navigate = useNavigate();

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0 }}>Add Item</h1>
      </header>
      
      <div className="glass-panel">
        <form>
          <div className="input-group">
            <label className="input-label">Product Name</label>
            <input type="text" className="input-field" placeholder="e.g., Milk" />
          </div>

          <div className="input-group">
            <label className="input-label">Expiration Date</label>
            <input type="date" className="input-field" />
          </div>

          <div className="input-group">
            <label className="input-label">Quantity</label>
            <input type="number" className="input-field" defaultValue={1} min={1} />
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field">
              <option value="Uncategorized">Uncategorized</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Vegetables">Vegetables</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows={3} placeholder="Optional notes..."></textarea>
          </div>

          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
}
