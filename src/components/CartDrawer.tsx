import { useCartStore } from '../store/cartStore';
import { X, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, setIsCheckoutOpen, updateQuantity, getTotalAmount, getTotalItems } = useCartStore();

  // Prevent scrolling on body when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      
      <div className="cart-drawer">
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} color="var(--color-primary)" />
            Your Basket ({getTotalItems()})
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 'bold' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Add some items to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : (
                    '📦'
                  )}
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} each</div>
                </div>
                <div className="qty-control" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid rgba(62,39,35,0.1)', color: 'var(--color-text-primary)' }}>
                  <button className="qty-btn" style={{ color: 'var(--color-text-primary)' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" style={{ color: 'var(--color-text-primary)' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total to pay</span>
              <span>₹{getTotalAmount()}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Order <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
