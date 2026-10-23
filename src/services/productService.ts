import type { Product } from '../types/ecommerce';
import { INITIAL_PRODUCTS } from './mockData';

const STORAGE_KEY = 'bnj_products';

const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const productService = {
  /**
   * Fetch all products.
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
   */
  async getAll(): Promise<Product[]> {
    return getStoredProducts();
  },

  /**
   * Fetch active products for customer storefront
   */
  async getActive(): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter((p) => p.isActive);
  },

  /**
   * Fetch product by ID
   */
  async getById(id: string): Promise<Product | undefined> {
    const all = await this.getAll();
    return all.find((p) => p.id === id);
  },

  /**
   * Search and filter products
   */
  async search(params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'popular' | 'newest' | 'featured';
  }): Promise<Product[]> {
    let list = await this.getActive();

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.categoryId && params.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === params.categoryId);
    }

    if (params.minPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.price) >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.price) <= params.maxPrice!);
    }

    if (params.inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price_desc':
          list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'popular':
          list.sort((a, b) => b.reviewsCount - a.reviewsCount);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return list;
  },

  /**
   * Create a new product (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('products').insert([productData]).select().single();
   */
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const list = getStoredProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newProduct);
    saveProducts(list);
    return newProduct;
  },

  /**
   * Update an existing product (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
   */
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const list = getStoredProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    list[idx] = { ...list[idx], ...updates };
    saveProducts(list);
    return list[idx];
  },

  /**
   * Delete a product (Admin)
   * Supabase Integration Point:
   * const { error } = await supabase.from('products').delete().eq('id', id);
   */
  async delete(id: string): Promise<boolean> {
    const list = getStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveProducts(filtered);
    return true;
  },

  /**
   * Reset to initial mock catalog
   */
  async resetToDefaults(): Promise<void> {
    saveProducts(INITIAL_PRODUCTS);
  },
};
