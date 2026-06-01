import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { useAuthStore } from '../store/authStore';

export default function AddItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    expiration_date: '',
    quantity: 1,
    category: 'Uncategorized',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fetchedCats = await db.getCategories();
        setCategories(fetchedCats);

        // Pre-select first category if available
        if (fetchedCats.length > 0 && !editId) {
          setFormData(prev => ({ ...prev, category: fetchedCats[0].name }));
        }

        if (editId) {
          const items = await db.getItems();
          const itemToEdit = items.find(item => item.id === editId);
          if (itemToEdit) {
            setFormData({
              name: itemToEdit.name,
              expiration_date: itemToEdit.expiration_date,
              quantity: itemToEdit.quantity,
              category: itemToEdit.category,
              notes: itemToEdit.notes || ''
            });
            if (itemToEdit.barcode) {
              setBarcode(itemToEdit.barcode);
            }
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

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText: string) => {
        setBarcode(decodedText);
        setScanning(false);
        scanner.clear();
      }, () => {
        // Handle scan errors silently
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!formData.expiration_date) {
      alert('Expiration Date is required.');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        barcode: barcode || undefined,
        added_by: profile?.id || undefined
      };

      if (editId) {
        await db.updateItem(editId, dataToSave);
      } else {
        await db.addItem(dataToSave);
      }
      navigate(-1);
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    const nextQty = formData.quantity + delta;
    if (nextQty >= 1) {
      setFormData({ ...formData, quantity: nextQty });
    }
  };

  // Cute winking milk carton cartoon SVG
  const MilkCartonIllustration = () => (
    <svg viewBox="0 0 60 70" width="80" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 52V28L30 18L45 28V52C45 54.2 43.2 56 41 56H19C16.8 56 15 54.2 15 52Z" fill="#FCF8F2" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 28H45" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18V28" stroke="#5C5552" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M30 18L15 28" stroke="#5C5552" strokeWidth="2.5" />
      <path d="M30 18L45 28" stroke="#5C5552" strokeWidth="2.5" />
      
      {/* Eye expressions */}
      <circle cx="23" cy="38" r="2.2" fill="#5C5552" />
      <circle cx="35" cy="38" r="2.2" fill="#5C5552" />
      
      <circle cx="19" cy="42" r="2.5" fill="#F4A261" opacity="0.6" />
      <circle cx="39" cy="42" r="2.5" fill="#F4A261" opacity="0.6" />
      
      {/* Smiling Mouth */}
      <path d="M26 43C27 45.2 29 45.2 30 43" stroke="#5C5552" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>{editId ? 'Edit Item' : 'Add Item'}</h1>
      </header>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Top Preview Card with Quantity Adjuster */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '24px', 
              backgroundColor: '#FAF5EE', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1rem',
              border: '1.5px dashed rgba(141, 131, 126, 0.2)'
            }}>
              <MilkCartonIllustration />
            </div>

            {/* Quantity Selector matching screens */}
            <div className="form-qty-adjuster">
              <button type="button" className="form-qty-btn" onClick={() => adjustQuantity(-1)}>−</button>
              <span className="form-qty-val">{formData.quantity}</span>
              <button type="button" className="form-qty-btn" onClick={() => adjustQuantity(1)}>+</button>
            </div>
          </div>

          {/* Barcode scanner panel if active */}
          {scanning && (
            <div className="panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div id="reader" style={{ width: '100%', marginBottom: '1rem' }}></div>
              <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setScanning(false)}>
                <X size={16} /> Cancel Scan
              </button>
            </div>
          )}

          {/* Form details */}
          <div className="panel" style={{ padding: '1.5rem' }}>
            
            {/* Barcode row */}
            {!scanning && (
              <div className="input-group">
                <label className="input-label">Barcode (Optional)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Scan or enter barcode" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }} onClick={() => setScanning(true)}>
                    <Camera size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Organic Milk"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notes</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* List items with right alignment as seen in Screenshot 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(141, 131, 126, 0.08)', paddingTop: '1.5rem' }}>
              
              {/* Category row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Category</span>
                <select 
                  className="input-field"
                  style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Expiry Date row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Expiry Date</span>
                <input 
                  type="date" 
                  className="input-field"
                  style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                  value={formData.expiration_date}
                  onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                  required 
                />
              </div>

            </div>
          </div>

          {/* Cancel / Save actions in footer matching screens */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '0 0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ border: 'none', color: 'var(--color-primary)', background: 'none', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.8rem 2.2rem', borderRadius: '18px', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
