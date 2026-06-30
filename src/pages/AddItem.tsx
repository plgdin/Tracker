import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Package } from 'lucide-react';

export default function AddItem() {
  const showToast = useToastStore(state => state.showToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    tax_percentage: 0,
    notes: '',
    quantity: 1,
    expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Default 1 year from now
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fetchedCats = await db.getCategories();
        setCategories(fetchedCats);

        if (editId) {
          const items = await db.getItems();
          const itemToEdit = items.find(item => item.id === editId);
          if (itemToEdit) {
            setFormData({
              name: itemToEdit.name,
              category: itemToEdit.category,
              price: itemToEdit.price || 0,
              tax_percentage: itemToEdit.tax_percentage || 0,
              notes: itemToEdit.notes || '',
              quantity: itemToEdit.quantity,
              expiration_date: itemToEdit.expiration_date,
            });
          }
        }
      } catch (err) {
        console.error('Error loading item data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!formData.category) {
      alert('Please select a category.');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        tax_percentage: formData.tax_percentage,
        notes: formData.notes || undefined,
        quantity: formData.quantity,
        expiration_date: formData.expiration_date,
        added_by: profile?.id || undefined
      };

      if (editId) {
        await db.updateItem(editId, dataToSave);
        showToast('Product updated successfully! ✓');
      } else {
        await db.addItem(dataToSave);
        showToast('Product added successfully! ✓');
      }
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">{editId ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
          Loading details...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Product Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Chocolate Cake"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Category <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem', backgroundColor: 'white' }}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="" disabled>Select a Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Base Price (Rs)
              </label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                value={formData.price || ''}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Tax Percentage (%)
              </label>
              <input 
                type="number" 
                min="0"
                max="100"
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                value={formData.tax_percentage || ''}
                onChange={e => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Quantity In Stock
              </label>
              <input 
                type="number" 
                min="0"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem' }}
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Product Details
              </label>
              <textarea 
                placeholder="Enter product description and details..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #EFEBE8', fontSize: '0.9rem', minHeight: '100px', resize: 'vertical' }}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid #EFEBE8', paddingTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #EFEBE8', backgroundColor: 'white', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <Package size={18} /> {saving ? 'Saving...' : (editId ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
