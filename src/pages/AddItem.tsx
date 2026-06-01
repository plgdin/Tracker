import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function AddItem() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('Uncategorized');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText) => {
        setBarcode(decodedText);
        setScanning(false);
        scanner.clear();
        
        // In a real app, you would look up the barcode in a product dictionary here
        // For now, we just fill the barcode.
      }, () => {
        // Handle scan errors if needed
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    try {
      // 1. Insert Item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({
          barcode,
          name,
          expiration_date: expirationDate,
          quantity,
          category,
          added_by: profile.id
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // 2. Insert Audit Log
      await supabase
        .from('audit_logs')
        .insert({
          worker_id: profile.id,
          action: 'added_item',
          details: { item_id: item.id, item_name: item.name }
        });

      navigate('/inventory');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0 }}>Add Item</h1>
      </header>
      
      <div className="glass-panel">
        {scanning ? (
          <div>
            <div id="reader" style={{ width: '100%', marginBottom: '1rem' }}></div>
            <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setScanning(false)}>
              <X size={20} /> Cancel Scan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
                <button type="button" className="btn btn-primary" onClick={() => setScanning(true)}>
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Milk" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Expiration Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input 
                type="number" 
                className="input-field" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min={1} 
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select 
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Uncategorized">Uncategorized</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
