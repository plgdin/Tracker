-- 1. Create the 'product-images' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Safely drop policies if they exist to prevent errors when re-running
DROP POLICY IF EXISTS "product_images_public_access" ON storage.objects;
DROP POLICY IF EXISTS "product_images_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_auth_delete" ON storage.objects;

-- 2. Create policy to allow public viewing of product images
CREATE POLICY "product_images_public_access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 3. Create policy to allow authenticated users to upload product images
CREATE POLICY "product_images_auth_insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- 4. Create policy to allow authenticated users to update their own uploads
CREATE POLICY "product_images_auth_update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images');

-- 5. Create policy to allow authenticated users to delete their own uploads
CREATE POLICY "product_images_auth_delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images');
