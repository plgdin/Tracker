import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { X, MessageCircle } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export default function CheckoutModal() {
  const { cart, isCheckoutOpen, setIsCheckoutOpen, getTotalAmount, clearCart } = useCartStore();
  const showToast = useToastStore(state => state.showToast);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Prevent scrolling
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Please provide name and phone number');
      return;
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
    let message = `*NEW ORDER #${orderNumber}*\n\n`;
    message += `*Customer:* ${name}\n`;
    message += `*Phone:* ${phone}\n\n`;
    
    message += `*Order Details:*\n`;
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`;
    });
    
    message += `\n*Total Amount:* ₹${getTotalAmount()}\n`;
    if (notes) {
      message += `\n*Notes:* ${notes}\n`;
    }

    // Default WhatsApp number (owner must configure this later)
    const ownerWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
    const whatsappUrl = `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clean up
    clearCart();
    setIsCheckoutOpen(false);
    setName('');
    setPhone('');
    setNotes('');
    showToast('Redirecting to WhatsApp...');
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCheckoutOpen(false)} style={{ zIndex: 200 }} />
      
      <div className="cart-drawer" style={{ zIndex: 201 }}>
        <div className="cart-header">
          <div className="cart-title">
            Confirm Order
          </div>
          <button 
            onClick={() => setIsCheckoutOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        <div className="cart-items" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Your Name *</label>
              <input 
                type="text" 
                required 
                className="input-field" 
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Phone Number *</label>
              <input 
                type="tel" 
                required 
                className="input-field" 
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Delivery Notes (Optional)</label>
              <textarea 
                className="input-field" 
                placeholder="Any special instructions?"
                rows={3}
                style={{ resize: 'none' }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span>Total to pay</span>
            <span>₹{getTotalAmount()}</span>
          </div>
          <button 
            type="submit" 
            form="checkout-form"
            className="checkout-btn"
            style={{ backgroundColor: '#25D366' }} // WhatsApp Green
          >
            <MessageCircle size={18} /> Place Order via WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
