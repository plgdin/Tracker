import { supabase as supabaseClient } from './supabase';
import { useAuthStore } from '../store/authStore';
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
  price?: number;
  image_url?: string;
  tax_percentage?: number;
  is_imported?: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
  parent_id?: string;
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
  if (useAuthStore.getState().user) return true;
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
  // Parent Categories
  { id: '1', name: '7C Baking Ingredients', color: '#6366F1', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '2', name: 'Aluminum Moulds', color: '#EF4444', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '3', name: 'Appliances Mixers', color: '#10B981', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '4', name: 'Arife Wow Sale', color: '#F59E0B', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '5', name: 'Bake & Serve', color: '#8B5CF6', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '6', name: 'Baking Ingredients', color: '#EC4899', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '7', name: 'Baking Tools & Accessories', color: '#06B6D4', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '8', name: 'Piping Nozzles', color: '#84CC16', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '9', name: 'Brands', color: '#6366F1', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '10', name: 'Cake And Cupcake Stand', color: '#EF4444', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '11', name: 'Cake Base', color: '#10B981', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '12', name: 'Cake Dummies', color: '#F59E0B', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '13', name: 'Cake Toppers', color: '#8B5CF6', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '14', name: 'Chocolate And Cupcake Boxes', color: '#EC4899', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '15', name: 'Chocolate Wrappers', color: '#06B6D4', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '16', name: 'Cutters', color: '#84CC16', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '17', name: 'Diwali Mould', color: '#6366F1', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '18', name: 'Diy Stamps Fondant Embosser', color: '#EF4444', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '19', name: 'Feather', color: '#10B981', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '20', name: 'Festival Themes', color: '#F59E0B', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '21', name: 'Knives And Spatula', color: '#8B5CF6', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '22', name: 'Kulfi Moulds', color: '#EC4899', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '23', name: 'Leafs And Flakes', color: '#06B6D4', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '24', name: 'Non Edible Dust', color: '#84CC16', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '25', name: 'Non Stick Moulds', color: '#6366F1', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '26', name: 'Nylon Spoon', color: '#EF4444', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '27', name: 'Party Supplies', color: '#10B981', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '28', name: 'Polycarbonate Moulds', color: '#F59E0B', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '29', name: 'Pvc Mould', color: '#8B5CF6', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '30', name: 'Resin Arts', color: '#EC4899', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '31', name: 'Scraper', color: '#06B6D4', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '32', name: 'Selfie Mirror', color: '#84CC16', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '33', name: 'Silicon Moulds', color: '#6366F1', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '34', name: 'Sprinklers And Candies', color: '#EF4444', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '35', name: 'Stencils', color: '#10B981', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '36', name: 'Sticker', color: '#F59E0B', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '37', name: 'Ultimakes', color: '#8B5CF6', icon: 'Tag', created_at: new Date().toISOString() },
  { id: '38', name: 'Uncategorized', color: '#9CA3AF', icon: 'Box', created_at: new Date().toISOString() },
  
  // Example Subcategories
  { id: 'sub-1a', name: 'Flours', color: '#6366F1', icon: 'Tag', parent_id: '1', created_at: new Date().toISOString() },
  { id: 'sub-1b', name: 'Sugars', color: '#6366F1', icon: 'Tag', parent_id: '1', created_at: new Date().toISOString() },
  { id: 'sub-2a', name: 'Round Moulds', color: '#EF4444', icon: 'Tag', parent_id: '2', created_at: new Date().toISOString() },
  { id: 'sub-2b', name: 'Square Moulds', color: '#EF4444', icon: 'Tag', parent_id: '2', created_at: new Date().toISOString() },
  { id: 'sub-3a', name: 'Hand Mixers', color: '#10B981', icon: 'Tag', parent_id: '3', created_at: new Date().toISOString() },
  { id: 'sub-3b', name: 'Stand Mixers', color: '#10B981', icon: 'Tag', parent_id: '3', created_at: new Date().toISOString() },
  { id: 'sub-5a', name: 'Paper Cups', color: '#8B5CF6', icon: 'Tag', parent_id: '5', created_at: new Date().toISOString() },
  { id: 'sub-5b', name: 'Foil Trays', color: '#8B5CF6', icon: 'Tag', parent_id: '5', created_at: new Date().toISOString() },
  { id: 'sub-6a', name: 'Essence & Colors', color: '#EC4899', icon: 'Tag', parent_id: '6', created_at: new Date().toISOString() },
  { id: 'sub-6b', name: 'Leavening Agents', color: '#EC4899', icon: 'Tag', parent_id: '6', created_at: new Date().toISOString() },
  { id: 'sub-7a', name: 'Measuring Cups', color: '#06B6D4', icon: 'Tag', parent_id: '7', created_at: new Date().toISOString() },
  { id: 'sub-7b', name: 'Whisks', color: '#06B6D4', icon: 'Tag', parent_id: '7', created_at: new Date().toISOString() },
  { id: 'sub-8a', name: 'Star Nozzles', color: '#84CC16', icon: 'Tag', parent_id: '8', created_at: new Date().toISOString() },
  { id: 'sub-8b', name: 'Round Nozzles', color: '#84CC16', icon: 'Tag', parent_id: '8', created_at: new Date().toISOString() },
  { id: 'sub-9a', name: 'Wilton', color: '#6366F1', icon: 'Tag', parent_id: '9', created_at: new Date().toISOString() },
  { id: 'sub-9b', name: 'Ateco', color: '#6366F1', icon: 'Tag', parent_id: '9', created_at: new Date().toISOString() },
  { id: 'sub-10a', name: 'Tiered Stands', color: '#EF4444', icon: 'Tag', parent_id: '10', created_at: new Date().toISOString() },
  { id: 'sub-10b', name: 'Pedestal Stands', color: '#EF4444', icon: 'Tag', parent_id: '10', created_at: new Date().toISOString() },
  { id: 'sub-11a', name: 'Round Boards', color: '#10B981', icon: 'Tag', parent_id: '11', created_at: new Date().toISOString() },
  { id: 'sub-11b', name: 'Square Boards', color: '#10B981', icon: 'Tag', parent_id: '11', created_at: new Date().toISOString() },
  { id: 'sub-12a', name: 'Styrofoam Rounds', color: '#F59E0B', icon: 'Tag', parent_id: '12', created_at: new Date().toISOString() },
  { id: 'sub-13a', name: 'Happy Birthday', color: '#8B5CF6', icon: 'Tag', parent_id: '13', created_at: new Date().toISOString() },
  { id: 'sub-13b', name: 'Anniversary', color: '#8B5CF6', icon: 'Tag', parent_id: '13', created_at: new Date().toISOString() },
  { id: 'sub-14a', name: 'Single Cupcake', color: '#EC4899', icon: 'Tag', parent_id: '14', created_at: new Date().toISOString() },
  { id: 'sub-14b', name: 'Half Dozen', color: '#EC4899', icon: 'Tag', parent_id: '14', created_at: new Date().toISOString() },
  { id: 'sub-15a', name: 'Foil Wrappers', color: '#06B6D4', icon: 'Tag', parent_id: '15', created_at: new Date().toISOString() },
  { id: 'sub-16a', name: 'Cookie Cutters', color: '#84CC16', icon: 'Tag', parent_id: '16', created_at: new Date().toISOString() },
  { id: 'sub-16b', name: 'Fondant Cutters', color: '#84CC16', icon: 'Tag', parent_id: '16', created_at: new Date().toISOString() },
  { id: 'sub-17a', name: 'Diya Mould', color: '#6366F1', icon: 'Tag', parent_id: '17', created_at: new Date().toISOString() },
  { id: 'sub-18a', name: 'Alphabets', color: '#EF4444', icon: 'Tag', parent_id: '18', created_at: new Date().toISOString() },
  { id: 'sub-18b', name: 'Patterns', color: '#EF4444', icon: 'Tag', parent_id: '18', created_at: new Date().toISOString() },
  { id: 'sub-20a', name: 'Christmas', color: '#F59E0B', icon: 'Tag', parent_id: '20', created_at: new Date().toISOString() },
  { id: 'sub-20b', name: 'Halloween', color: '#F59E0B', icon: 'Tag', parent_id: '20', created_at: new Date().toISOString() },
  { id: 'sub-21a', name: 'Palette Knives', color: '#8B5CF6', icon: 'Tag', parent_id: '21', created_at: new Date().toISOString() },
  { id: 'sub-21b', name: 'Bread Knives', color: '#8B5CF6', icon: 'Tag', parent_id: '21', created_at: new Date().toISOString() },
  { id: 'sub-23a', name: 'Gold Leaf', color: '#06B6D4', icon: 'Tag', parent_id: '23', created_at: new Date().toISOString() },
  { id: 'sub-25a', name: 'Muffin Pans', color: '#6366F1', icon: 'Tag', parent_id: '25', created_at: new Date().toISOString() },
  { id: 'sub-27a', name: 'Balloons', color: '#10B981', icon: 'Tag', parent_id: '27', created_at: new Date().toISOString() },
  { id: 'sub-27b', name: 'Candles', color: '#10B981', icon: 'Tag', parent_id: '27', created_at: new Date().toISOString() },
  { id: 'sub-28a', name: 'Praline', color: '#F59E0B', icon: 'Tag', parent_id: '28', created_at: new Date().toISOString() },
  { id: 'sub-29a', name: 'Chocolate Bars', color: '#8B5CF6', icon: 'Tag', parent_id: '29', created_at: new Date().toISOString() },
  { id: 'sub-30a', name: 'Moulds', color: '#EC4899', icon: 'Tag', parent_id: '30', created_at: new Date().toISOString() },
  { id: 'sub-30b', name: 'Pigments', color: '#EC4899', icon: 'Tag', parent_id: '30', created_at: new Date().toISOString() },
  { id: 'sub-33a', name: 'Fondant Moulds', color: '#6366F1', icon: 'Tag', parent_id: '33', created_at: new Date().toISOString() },
  { id: 'sub-33b', name: 'Baking Mats', color: '#6366F1', icon: 'Tag', parent_id: '33', created_at: new Date().toISOString() },
  { id: 'sub-34a', name: 'Jimmies', color: '#EF4444', icon: 'Tag', parent_id: '34', created_at: new Date().toISOString() },
  { id: 'sub-34b', name: 'Nonpareils', color: '#EF4444', icon: 'Tag', parent_id: '34', created_at: new Date().toISOString() },
  { id: 'sub-35a', name: 'Floral Stencils', color: '#10B981', icon: 'Tag', parent_id: '35', created_at: new Date().toISOString() },
  { id: 'sub-35b', name: 'Geometric Stencils', color: '#10B981', icon: 'Tag', parent_id: '35', created_at: new Date().toISOString() },
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
        const result = data || [];
        // Cache the fresh items in local storage
        setLocal('tracker_items', result);
        return result;
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


  async getCategories(): Promise<Category[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('categories').select('*').order('name', { ascending: true })
        );
        if (error) throw error;
        
        let result = data && data.length > 0 ? data : (hasLocalCategories() ? getLocalCategories() : DEFAULT_CATEGORIES);
        
        // Auto-update if default categories were added (like the new subcategories)
        if (result.length < DEFAULT_CATEGORIES.length) {
           result = [...result];
           for (const defCat of DEFAULT_CATEGORIES) {
             if (!result.find((c: Category) => c.id === defCat.id || c.name === defCat.name)) {
               result.push(defCat);
               // Also insert to supabase if possible
               dbSupabase.from('categories').insert([defCat]).then();
             }
           }
        }

        // Cache the fresh categories in local storage
        setLocal('tracker_categories', result);
        return result;
      } catch (e) {
        console.warn('Supabase categories fetch failed, falling back to LocalStorage', e);
      }
    }
    
    let localCats = getLocalCategories();
    if (localCats.length < DEFAULT_CATEGORIES.length) {
       for (const defCat of DEFAULT_CATEGORIES) {
         if (!localCats.find((c: Category) => c.id === defCat.id || c.name === defCat.name)) {
           localCats.push(defCat);
         }
       }
       setLocal('tracker_categories', localCats);
    }
    
    return localCats;
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
