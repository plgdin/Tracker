import type { Category } from '../types/ecommerce';
import { INITIAL_CATEGORIES } from './mockData';
import { db } from '../lib/db';

const STORAGE_KEY = 'nayakart_categories_v5';

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
   * Fetch all categories connected to stanes db backend ('online' store)
   */
  async getAll(): Promise<Category[]> {
    try {
      const cats = await db.getCategoriesByStore('online');
      if (cats && cats.length > 0) {
        const mapped: Category[] = cats.map((cat, idx) => ({
          id: String(cat.id),
          name: cat.name || 'Category',
          slug: (cat.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: `Explore quality ${cat.name} supplies`,
          imageUrl: cat.image_url || '',
          color: cat.color || '#EAF05C',
          iconName: cat.icon || 'Tag',
          displayOrder: idx + 1,
        }));

        saveCategories(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend categories fetch failed, using stored:', e);
    }

    const stored = getStoredCategories();
    return stored.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getBySlugOrId(identifier: string): Promise<Category | undefined> {
    const all = await this.getAll();
    return all.find((c) => c.slug === identifier || c.id === identifier);
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    let createdId = `cat-${Date.now()}`;
    try {
      const added = await db.addCategory({
        name: category.name,
        color: category.color || '#EAF05C',
        icon: category.iconName || 'Tag',
        image_url: category.imageUrl || '',
      });
      if (added?.id) createdId = String(added.id);
    } catch (e) {
      console.warn('Backend addCategory failed:', e);
    }

    const newCat: Category = {
      ...category,
      id: createdId,
      slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };

    const list = getStoredCategories();
    list.push(newCat);
    saveCategories(list);
    return newCat;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      await db.updateCategory(id, {
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.color ? { color: updates.color } : {}),
        ...(updates.iconName ? { icon: updates.iconName } : {}),
        ...(updates.imageUrl !== undefined ? { image_url: updates.imageUrl } : {}),
      });
    } catch (e) {
      console.warn('Backend updateCategory failed:', e);
    }

    const list = getStoredCategories();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      saveCategories(list);
      return list[idx];
    }
    return updates as Category;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await db.deleteCategory(id);
    } catch (e) {
      console.warn('Backend deleteCategory failed:', e);
    }

    const list = getStoredCategories();
    saveCategories(list.filter((c) => c.id !== id));
    return true;
  },

  async resetToDefaults(): Promise<void> {
    saveCategories(INITIAL_CATEGORIES);
  },
};
