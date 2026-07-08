import { supabase as supabaseClient } from './supabase';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
// Types
export interface Item {
  id: string;
  user_id?: string;
  added_by?: string;
  name: string;
  expiration_date: string; // YYYY-MM-DD
  warning_date?: string; // YYYY-MM-DD
  quantity: number;
  category: string;
  notes?: string;
  image_url?: string;
  price?: string;
  gst_percentage?: number;
  store_segment?: 'hotel' | 'bakery' | 'both';
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
  image_url?: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  user_id?: string;
  item_name: string;
  is_purchased: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  worker_email: string;
  action: string;
  details: {
    item_name: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface AppSettings {
  warning_period_days: number;
}

export interface StoreSettings {
  id: string;
  upi_id: string;
  phone_number: string;
  bank_details?: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  order_index: number;
}

export interface OnlineOrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  gst_percentage?: number;
}

export interface OnlineOrder {
  id: string;
  store_type?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_type: string;
  address?: string;
  notes?: string;
  offer_code?: string;
  total_amount: number;
  items: OnlineOrderItem[];
  transaction_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
}


const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key';

export const dbSupabase = isSupabaseConfigured ? supabaseClient : null;
export const supabase = dbSupabase;

// Synchronously/asynchronously verify if we have a valid authenticated user session with Supabase
export const getUseSupabase = async (): Promise<boolean> => {
  if (!dbSupabase) return false;
  // 1. Instantly check memory state first for peak performance
  const user = useAuthStore.getState().user;
  if (user && user.id === 'mock-admin-id') return false;
  if (user) return true;
  try {
    // 2. Fall back to getSession but wrap in a 2-second timeout to prevent any hangs
    const sessionPromise = dbSupabase.auth.getSession().then(({ data }) => !!data.session);
    return await Promise.race([
      sessionPromise,
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000))
    ]);
  } catch {
    return false;
  }
};

// Race promise helper to prevent infinite loading screens on database hang/timeout
export const withTimeout = <T>(promiseLike: PromiseLike<T>, timeoutMs = 8000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database request timeout')), timeoutMs)
    )
  ]);
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Dairy', color: '#6366F1', icon: 'Milk', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Meat', color: '#EF4444', icon: 'Beef', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Vegetables', color: '#10B981', icon: 'Carrot', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Chef Supplies', color: '#F59E0B', icon: 'Utensils', created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Pantry', color: '#8B5CF6', icon: 'Package', created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Uncategorized', color: '#6B7280', icon: 'Tag', created_at: new Date().toISOString() }
];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper for local storage
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getLocalCategories = (): Category[] => getLocal<Category[]>(`tracker_categories_${useAppStore.getState().storeType}`, DEFAULT_CATEGORIES);

const hasLocalCategories = (): boolean => localStorage.getItem(`tracker_categories_${useAppStore.getState().storeType}`) !== null;

const deleteLocalCategory = (id: string): boolean => {
  const categories = getLocalCategories();
  const filtered = categories.filter(c => c.id !== id);
  setLocal(`tracker_categories_${useAppStore.getState().storeType}`, filtered);
  return filtered.length !== categories.length;
};

