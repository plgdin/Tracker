import { db } from '../lib/db';

export const storageService = {
  /**
   * Upload an image to Supabase Storage ('product-images' bucket) via stanes db backend
   */
  async uploadFile(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file.');
    }

    try {
      const res = await db.uploadProductImage(file);
      if (res.success && res.url) {
        return res.url;
      }
    } catch (e) {
      console.warn('Backend product image upload failed, falling back to base64:', e);
    }

    return this.previewFile(file);
  },

  /**
   * Convert an image File to a base64 Data URL for local previews and fallback.
   */
  async previewFile(file: File): Promise<string> {
    try {
      const uploadedUrl = await this.uploadFile(file);
      if (uploadedUrl && !uploadedUrl.startsWith('data:')) {
        return uploadedUrl;
      }
    } catch {
      // Fallback to data URL
    }

    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
