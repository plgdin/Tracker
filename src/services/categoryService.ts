import type { Category } from '../types/ecommerce';
import { INITIAL_CATEGORIES } from './mockData';

const STORAGE_KEY = 'bnj_categories';

const getStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
};

const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
};

export const categoryService = {
  /**
   * Fetch all categories
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
   */
  async getAll(): Promise<Category[]> {
    const cats = getStoredCategories();
    return cats.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /**
   * Get category by slug or ID
   */
  async getBySlugOrId(identifier: string): Promise<Category | undefined> {
    const all = await this.getAll();
    return all.find((c) => c.slug === identifier || c.id === identifier);
  },

  /**
   * Create category (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('categories').insert([cat]).select().single();
   */
  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const list = getStoredCategories();
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    list.push(newCat);
    saveCategories(list);
    return newCat;
  },

  /**
   * Update category (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
   */
  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const list = getStoredCategories();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    list[idx] = { ...list[idx], ...updates };
    saveCategories(list);
    return list[idx];
  },

  /**
   * Delete category (Admin)
   * Supabase Integration Point:
   * const { error } = await supabase.from('categories').delete().eq('id', id);
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredCategories();
    const filtered = list.filter((c) => c.id !== id);
    saveCategories(filtered);
    return true;
  },

  /**
   * Reset categories to defaults
   */
  async resetToDefaults(): Promise<void> {
    saveCategories(INITIAL_CATEGORIES);
  },
};
