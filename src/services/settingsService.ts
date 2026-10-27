import type { StoreSettings } from '../types/ecommerce';
import { INITIAL_SETTINGS } from './mockData';
import { db } from '../lib/db';

const STORAGE_KEY = 'nayakart_settings_v5';

const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
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
   * Retrieve current store settings connected to stanes db backend
   */
  async getSettings(): Promise<StoreSettings> {
    try {
      const dbSettings = await db.getStoreSettings();
      if (dbSettings) {
        const current = getStoredSettings();
        const merged: StoreSettings = {
          ...current,
          phone: dbSettings.phone_number || current.phone,
          whatsappNumber: dbSettings.phone_number || current.whatsappNumber,
          description: dbSettings.footer_description || current.description,
          openingHours: dbSettings.footer_hours ? `${dbSettings.footer_days || 'Mon - Sun'}: ${dbSettings.footer_hours}` : current.openingHours,
        };
        saveSettings(merged);
        return merged;
      }
    } catch (e) {
      console.warn('Backend store_settings fetch failed, using stored:', e);
    }

    return getStoredSettings();
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = getStoredSettings();
    const updated = { ...current, ...updates };

    try {
      await db.updateStoreSettings({
        phone_number: updates.whatsappNumber || updates.phone || current.phone,
        footer_description: updates.description || current.description,
        footer_hours: updates.openingHours || current.openingHours,
        footer_copyright: `© ${new Date().getFullYear()} ${updates.storeName || current.storeName}. All rights reserved.`,
      });
    } catch (e) {
      console.warn('Backend updateStoreSettings failed:', e);
    }

    saveSettings(updated);
    return updated;
  },

  async resetToDefaults(): Promise<StoreSettings> {
    saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },
};
