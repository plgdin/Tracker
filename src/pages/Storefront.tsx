import { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/db';
import type { Item, Category } from '../lib/db';
import { Search, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import { useToastStore } from '../store/toastStore';

const categoryEmojis: Record<string, string> = {
  All: '📦',
};

export default function Storefront() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { cart, addItem, updateQuantity, setIsCartOpen, getTotalItems } = useCartStore();
  const showToast = useToastStore(state => state.showToast);

  useEffect(() => {
    async function loadData() {
      try {
        // Cached data
        const cachedItems = JSON.parse(localStorage.getItem('tracker_items') || '[]') as Item[];
        const cachedCats = JSON.parse(localStorage.getItem('tracker_categories') || '[]') as Category[];
        if (cachedItems.length > 0) setItems(cachedItems);
        if (cachedCats.length > 0) setCategories(cachedCats);
        setLoading(false);

        // Fetch fresh data
        const [fetchedItems, fetchedCategories] = await Promise.all([
          db.getItems(),
          db.getCategories(),
        ]);
        setItems(fetchedItems);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching items:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items for storefront (only items with a price)
  const storefrontItems = useMemo(() => {
    return items.filter(item => item.price != null && item.price > 0);
  }, [items]);

  // Derived categories from available items
  const activeCategories = useMemo(() => {
    const list = new Set(storefrontItems.map(item => item.category || 'Uncategorized'));
    return ['All', ...Array.from(list)];
  }, [storefrontItems]);

  const filteredItems = useMemo(() => {
    return storefrontItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [storefrontItems, search, selectedCategory]);

  return (
    <>
      
      {/* Floating Cart Button for Mobile */}
      {getTotalItems() > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fab" 
          style={{ bottom: '1.5rem', backgroundColor: 'var(--color-primary)' }}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingBag size={24} />
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px', 
              background: 'white', color: 'var(--color-primary)', 
              borderRadius: '50%', width: '20px', height: '20px', 
              fontSize: '11px', fontWeight: 'bold', display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              {getTotalItems()}
            </span>
          </div>
        </button>
      )}

      <div className="storefront-container">
        
        {/* Hero Section */}
        <header style={{ padding: '2rem 1rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', fontFamily: '"Playfair Display", serif', color: 'var(--color-text-primary)' }}>Storefront</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Browse our available items and place an order.</p>
        </header>

        {/* Search Bar */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="input-field" 
              style={{ paddingLeft: '3rem', borderRadius: '24px', backgroundColor: 'white', border: 'none', boxShadow: 'var(--soft-shadow)' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Circular Categories (Swiggy Style) */}
        <div style={{ padding: '0 1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Order our best options</h3>
          <div className="category-scroll">
            {activeCategories.map(cat => {
              const emoji = categoryEmojis[cat] || '🏷️';
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat} 
                  className={`category-bubble ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <div className="category-bubble-icon">{emoji}</div>
                  <span className="category-bubble-text">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ padding: '0 1rem' }}>
          {loading ? (
             <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading menu...</p>
          ) : filteredItems.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem', border: 'none' }}>
              <span style={{ fontSize: '3rem' }}>📦</span>
              <h3 style={{ marginTop: '1rem' }}>No items found</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Try searching for something else!</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map(item => {
                const cartItem = cart.find(c => c.id === item.id);
                const quantityInCart = cartItem?.quantity || 0;
                const isOutOfStock = item.quantity <= 0;

                return (
                  <div key={item.id} className="product-card" style={{ opacity: isOutOfStock ? 0.7 : 1 }}>
                    <div className="product-img-wrapper">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="product-img" />
                      ) : (
                        <span className="product-emoji">📦</span>
                      )}
                      {isOutOfStock && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(62,39,35,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ background: 'white', color: 'var(--color-text-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Sold Out</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-details">
                      <h4 className="product-name">{item.name}</h4>
                      <p className="product-desc">{item.notes || 'Available in stock.'}</p>
                      
                      <div className="product-footer">
                        <span className="product-price">₹{item.price}</span>
                        
                        {!isOutOfStock && (
                          quantityInCart > 0 ? (
                            <div className="qty-control">
                              <button className="qty-btn" onClick={() => {
                                updateQuantity(item.id, quantityInCart - 1);
                                if (quantityInCart === 1) showToast('Removed from cart');
                              }}><Minus size={14} /></button>
                              <span className="qty-val">{quantityInCart}</span>
                              <button className="qty-btn" onClick={() => addItem({
                                id: item.id,
                                name: item.name,
                                price: item.price || 0,
                                quantity: 1,
                                image_url: item.image_url || undefined,
                                max_quantity: item.quantity
                              })}><Plus size={14} /></button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={() => {
                              addItem({
                                id: item.id,
                                name: item.name,
                                price: item.price || 0,
                                quantity: 1,
                                image_url: item.image_url || undefined,
                                max_quantity: item.quantity
                              });
                              showToast(`Added ${item.name}`);
                            }}>
                              ADD
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CartDrawer />
      <CheckoutModal />
    </>
  );
}
