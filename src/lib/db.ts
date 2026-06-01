import { supabase as supabaseClient } from './supabase';
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

// Race promise helper to prevent infinite loading screens on database hang/timeout
const withTimeout = (promiseLike: any, timeoutMs = 2500): Promise<any> => {
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

// Main DB operations with fallback
export const db = {
  // Items
  async getItems(): Promise<Item[]> {
    if (dbSupabase) {
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

    if (dbSupabase) {
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
        return data;
      } catch (e) {
        console.warn('Supabase insert failed, saving to LocalStorage', e);
      }
    }

    const items = getLocal<Item[]>('tracker_items', []);
    items.push(newItem);
    setLocal('tracker_items', items);
    return newItem;
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    if (dbSupabase) {
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
        return data;
      } catch (e) {
        console.warn('Supabase update failed, updating LocalStorage', e);
      }
    }

    const items = getLocal<Item[]>('tracker_items', []);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      setLocal('tracker_items', items);
      return items[idx];
    }
    throw new Error('Item not found');
  },

  async deleteItem(id: string): Promise<boolean> {
    if (dbSupabase) {
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

  // Categories
  async getCategories(): Promise<Category[]> {
    if (dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').select('*').order('name', { ascending: true })
        );
        if (error) throw error;
        return data && data.length > 0 ? data : DEFAULT_CATEGORIES;
      } catch (e) {
        console.warn('Supabase categories fetch failed, falling back to LocalStorage', e);
      }
    }
    return getLocal<Category[]>('tracker_categories', DEFAULT_CATEGORIES);
  },

  async addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      created_at: new Date().toISOString()
    };

    if (dbSupabase) {
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

    const categories = getLocal<Category[]>('tracker_categories', DEFAULT_CATEGORIES);
    categories.push(newCategory);
    setLocal('tracker_categories', categories);
    return newCategory;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (dbSupabase) {
      try {
        const { error } = await withTimeout(dbSupabase.from('categories').delete().eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase category delete failed, removing from LocalStorage', e);
      }
    }

    const categories = getLocal<Category[]>('tracker_categories', DEFAULT_CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    setLocal('tracker_categories', filtered);
    return true;
  },

  // Shopping List
  async getShoppingList(): Promise<ShoppingItem[]> {
    if (dbSupabase) {
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

    if (dbSupabase) {
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
    return newItem;
  },

  async toggleShoppingItem(id: string, isPurchased: boolean): Promise<ShoppingItem> {
    if (dbSupabase) {
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
      return shoppingList[idx];
    }
    throw new Error('Shopping item not found');
  },

  async deleteShoppingItem(id: string): Promise<boolean> {
    if (dbSupabase) {
      try {
        const { error } = await withTimeout(dbSupabase.from('shopping_list').delete().eq('id', id));
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase shopping delete failed, removing from LocalStorage', e);
      }
    }

    const shoppingList = getLocal<ShoppingItem[]>('tracker_shopping_list', []);
    const filtered = shoppingList.filter(i => i.id !== id);
    setLocal('tracker_shopping_list', filtered);
    return true;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    return getLocal<AppSettings>('tracker_settings', { warning_period_days: 30 });
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    setLocal('tracker_settings', settings);
    return settings;
  }
};
