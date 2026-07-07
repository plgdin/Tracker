-- Create a new public storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'item-images');

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update their files
CREATE POLICY "Authenticated users can update images" 
ON storage.objects FOR UPDATE 
WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
);
