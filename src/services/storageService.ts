/**
 * Storage Service for handling image selection, local base64 previews in demo mode,
 * with documented integration points for Supabase Storage.
 */
export const storageService = {
  /**
   * Convert an image File to a base64 Data URL for local demo previews and testing.
   * 
   * Supabase Storage Integration Point:
   * const fileExt = file.name.split('.').pop();
   * const fileName = `${Math.random()}.${fileExt}`;
   * const filePath = `products/${fileName}`;
   * 
   * const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
   * if (uploadError) throw uploadError;
   * 
   * const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
   * return data.publicUrl;
   */
  async previewFile(file: File): Promise<string> {
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
