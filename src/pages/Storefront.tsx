import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../lib/db';
import type { Item, Category } from '../lib/db';
import { ShoppingCart, Search, Plus, Minus, X, MessageCircle, Heart, User } from 'lucide-react';
import MilkCarton from '../components/MilkCarton';

// Phone number to send WhatsApp orders to (Placeholder)
const WHATSAPP_NUMBER = '+1234567890'; // User can update this

export default function Storefront() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state via URL Params so browser back button works
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';

  const setSearch = (val: string) => {
    setSearchParams(prev => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    });
  };

  const setSelectedCategory = (val: string) => {
    setSearchParams(prev => {
      if (val !== 'All') prev.set('category', val);
      else prev.delete('category');
      return prev;
    });
  };

  // Cart & Bill state
  const [cart, setCart] = useState<{ item: Item, qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillGenerated, setIsBillGenerated] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedItems, fetchedCategories] = await Promise.all([
          db.getItems(),
          db.getCategories()
        ]);
        
        // Only show items that have quantity > 0 and are not expired
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const availableItems = fetchedItems.filter(item => {
          if (item.quantity <= 0) return false;
          const expiryDate = new Date(item.expiration_date);
          expiryDate.setHours(0, 0, 0, 0);
          return expiryDate.getTime() >= today.getTime();
        });

        setItems(availableItems);
        setCategories(fetchedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching storefront data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        // limit to available quantity
        if (existing.qty >= item.quantity) return prev;
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === itemId) {
        const newQty = c.qty + delta;
        if (newQty > c.item.quantity) return c; // Cannot exceed stock
        if (newQty <= 0) return c; // Cannot be less than 1 (use remove instead)
        return { ...c, qty: newQty };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, c) => sum + ((c.item.price || 0) * c.qty), 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const totalTaxAmount = cart.reduce((sum, c) => {
    const lineTotal = (c.item.price || 0) * c.qty;
    const taxRate = c.item.tax_percentage || 0;
    return sum + (lineTotal * (taxRate / 100));
  }, 0);

  const sgst = totalTaxAmount / 2;
  const cgst = totalTaxAmount / 2;
  const grandTotal = cartTotal + totalTaxAmount;

  const checkout = () => {
    if (cart.length === 0) return;

    let message = `*INVOICE*\n\n`;
    message += `*Items:*\n`;
    
    cart.forEach((c, index) => {
      const lineTotal = (c.item.price || 0) * c.qty;
      message += `${index + 1}. ${c.item.name} - ${c.qty} x ₹${c.item.price || 0} = ₹${lineTotal}\n`;
    });
    
    message += `\n*Summary:*\n`;
    message += `Total Base Price: ₹${cartTotal.toFixed(2)}\n`;
    if (totalTaxAmount > 0) {
      message += `Total SGST: ₹${sgst.toFixed(2)}\n`;
      message += `Total CGST: ₹${cgst.toFixed(2)}\n`;
    }
    message += `\n*Grand Total: ₹${grandTotal.toFixed(2)}*\n\n`;
    message += `Please confirm my order.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Store Header */}
      <header style={{ 
        backgroundColor: 'var(--color-primary)', 
        color: 'white', 
        padding: '1rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(230,57,70,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MilkCarton size={30} color="white" />
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Bake N Joy Shop</h1>
        </div>
        
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ 
            background: 'white', 
            color: 'var(--color-primary)', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '20px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <ShoppingCart size={18} />
          {cartItemCount > 0 && <span>{cartItemCount}</span>}
        </button>
      </header>

      <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '6rem' }}>
        {/* Search */}
        <div className="panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="input-field" 
              style={{ paddingLeft: '2.5rem' }} 
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value !== '') {
                  setSelectedCategory('All');
                }
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        {selectedCategory === 'All' && search === '' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {categories.map(cat => {
              const catItems = items.filter(item => item.category === cat.name);
              if (catItems.length === 0) return null;
              
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{cat.name}</h2>
                    <button 
                      onClick={() => setSelectedCategory(cat.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      See All →
                    </button>
                  </div>
                  
                  {/* Horizontal Scroll Area */}
                  <div style={{ 
                    display: 'flex', 
                    overflowX: 'auto', 
                    gap: '1rem', 
                    paddingBottom: '1rem',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch' 
                  }}>
                    {catItems.map(item => (
                      <div 
                        key={item.id} 
                        className="cute-card" 
                        style={{ 
                          minWidth: '160px', 
                          maxWidth: '160px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          padding: '1rem',
                          scrollSnapAlign: 'start',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <MilkCarton size={60} />
                        </div>
                        
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.name}</h3>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          In Stock: {item.quantity}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                              ₹{item.price || 0}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => addToCart(item)}
                            style={{
                              background: 'var(--color-primary)',
                              color: 'white',
                              border: 'none',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(230,57,70,0.3)'
                            }}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSearch('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0' }}
              >
                ← Back
              </button>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
                {search !== '' ? `Search Results for "${search}"` : selectedCategory}
              </h2>
            </div>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading products...</p>
            ) : filteredItems.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>No products found.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map(item => (
                  <div key={item.id} className="cute-card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <MilkCarton size={60} />
                    </div>
                    
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--color-text-primary)' }}>{item.name}</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      In Stock: {item.quantity}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                          ₹{item.price || 0}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(item)}
                        style={{
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 5px rgba(230,57,70,0.3)'
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '400px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} /> My Cart
              </h2>
              <button onClick={() => { setIsCartOpen(false); setIsBillGenerated(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : isBillGenerated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: 0, textAlign: 'center', borderBottom: '1px dashed #d1d5db', paddingBottom: '0.5rem' }}>INVOICE / RECEIPT</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {cart.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{c.qty}x {c.item.name}</span>
                        <span>₹{(c.item.price || 0) * c.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {totalTaxAmount > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                          <span>SGST</span>
                          <span>₹{sgst.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                          <span>CGST</span>
                          <span>₹{cgst.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                    <span>Grand Total</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(c => (
                    <div key={c.item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--color-bg-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MilkCarton size={30} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{c.item.name}</h4>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{c.item.price || 0}</div>
                      </div>
                      
                      {/* Qty Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-light)', padding: '0.25rem', borderRadius: '20px' }}>
                        <button onClick={() => {
                          if (c.qty <= 1) removeFromCart(c.item.id);
                          else updateCartQty(c.item.id, -1);
                        }} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{c.qty}</span>
                        <button onClick={() => updateCartQty(c.item.id, 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '1.25rem', backgroundColor: '#fcfcfc', borderTop: '1px solid #f0f0f0' }}>
                {!isBillGenerated ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                      <span>Total Base Price</span>
                      <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal}</span>
                    </div>
                    <button 
                      onClick={() => setIsBillGenerated(true)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', backgroundColor: '#10B981', border: 'none' }}
                    >
                      GENERATE BILL
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={checkout}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                  >
                    <MessageCircle size={20} />
                    Confirm Order via WhatsApp
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Bottom Navigation Bar (Mobile / Customer Panel) */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        borderTop: '1px solid #eaeaea', 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '0.75rem 0', 
        zIndex: 50, 
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' 
      }}>
        {/* Home */}
        <button onClick={() => { setSelectedCategory('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <MilkCarton size={24} color="var(--color-text-primary)" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Home</span>
        </button>
        
        {/* My Cart */}
        <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' }}>{cartItemCount}</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>My Cart</span>
        </button>
        
        {/* Account */}
        <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
          <User size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Account</span>
        </button>
        
        {/* Search */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
          <Search size={24} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Search</span>
        </button>
      </div>
    </div>
  );
}
