import { useEffect, useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/db';
import type { Category } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useAppStore } from '../../store/appStore';
import MilkCarton from '../../components/MilkCarton';

export default function AddItem() {
  const showToast = useToastStore(state => state.showToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const storeType = useAppStore((s: any) => s.storeType);

  const { profile } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemStoreType, setItemStoreType] = useState<'online' | 'offline'>('online');
  
  const [formData, setFormData] = useState({
    name: '',
    expiration_date: '',
    warning_date: '',
    quantity: 1,
    category: 'Uncategorized',
    notes: '',
    price: '',
    image_url: '',
    gst_percentage: 0,
    custom_gst: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setItemStoreType(storeType);
  }, [storeType]);

  useEffect(() => {
    async function loadData() {
      if (!editId) return;
      setLoading(true);
      try {
        const items = await db.getItems();
        const itemToEdit = items.find(item => item.id === editId);
        if (itemToEdit) {
          setItemStoreType((itemToEdit as any).store_type || 'offline');
          setFormData({
            name: itemToEdit.name,
            expiration_date: itemToEdit.expiration_date,
            warning_date: itemToEdit.warning_date || '',
            quantity: itemToEdit.quantity,
            category: itemToEdit.category,
            notes: itemToEdit.notes || '',
            price: itemToEdit.price || '',
            image_url: itemToEdit.image_url || '',
            gst_percentage: itemToEdit.gst_percentage || 0,
            custom_gst: itemToEdit.gst_percentage && ![0, 3, 5, 8, 12, 18, 28, 40].includes(itemToEdit.gst_percentage) ? itemToEdit.gst_percentage.toString() : '',
          });
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
    async function loadCategories() {
      try {
        const fetchedCats: Category[] = await (db as any).getCategoriesByStore(itemStoreType);
        setCategories(fetchedCats);
        if (fetchedCats.length > 0) {
          // If editing is finished or we are adding new item, check if category exists in current list
          setFormData(prev => {
            const exists = fetchedCats.some(cat => cat.name === prev.category);
            return { ...prev, category: exists ? prev.category : fetchedCats[0].name };
          });
        }
      } catch (err) {
        console.error('Error fetching categories for store:', err);
      }
    }
    loadCategories();
  }, [itemStoreType]);

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
        price: formData.price || undefined,
        image_url: formData.image_url || undefined,
        gst_percentage: formData.gst_percentage === -1 ? parseFloat(formData.custom_gst || '0') : formData.gst_percentage,
        store_type: itemStoreType,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await db.uploadProductImage(file);
      if (result.success && result.url) {
        setFormData({ ...formData, image_url: result.url });
        showToast('Image uploaded successfully!');
      } else {
        showToast('Failed to upload image: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      showToast('Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

          {/* Form details */}
          <div className="panel" style={{ padding: '1.5rem' }}>

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

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">💰 Price</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '0 0.75rem', background: 'rgba(230,57,70,0.1)', color: 'var(--color-primary)', fontWeight: 'bold', border: '1px solid rgba(230,57,70,0.2)', borderRight: 'none', borderRadius: '12px 0 0 12px', height: '42px', display: 'flex', alignItems: 'center' }}>₹</span>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g., 450/kg or 50"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1 }}
                />
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Type the amount and unit (e.g., 450/kg). The ₹ symbol is added automatically.</p>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">🧾 GST / Tax Percentage</label>
              <select 
                className="input-field" 
                value={formData.gst_percentage}
                onChange={e => setFormData({ ...formData, gst_percentage: Number(e.target.value) })}
              >
                {itemStoreType === 'online' ? (
                  // Online Store GST slabs
                  <>
                    <option value={0}>0% — Exempt / Nil Rated (plain water, basic items)</option>
                    <option value={3}>3% — Special items (precious metal components, specific raw inputs)</option>
                    <option value={5}>5% — Restaurant / Food Service (AC &amp; non-AC)</option>
                    <option value={8}>8% — Alternative/Local Services Tax</option>
                    <option value={12}>12% — Processed / Packaged Food</option>
                    <option value={18}>18% — Premium Food, Chocolates, Beverages</option>
                    <option value={28}>28% — Luxury / Alcoholic Beverages</option>
                    <option value={40}>40% — Luxury Surcharge / Sin Tax (specified beverages)</option>
                    <option value={-1}>Custom Percentage</option>
                  </>
                ) : (
                  // Offline Store GST slabs
                  <>
                    <option value={0}>0% — Exempt (unbranded bread, fresh roti, plain flour)</option>
                    <option value={3}>3% — Specialty Ingredients / Local Grains</option>
                    <option value={5}>5% — Cakes, Pastries, Muffins, Branded Biscuits, Rusks</option>
                    <option value={8}>8% — Alternative/Local Baked Goods Tax</option>
                    <option value={12}>12% — Namkeen, Bhujia, Savoury Snacks, Dry Mixtures</option>
                    <option value={18}>18% — Chocolate-coated Items, Waffles, Premium Desserts</option>
                    <option value={28}>28% — Luxury / Speciality Confectionery</option>
                    <option value={40}>40% — Luxury Imported / Sin Tax Items</option>
                    <option value={-1}>Custom Percentage</option>
                  </>
                )}
              </select>
              {formData.gst_percentage === -1 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="Enter custom GST %"
                    value={formData.custom_gst}
                    onChange={e => setFormData({ ...formData, custom_gst: e.target.value })}
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                  />
                  <span style={{ padding: '0 0.75rem', background: 'rgba(230,57,70,0.1)', color: 'var(--color-primary)', fontWeight: 'bold', border: '1px solid rgba(230,57,70,0.2)', borderLeft: 'none', borderRadius: '0 12px 12px 0', height: '42px', display: 'flex', alignItems: 'center' }}>%</span>
                </div>
              )}
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                {itemStoreType === 'online'
                  ? 'GST will be added on top of the base price at checkout (Online rates).'
                  : 'GST will be added on top of the base price at checkout (Offline rates).'}
              </p>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">🖼️ Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  style={{ flex: 1 }}
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{ 
                    padding: '0 1rem', 
                    height: '42px',
                    borderRadius: '12px',
                    border: '1px solid rgba(230,57,70,0.2)',
                    background: 'rgba(230,57,70,0.1)',
                    color: 'var(--color-primary)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    opacity: uploadingImage ? 0.7 : 1
                  }}
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>Link to an image for the storefront or upload from your device.</p>
            </div>

            {/* List items with right alignment as seen in Screenshot 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(230, 57, 70, 0.08)', paddingTop: '1.5rem' }}>
              
              {/* Store / Department row */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>🏪 Department / Store</span>
                  <select 
                    className="input-field"
                    style={{ width: 'auto', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    value={itemStoreType}
                    onChange={e => setItemStoreType(e.target.value as 'online' | 'offline')}
                  >
                    <option value="online">Online Store</option>
                    <option value="offline">Offline Store</option>
                  </select>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem', textAlign: 'left' }}>Choose which catalog this item should be displayed in.</p>
              </div>

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