// Main DB operations with fallback
export const db = {
  // Items
  async getItems(): Promise<Item[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('items').select('*').eq('store_type', useAppStore.getState().storeType).order('expiration_date', { ascending: true })
        );
        if (error) throw error;
        const result = data || [];
        // Cache the fresh items in local storage
        setLocal(`tracker_items_${useAppStore.getState().storeType}`, result);
        return result;
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocal<Item[]>(`tracker_items_${useAppStore.getState().storeType}`, []).sort(
      (a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
    );
  },

  async addItem(item: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    const newItem: Item = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString()
    };

    let result = newItem;
    const useSupabase = await getUseSupabase();

    if (useSupabase && dbSupabase) {
      try {
        const { data: userData } = await withTimeout(dbSupabase.auth.getUser());
        const targetStoreType = (item as any).store_type || useAppStore.getState().storeType;
        const { data, error } = await withTimeout(
          dbSupabase
            .from('items').insert([{ ...item, user_id: userData?.user?.id , store_type: targetStoreType}])
            .select()
            .single()
        );
        if (error) throw error;
        result = data;
      } catch (e) {
        console.warn('Supabase insert failed, saving to LocalStorage', e);
      }
    }

    if (result === newItem) {
      const targetStoreType = (item as any).store_type || useAppStore.getState().storeType;
      const items = getLocal<Item[]>(`tracker_items_${targetStoreType}`, []);
      items.push(newItem);
      setLocal(`tracker_items_${targetStoreType}`, items);
    }

    // Auto-log addition to audit logs
    await db.addAuditLog('Added Product', result.name);
    return result;
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    let result: Item | null = null;
    const useSupabase = await getUseSupabase();

    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase
            .from('items').update(updates).eq('store_type', useAppStore.getState().storeType)
            .eq('id', id)
            .select()
            .single()
        );
        if (error) throw error;
        result = data;
      } catch (e) {
        console.warn('Supabase update failed, updating LocalStorage', e);
      }
    }

    if (!result) {
      const items = getLocal<Item[]>(`tracker_items_${useAppStore.getState().storeType}`, []);
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updates };
        setLocal(`tracker_items_${useAppStore.getState().storeType}`, items);
        result = items[idx];
      }
    }

    if (result) {
      // Auto-log update to audit logs
      await db.addAuditLog('Updated Product', result.name, { updates });
      return result;
    }
    throw new Error('Item not found');
  },

  async deleteItem(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(dbSupabase.from('items').delete().eq('store_type', useAppStore.getState().storeType).eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase delete failed, removing from LocalStorage', e);
      }
    }

    const items = getLocal<Item[]>(`tracker_items_${useAppStore.getState().storeType}`, []);
    const filtered = items.filter(i => i.id !== id);
    setLocal(`tracker_items_${useAppStore.getState().storeType}`, filtered);
    return true;
  },


  async getCategories(): Promise<Category[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').select('*').eq('store_type', useAppStore.getState().storeType).order('name', { ascending: true })
        );
        if (error) throw error;
        const result = data && data.length > 0 ? data : (hasLocalCategories() ? getLocalCategories() : DEFAULT_CATEGORIES);
        // Cache the fresh categories in local storage
        setLocal(`tracker_categories_${useAppStore.getState().storeType}`, result);
        return result;
      } catch (e) {
        console.warn('Supabase categories fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocalCategories();
  },

  async getCategoriesByStore(storeType: 'online' | 'offline'): Promise<Category[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').select('*').eq('store_type', storeType).order('name', { ascending: true })
        );
        if (error) throw error;
        const result = data && data.length > 0 ? data : (localStorage.getItem(`tracker_categories_${storeType}`) !== null ? getLocal<Category[]>(`tracker_categories_${storeType}`, DEFAULT_CATEGORIES) : DEFAULT_CATEGORIES);
        setLocal(`tracker_categories_${storeType}`, result);
        return result;
      } catch (e) {
        console.warn('Supabase categories fetch failed', e);
      }
    }
    return getLocal<Category[]>(`tracker_categories_${storeType}`, DEFAULT_CATEGORIES);
  },

  async addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    const useSupabase = await getUseSupabase();

    if (useSupabase && dbSupabase) {
      try {
        const { data: userData } = await withTimeout(dbSupabase.auth.getUser());
        const targetStoreType = (category as any).store_type || useAppStore.getState().storeType;
        const { data, error } = await withTimeout(
          dbSupabase
            .from('categories').insert([{ ...category, user_id: userData?.user?.id , store_type: targetStoreType}])
            .select()
            .single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase category insert failed, saving to LocalStorage', e);
      }
    }

    const targetStoreType = (category as any).store_type || useAppStore.getState().storeType;
    const categories = getLocal<Category[]>(`tracker_categories_${targetStoreType}`, DEFAULT_CATEGORIES);
    categories.push(newCategory);
    setLocal(`tracker_categories_${targetStoreType}`, categories);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').update(updates).eq('store_type', useAppStore.getState().storeType).eq('id', id).select().single()
        );
        if (error) throw error;
        return data as Category;
      } catch (e) {
        console.warn('Supabase update failed for category', e);
      }
    }

    const categories = getLocalCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...updates };
      setLocal(`tracker_categories_${useAppStore.getState().storeType}`, categories);
      return categories[idx];
    }
    return null;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').delete().eq('store_type', useAppStore.getState().storeType).eq('id', id).select('id')
        );
        if (error) throw error;
        if (data && data.length > 0) {
          if (hasLocalCategories()) {
            deleteLocalCategory(id);
          } else {
            setLocal(`tracker_categories_${useAppStore.getState().storeType}`, []);
          }
          return true;
        }
      } catch (e) {
        console.warn('Supabase category delete failed, removing from LocalStorage', e);
      }
    }

    return deleteLocalCategory(id);
  },

  // Shopping List
  async getShoppingList(): Promise<ShoppingItem[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('shopping_list').select('*').eq('store_type', useAppStore.getState().storeType).order('created_at', { ascending: false })
        );
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Supabase shopping fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocal<ShoppingItem[]>(`tracker_shopping_list_${useAppStore.getState().storeType}`, []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async addShoppingItem(itemName: string): Promise<ShoppingItem> {
    const newItem: ShoppingItem = {
      id: generateId(),
      item_name: itemName,
      is_purchased: false,
      created_at: new Date().toISOString()
    };
    const useSupabase = await getUseSupabase();

    if (useSupabase && dbSupabase) {
      try {
        const { data: userData } = await withTimeout(dbSupabase.auth.getUser());
        const { data, error } = await withTimeout(
          dbSupabase
            .from('shopping_list').insert([{ item_name: itemName, is_purchased: false, user_id: userData?.user?.id , store_type: useAppStore.getState().storeType}])
            .select()
            .single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase shopping insert failed, saving to LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>(`tracker_shopping_list_${useAppStore.getState().storeType}`, []);
    shoppingList.unshift(newItem);
    setLocal(`tracker_shopping_list_${useAppStore.getState().storeType}`, shoppingList);
    await db.addAuditLog('Added Shopping Item', itemName);
    return newItem;
  },

  async toggleShoppingItem(id: string, isPurchased: boolean): Promise<ShoppingItem> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase
            .from('shopping_list').update({ is_purchased: isPurchased }).eq('store_type', useAppStore.getState().storeType)
            .eq('id', id)
            .select()
            .single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase shopping update failed, updating LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>(`tracker_shopping_list_${useAppStore.getState().storeType}`, []);
    const idx = shoppingList.findIndex(i => i.id === id);
    if (idx !== -1) {
      shoppingList[idx].is_purchased = isPurchased;
      setLocal(`tracker_shopping_list_${useAppStore.getState().storeType}`, shoppingList);
      await db.addAuditLog(isPurchased ? 'Checked Shopping Item' : 'Unchecked Shopping Item', shoppingList[idx].item_name);
      return shoppingList[idx];
    }
    throw new Error('Shopping item not found');
  },

  async deleteShoppingItem(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(dbSupabase.from('shopping_list').delete().eq('store_type', useAppStore.getState().storeType).eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase shopping delete failed, removing from LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>(`tracker_shopping_list_${useAppStore.getState().storeType}`, []);
    const itemToDelete = shoppingList.find(i => i.id === id);
    const filtered = shoppingList.filter(i => i.id !== id);
    setLocal(`tracker_shopping_list_${useAppStore.getState().storeType}`, filtered);
    if (itemToDelete) {
      await db.addAuditLog('Deleted Shopping Item', itemToDelete.item_name);
    }
    return true;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    return getLocal<AppSettings>(`tracker_settings_${useAppStore.getState().storeType}`, { warning_period_days: 30 });
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    setLocal(`tracker_settings_${useAppStore.getState().storeType}`, settings);
    return settings;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('audit_logs').select('*').eq('store_type', useAppStore.getState().storeType).order('created_at', { ascending: false })
        );
        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((log: any) => ({
            id: log.id,
            worker_email: log.details?.worker_email || 'worker@example.com',
            action: log.action,
            details: log.details || {},
            created_at: log.created_at
          }));
        }
      } catch (e) {
        console.warn('Supabase audit logs fetch failed', e);
      }
    }
    return getLocal<AuditLog[]>(`tracker_audit_logs_${useAppStore.getState().storeType}`, []);
  },

  async addAuditLog(action: string, itemName: string, details: Record<string, unknown> = {}): Promise<AuditLog> {
    const userState = useAuthStore.getState();
    const email = userState.user?.email || localStorage.getItem('admin_username') || 'admin';
    const newLog: AuditLog = {
      id: generateId(),
      worker_email: email,
      action,
      details: { item_name: itemName, ...details },
      created_at: new Date().toISOString()
    };

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data: userData } = await withTimeout(dbSupabase.auth.getUser());
        await withTimeout(
          dbSupabase.from('audit_logs').insert([{
            worker_id: userData?.user?.id,
            action,
            details: { item_name: itemName, worker_email: email, ...details }
          }])
        );
      } catch (e) {
        console.warn('Supabase audit log insert failed', e);
      }
    }

    const logs = getLocal<AuditLog[]>(`tracker_audit_logs_${useAppStore.getState().storeType}`, []);
    logs.unshift(newLog);
    setLocal(`tracker_audit_logs_${useAppStore.getState().storeType}`, logs.slice(0, 100));
    return newLog;
  },

  // Worker Management
  async getWorkers(): Promise<{ id: string; name: string; email: string; created_at: string }[]> {
    if (!dbSupabase) return [];
    try {
      const { data, error } = await withTimeout(
        dbSupabase.from('profiles').select('id, name, email, created_at').eq('role', 'worker').order('created_at', { ascending: false })
      );
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Failed to fetch workers', e);
      return [];
    }
  },

  async getPendingWorkers(): Promise<{ id: string; name: string; email: string; created_at: string }[]> {
    if (!dbSupabase) return [];
    try {
      const { data, error } = await withTimeout(
        dbSupabase.from('profiles').select('id, name, email, created_at').eq('role', 'pending').order('created_at', { ascending: false })
      );
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Failed to fetch pending workers', e);
      return [];
    }
  },

  async approveWorker(id: string): Promise<boolean> {
    if (!dbSupabase) return false;
    try {
      const { error } = await withTimeout(
        dbSupabase.from('profiles').update({ role: 'worker' }).eq('id', id)
      );
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Failed to approve worker', e);
      return false;
    }
  },

  async rejectWorker(id: string): Promise<boolean> {
    if (!dbSupabase) return false;
    try {
      // Call the RPC which deletes from auth.users (cascades to profiles)
      // so the worker can no longer log in at all
      const { error } = await withTimeout(
        dbSupabase.rpc('delete_user_completely', { target_user_id: id })
      );
      if (error) {
        console.warn('RPC delete failed, falling back to profile-only delete', error);
        // Fallback: at least remove the profile row so they can't access the app
        const { error: fallbackError } = await withTimeout(
          dbSupabase.from('profiles').delete().eq('id', id)
        );
        if (fallbackError) throw fallbackError;
      }
      return true;
    } catch (e) {
      console.warn('Failed to delete worker', e);
      return false;
    }
  },

  // Online Orders
  async getOnlineOrders(): Promise<OnlineOrder[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('online_orders').select('*').order('created_at', { ascending: false })
        );
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Supabase fetch failed for online orders', e);
      }
    }
    return getLocal<OnlineOrder[]>('tracker_online_orders', []).sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  },

  async getUserOrders(userId: string): Promise<OnlineOrder[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('online_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        );
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Supabase fetch failed for user orders', e);
      }
    }
    return getLocal<OnlineOrder[]>('tracker_online_orders', [])
      .filter(o => o.user_id === userId)
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  },

  async addOnlineOrder(orderData: Omit<OnlineOrder, 'created_at' | 'status'>): Promise<OnlineOrder> {
    const newOrder: OnlineOrder = {
      ...orderData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('online_orders').insert([newOrder]).select().single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase insert failed for online order', e);
      }
    }

    const orders = getLocal<OnlineOrder[]>('tracker_online_orders', []);
    orders.unshift(newOrder);
    setLocal('tracker_online_orders', orders);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(
          dbSupabase.from('online_orders').update({ status }).eq('id', id)
        );
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase update failed for online order', e);
      }
    }

    const orders = getLocal<OnlineOrder[]>('tracker_online_orders', []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      setLocal('tracker_online_orders', orders);
      return true;
    }
    return false;
  },

  async updateOrderTransactionId(id: string, transactionId: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(
          dbSupabase.from('online_orders').update({ transaction_id: transactionId, status: 'completed' }).eq('id', id)
        );
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase update failed for order transaction', e);
      }
    }

    const orders = getLocal<OnlineOrder[]>('tracker_online_orders', []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].transaction_id = transactionId;
      orders[idx].status = 'completed'; // Auto-mark completed when they submit UTR (can adjust as needed)
      setLocal('tracker_online_orders', orders);
      return true;
    }
    return false;
  },

  async uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: any }> {
    const useSupabase = await getUseSupabase();
    if (!useSupabase || !dbSupabase) {
      return { success: false, error: 'Supabase is not configured. Cannot upload image.' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await dbSupabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = dbSupabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error };
    }
  },

  async getHeroSlides(): Promise<HeroSlide[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('hero_slides').select('*').order('order_index', { ascending: true })
        );
        if (error) throw error;
        if (data && data.length > 0) {
          setLocal('tracker_hero_slides', data);
          return data as HeroSlide[];
        }
      } catch (e) {
        console.warn('Supabase fetch failed for hero slides, falling back to local storage', e);
      }
    }
    return getLocal<HeroSlide[]>('tracker_hero_slides', []);
  },

  async saveHeroSlide(slide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide | null> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        if (slide.id) {
          const { data, error } = await withTimeout(
            dbSupabase.from('hero_slides').update(slide).eq('id', slide.id).select().single()
          );
          if (error) throw error;
          return data as HeroSlide;
        } else {
          const { data, error } = await withTimeout(
            dbSupabase.from('hero_slides').insert([slide]).select().single()
          );
          if (error) throw error;
          return data as HeroSlide;
        }
      } catch (e) {
        console.warn('Supabase save failed for hero slide', e);
      }
    }
    // Local fallback
    const slides = getLocal<HeroSlide[]>('tracker_hero_slides', []);
    if (slide.id) {
      const idx = slides.findIndex(s => s.id === slide.id);
      if (idx !== -1) {
        slides[idx] = slide as HeroSlide;
        setLocal('tracker_hero_slides', slides);
        return slides[idx];
      }
    } else {
      const newSlide = { ...slide, id: `hs-${Date.now()}` } as HeroSlide;
      slides.push(newSlide);
      setLocal('tracker_hero_slides', slides);
      return newSlide;
    }
    return null;
  },

  async deleteHeroSlide(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(
          dbSupabase.from('hero_slides').delete().eq('id', id)
        );
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete failed for hero slide', e);
      }
    }
    const slides = getLocal<HeroSlide[]>('tracker_hero_slides', []);
    setLocal('tracker_hero_slides', slides.filter(s => s.id !== id));
    return true;
  },

  async getStoreSettings(): Promise<StoreSettings> {
    const defaultSettings: StoreSettings = { id: 'default', upi_id: 'anshajshaji3-2@okicici', phone_number: '919778052356' };
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('store_settings').select('*').eq('id', 'default').single()
        );
        if (error) throw error;
        if (data) {
          setLocal('tracker_store_settings', data);
          return data as StoreSettings;
        }
      } catch (e) {
        console.warn('Supabase settings fetch failed', e);
      }
    }
    return getLocal<StoreSettings>('tracker_store_settings', defaultSettings);
  },

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = { ...current, ...updates };
    const useSupabase = await getUseSupabase();
    
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(
          dbSupabase.from('store_settings').upsert(updated)
        );
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase settings update failed', e);
      }
    }
    setLocal('tracker_store_settings', updated);
    return updated;
  }
};
