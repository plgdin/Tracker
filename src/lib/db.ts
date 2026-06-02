import { supabase as supabaseClient } from './supabase';
import { useAuthStore } from '../store/authStore';
// Types
export interface Item {
  id: string;
  user_id?: string;
  added_by?: string;
  barcode?: string;
  name: string;
  expiration_date: string; // YYYY-MM-DD
  warning_date?: string; // YYYY-MM-DD
  quantity: number;
  category: string;
  notes?: string;
  price?: number; // Price field for products
  image_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
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
    previous_price?: number;
    new_price?: number;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface AppSettings {
  warning_period_days: number;
}

const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key';

export const dbSupabase = isSupabaseConfigured ? supabaseClient : null;
export const supabase = dbSupabase;

// Synchronously/asynchronously verify if we have a valid authenticated user session with Supabase
const getUseSupabase = async (): Promise<boolean> => {
  if (!dbSupabase) return false;
  try {
    const { data: { session } } = await dbSupabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
};

// Race promise helper to prevent infinite loading screens on database hang/timeout
const withTimeout = <T>(promiseLike: PromiseLike<T>, timeoutMs = 2500): Promise<T> => {
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
  { id: 'cat-4', name: 'Bakery', color: '#F59E0B', icon: 'Croissant', created_at: new Date().toISOString() },
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

const getLocalCategories = (): Category[] => getLocal<Category[]>('tracker_categories', DEFAULT_CATEGORIES);

const hasLocalCategories = (): boolean => localStorage.getItem('tracker_categories') !== null;

const deleteLocalCategory = (id: string): boolean => {
  const categories = getLocalCategories();
  const filtered = categories.filter(c => c.id !== id);
  setLocal('tracker_categories', filtered);
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
          dbSupabase.from('items').select('*').order('expiration_date', { ascending: true })
        );
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocal<Item[]>('tracker_items', []).sort(
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
        const { data, error } = await withTimeout(
          dbSupabase
            .from('items')
            .insert([{ ...item, user_id: userData?.user?.id }])
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
      const items = getLocal<Item[]>('tracker_items', []);
      items.push(newItem);
      setLocal('tracker_items', items);
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
            .from('items')
            .update(updates)
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
      const items = getLocal<Item[]>('tracker_items', []);
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updates };
        setLocal('tracker_items', items);
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
        const { error } = await withTimeout(dbSupabase.from('items').delete().eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase delete failed, removing from LocalStorage', e);
      }
    }

    const items = getLocal<Item[]>('tracker_items', []);
    const filtered = items.filter(i => i.id !== id);
    setLocal('tracker_items', filtered);
    return true;
  },

  async getItemByBarcode(barcode: string): Promise<Item | null> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('items').select('*').eq('barcode', barcode).maybeSingle()
        );
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.warn('Supabase barcode lookup failed, falling back to LocalStorage', e);
      }
    }
    const items = getLocal<Item[]>('tracker_items', []);
    return items.find(i => i.barcode === barcode) || null;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').select('*').order('name', { ascending: true })
        );
        if (error) throw error;
        if (data && data.length > 0) return data;
        return hasLocalCategories() ? getLocalCategories() : DEFAULT_CATEGORIES;
      } catch (e) {
        console.warn('Supabase categories fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocalCategories();
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
        const { data, error } = await withTimeout(
          dbSupabase
            .from('categories')
            .insert([{ ...category, user_id: userData?.user?.id }])
            .select()
            .single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase category insert failed, saving to LocalStorage', e);
      }
    }

    const categories = getLocalCategories();
    categories.push(newCategory);
    setLocal('tracker_categories', categories);
    return newCategory;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').delete().eq('id', id).select('id')
        );
        if (error) throw error;
        if (data && data.length > 0) {
          if (hasLocalCategories()) {
            deleteLocalCategory(id);
          } else {
            setLocal('tracker_categories', []);
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
          dbSupabase.from('shopping_list').select('*').order('created_at', { ascending: false })
        );
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Supabase shopping fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocal<ShoppingItem[]>('tracker_shopping_list', []).sort(
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
            .from('shopping_list')
            .insert([{ item_name: itemName, is_purchased: false, user_id: userData?.user?.id }])
            .select()
            .single()
        );
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase shopping insert failed, saving to LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>('tracker_shopping_list', []);
    shoppingList.unshift(newItem);
    setLocal('tracker_shopping_list', shoppingList);
    await db.addAuditLog('Added Shopping Item', itemName);
    return newItem;
  },

  async toggleShoppingItem(id: string, isPurchased: boolean): Promise<ShoppingItem> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase
            .from('shopping_list')
            .update({ is_purchased: isPurchased })
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

    const shoppingList = getLocal<ShoppingItem[]>('tracker_shopping_list', []);
    const idx = shoppingList.findIndex(i => i.id === id);
    if (idx !== -1) {
      shoppingList[idx].is_purchased = isPurchased;
      setLocal('tracker_shopping_list', shoppingList);
      await db.addAuditLog(isPurchased ? 'Checked Shopping Item' : 'Unchecked Shopping Item', shoppingList[idx].item_name);
      return shoppingList[idx];
    }
    throw new Error('Shopping item not found');
  },

  async deleteShoppingItem(id: string): Promise<boolean> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { error } = await withTimeout(dbSupabase.from('shopping_list').delete().eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase shopping delete failed, removing from LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>('tracker_shopping_list', []);
    const itemToDelete = shoppingList.find(i => i.id === id);
    const filtered = shoppingList.filter(i => i.id !== id);
    setLocal('tracker_shopping_list', filtered);
    if (itemToDelete) {
      await db.addAuditLog('Deleted Shopping Item', itemToDelete.item_name);
    }
    return true;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    return getLocal<AppSettings>('tracker_settings', { warning_period_days: 30 });
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    setLocal('tracker_settings', settings);
    return settings;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('audit_logs').select('*').order('created_at', { ascending: false })
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
    return getLocal<AuditLog[]>('tracker_audit_logs', []);
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

    const logs = getLocal<AuditLog[]>('tracker_audit_logs', []);
    logs.unshift(newLog);
    setLocal('tracker_audit_logs', logs.slice(0, 100));
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
  }
};
