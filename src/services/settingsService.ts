import type { StoreSettings } from '../types/ecommerce';
import { INITIAL_SETTINGS } from './mockData';

const STORAGE_KEY = 'bakenjoy_settings_v4';

const getStoredSettings = (): StoreSettings => {
  try {
    localStorage.removeItem('bnj_settings');
    localStorage.removeItem('nayakart_settings');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.storeName || parsed.storeName === 'NayaKart' || parsed.storeName === 'Bake & Joy') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch {
    return INITIAL_SETTINGS;
  }
};

const saveSettings = (settings: StoreSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const settingsService = {
  /**
   * Retrieve current store settings
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('store_settings').select('*').single();
   */
  async getSettings(): Promise<StoreSettings> {
    return getStoredSettings();
  },

  /**
   * Update store settings (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('store_settings').upsert(updates).select().single();
   */
  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = getStoredSettings();
    const updated = { ...current, ...updates };
    saveSettings(updated);
    return updated;
  },

  /**
   * Reset store settings to initial defaults
   */
  async resetToDefaults(): Promise<StoreSettings> {
    saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },
};
