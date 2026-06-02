import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../lib/db';
import type { Category } from '../lib/db';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import MilkCarton from '../components/MilkCarton';

export default function AddItem() {
  const showToast = useToastStore(state => state.showToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scanning, setScanning] = useState(false);
  // Pre-fill barcode from ?barcode= param (from BarcodeScanner "not found" flow) or ?edit= flow
  const prefillBarcode = searchParams.get('barcode') || '';
  const [barcode, setBarcode] = useState(prefillBarcode);
  
  const [formData, setFormData] = useState({
    name: '',
    expiration_date: '',
    warning_date: '',
    quantity: 1,
    category: 'Uncategorized',
    notes: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
              warning_date: itemToEdit.warning_date || '',
              quantity: itemToEdit.quantity,
              category: itemToEdit.category,
              notes: itemToEdit.notes || '',
              price: itemToEdit.price !== undefined ? String(itemToEdit.price) : ''
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
    let html5Qrcode: Html5Qrcode | null = null;
    
    if (scanning) {
      const timer = setTimeout(() => {
        try {
          html5Qrcode = new Html5Qrcode("reader");
          html5Qrcode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText: string) => {
               setBarcode(decodedText);
               setScanning(false);
               if (html5Qrcode) {
                 html5Qrcode.stop().catch(console.error);
               }
            },
            () => {
              // Silent camera scan errors
            }
          ).catch((err) => {
            console.error("Camera start failed:", err);
          });
        } catch (e) {
          console.error("Scanner init error:", e);
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (html5Qrcode) {
          if (html5Qrcode.isScanning) {
            html5Qrcode.stop().catch(console.error);
          }
        }
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
        name: formData.name,
        expiration_date: formData.expiration_date,
        warning_date: formData.warning_date || undefined,
        quantity: formData.quantity,
        category: formData.category,
        notes: formData.notes || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        barcode: barcode || undefined,
        added_by: profile?.id || undefined
      };

      if (editId) {
        await db.updateItem(editId, dataToSave);
        showToast('Product updated successfully! 🍓');
      } else {
        await db.addItem(dataToSave);
        showToast('Product added successfully! 🍓');
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1400);
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

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>{editId ? 'Edit Item' : 'Add Item'}</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Give your food a living expiry countdown! 🍓</p>
      </header>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Top Preview Card with Quantity Adjuster */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>
            
            {/* Interactive Speech Bubble */}
            <div style={{
              backgroundColor: 'white',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '0.5rem 1rem',
              position: 'relative',
              marginBottom: '1.25rem',
              maxWidth: '280px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)',
              boxShadow: '0 4px 10px rgba(230, 57, 70, 0.06)'
            }}>
              {success ? (
                "Yay! Successfully saved! 👍 Thumbs up!"
              ) : formData.name.trim() ? (
                `Ooo, ${formData.name}! 🍓 That sounds delicious!`
              ) : (
                "Hi there! Let's add something tasty to track! 🥛"
              )}
              {/* Little triangle tail for speech bubble */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                borderRight: '2px solid var(--color-primary)',
                borderBottom: '2px solid var(--color-primary)'
              }}></div>
            </div>

            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '24px', 
              backgroundColor: 'var(--color-bg-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1rem',
              border: '1.5px dashed rgba(230, 57, 70, 0.2)'
            }}>
              <MilkCarton winking={!success} thumbsUp={success} size={90} />
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
                <label className="input-label">🔍 Scan or Enter Barcode</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Scan product barcode..." 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '12px', minHeight: '44px' }} onClick={() => setScanning(true)}>
                    <Camera size={20} />
                  </button>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Use your camera to quickly scan a barcode or enter it manually!</p>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">🏷️ Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Organic Whole Milk"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required 
              />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Give the item a clear name so carton can recognize it!</p>
            </div>

            <div className="input-group">
              <label className="input-label">📝 Special Notes</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Keep in bottom drawer, buy more next time..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Any storage instructions, brand details, or custom reminders.</p>
            </div>

            <div className="input-group">
              <label className="input-label">💰 Product Price (Optional)</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field" 
                placeholder="e.g., 3.49"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Optional price of the product to track purchase budgets.</p>
            </div>

            {/* List items with right alignment as seen in Screenshot 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(230, 57, 70, 0.08)', paddingTop: '1.5rem' }}>
              
              {/* Category row */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>📂 Category</span>
                  <select 
                    className="input-field"
                    style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem', textAlign: 'left' }}>Organize items into shelves to filter them easier later.</p>
              </div>

              {/* Expiry Date row */}
              <div style={{ borderTop: '1px solid rgba(230, 57, 70, 0.05)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>📅 Expiry Date</span>
                  <input 
                    type="date" 
                    className="input-field"
                    style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    value={formData.expiration_date}
                    onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                    required 
                  />
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem', textAlign: 'left' }}>The ultimate expiration date. Countdown alerts start 30 days before!</p>
              </div>

              {/* Warning Date row */}
              <div style={{ borderTop: '1px solid rgba(230, 57, 70, 0.05)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>⚠️ Custom Warning Date</span>
                  <input 
                    type="date" 
                    className="input-field"
                    style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    value={formData.warning_date}
                    onChange={e => setFormData({ ...formData, warning_date: e.target.value })}
                  />
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem', textAlign: 'left' }}>Optional: Choose a custom date to get warned even sooner than 30 days.</p>
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
