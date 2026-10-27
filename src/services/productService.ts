import type { Product } from '../types/ecommerce';
import { INITIAL_PRODUCTS } from './mockData';
import { db } from '../lib/db';
import type { Item } from '../lib/db';

const STORAGE_KEY = 'nayakart_products_v5';

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
   * Fetch all products from stanes db backend
   */
  async getAll(): Promise<Product[]> {
    try {
      const items: Item[] = await db.getItems();
      if (items && items.length > 0) {
        const mapped: Product[] = items.map((item: Item) => {
          let extra: Record<string, any> = {};
          try {
            if (item.notes && item.notes.startsWith('{')) {
              extra = JSON.parse(item.notes);
            }
          } catch {
            // Not JSON
          }

          return {
            id: String(item.id),
            name: item.name || 'Product',
            slug: (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: extra.description || item.notes || item.name || '',
            price: Number(item.price) || 0,
            discountPrice: extra.discountPrice !== undefined ? Number(extra.discountPrice) : undefined,
            categoryId: item.category || 'all',
            categoryName: item.category || 'Uncategorized',
            images: item.image_url ? [item.image_url] : (extra.images || []),
            stock: Number(item.quantity) || 0,
            brand: extra.brand || 'Bake & Joy',
            rating: extra.rating || 4.8,
            reviewsCount: extra.reviewsCount || 12,
            isFeatured: extra.isFeatured ?? true,
            isActive: extra.isActive ?? true,
            unit: extra.unit || 'Piece',
            createdAt: item.created_at || new Date().toISOString(),
          };
        });

        saveProducts(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend items fetch failed, using stored products:', e);
    }

    return getStoredProducts();
  },

  async getActive(): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter((p) => p.isActive);
  },

  async getById(id: string): Promise<Product | undefined> {
    const all = await this.getAll();
    return all.find((p) => p.id === id);
  },

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
      list = list.filter((p) => p.categoryId === params.categoryId || p.categoryName === params.categoryId);
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

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const extra = {
      description: product.description,
      discountPrice: product.discountPrice,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      unit: product.unit,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      images: product.images,
      brand: product.brand,
    };

    let createdId = `prod-${Date.now()}`;
    try {
      const added = await db.addItem({
        name: product.name,
        price: product.price.toString(),
        quantity: product.stock,
        category: product.categoryName || product.categoryId,
        notes: JSON.stringify(extra),
        image_url: product.images?.[0] || '',
        store_segment: 'bakery',
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      if (added?.id) createdId = String(added.id);
    } catch (e) {
      console.warn('Backend db.addItem failed:', e);
    }

    const newProduct: Product = {
      ...product,
      id: createdId,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date().toISOString(),
    };

    const list = getStoredProducts();
    list.unshift(newProduct);
    saveProducts(list);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const list = getStoredProducts();
    const idx = list.findIndex((p) => p.id === id);
    const existing = idx !== -1 ? list[idx] : null;
    const merged = { ...(existing || {}), ...updates } as Product;

    try {
      const extra = {
        description: merged.description,
        discountPrice: merged.discountPrice,
        isFeatured: merged.isFeatured,
        isActive: merged.isActive,
        unit: merged.unit,
        rating: merged.rating,
        reviewsCount: merged.reviewsCount,
        images: merged.images,
        brand: merged.brand,
      };

      await db.updateItem(id, {
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.price !== undefined ? { price: updates.price.toString() } : {}),
        ...(updates.stock !== undefined ? { quantity: updates.stock } : {}),
        ...(updates.categoryName || updates.categoryId ? { category: updates.categoryName || updates.categoryId } : {}),
        ...(updates.images?.[0] ? { image_url: updates.images[0] } : {}),
        notes: JSON.stringify(extra),
      });
    } catch (e) {
      console.warn('Backend db.updateItem failed:', e);
    }

    if (idx !== -1) {
      list[idx] = merged;
      saveProducts(list);
      return list[idx];
    }
    return merged;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await db.deleteItem(id);
    } catch (e) {
      console.warn('Backend db.deleteItem failed:', e);
    }

    const list = getStoredProducts();
    saveProducts(list.filter((p) => p.id !== id));
    return true;
  },

  async resetToDefaults(): Promise<void> {
    saveProducts(INITIAL_PRODUCTS);
  },
};
