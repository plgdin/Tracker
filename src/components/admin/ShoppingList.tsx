import { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import type { ShoppingItem, Item } from '../../lib/db';
import { Plus, Check, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

export default function ShoppingList() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [warningDays, setWarningDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedList, fetchedItems, fetchedSettings] = await Promise.all([
          db.getShoppingList(),
          db.getItems(),
          db.getSettings()
        ]);
        setShoppingItems(fetchedList);
        setWarningDays(fetchedSettings.warning_period_days);

        // Find expired or expiring soon items to suggest adding based on user's warning period!
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiringOrExpired = fetchedItems.filter(item => {
          const expiry = new Date(item.expiration_date);
          expiry.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= fetchedSettings.warning_period_days; // matches warning period settings!
        });
        setExpiredItems(expiringOrExpired);
      } catch (err) {
        console.error('Error loading shopping list data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddItem = async (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const name = customName || newItemName;
    if (!name.trim()) return;

    setAdding(true);
    try {
      const added = await db.addShoppingItem(name.trim());
      setShoppingItems([added, ...shoppingItems]);
      if (!customName) setNewItemName('');
    } catch (err) {
      console.error('Failed to add shopping item:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleTogglePurchased = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await db.toggleShoppingItem(id, !currentStatus);
      setShoppingItems(shoppingItems.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Failed to toggle shopping item status:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const success = await db.deleteShoppingItem(id);
      if (success) {
        setShoppingItems(shoppingItems.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete shopping item:', err);
    }
  };

  const activeItems = shoppingItems.filter(item => !item.is_purchased);
  const purchasedItems = shoppingItems.filter(item => item.is_purchased);

  // Suggestions that are not already on the active shopping list
  const activeNames = new Set(activeItems.map(i => i.item_name.toLowerCase()));
  const suggestions = expiredItems.filter(item => !activeNames.has(item.name.toLowerCase()));

  return (
    <div className="container">
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1>Shopping List</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Items to buy</p>
      </header>

      {/* Suggestion panel for expired/expiring items */}
      {suggestions.length > 0 && (
        <div className="panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <AlertCircle size={18} />
            Quick Add Suggestions ({warningDays}d threshold)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            The following items are expiring or expired in your pantry:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {suggestions.slice(0, 4).map(item => (
              <button 
                key={item.id}
                className="btn btn-outline" 
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                onClick={() => handleAddItem(undefined, item.name)}
              >
                + {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Item form */}
      <div className="panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={e => handleAddItem(e)} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            placeholder="Add new item to buy..." 
            className="input-field" 
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            disabled={adding}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }} disabled={adding}>
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* Shopping list sections */}
      <div className="panel" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading shopping list...</p>
        ) : shoppingItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
            <ShoppingCart size={48} style={{ opacity: '0.5', marginBottom: '1rem', color: 'var(--color-primary)' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Your list is empty</p>
            <p style={{ fontSize: '0.85rem' }}>Add items using the form above or check suggestions.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Active Items */}
            {activeItems.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>To Buy ({activeItems.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeItems.map(item => (
                    <div 
                      key={item.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '12px',
                        background: '#FFFDF9',
                        border: '1px solid rgba(141, 131, 126, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '0.2rem', 
                            borderRadius: '50%', 
                            width: '24px', 
                            height: '24px', 
                            background: 'transparent', 
                            border: '2px solid var(--color-primary)', 
                            color: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => handleTogglePurchased(item.id, item.is_purchased)}
                        >
                          <Check size={14} />
                        </button>
                        <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{item.item_name}</span>
                      </div>
                      <button 
                        className="btn" 
                        style={{ padding: '0.4rem', background: 'transparent', color: 'var(--color-primary)' }}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>Purchased ({purchasedItems.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {purchasedItems.map(item => (
                    <div 
                      key={item.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '12px',
                        background: '#FCFAF6',
                        opacity: 0.7,
                        border: '1px solid rgba(141, 131, 126, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '0.2rem', 
                            borderRadius: '50%', 
                            width: '24px', 
                            height: '24px', 
                            background: 'var(--color-primary)', 
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => handleTogglePurchased(item.id, item.is_purchased)}
                        >
                          <Check size={14} />
                        </button>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{item.item_name}</span>
                      </div>
                      <button 
                        className="btn" 
                        style={{ padding: '0.4rem', background: 'transparent', color: 'var(--color-primary)' }}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
