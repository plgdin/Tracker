-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on hero_slides"
ON hero_slides FOR SELECT
USING (true);

-- Allow authenticated users (admins) to insert/update/delete
CREATE POLICY "Allow authenticated users to insert hero_slides"
ON hero_slides FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update hero_slides"
ON hero_slides FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete hero_slides"
ON hero_slides FOR DELETE
TO authenticated
USING (true);

-- Insert default initial slides
INSERT INTO hero_slides (image_url, title, subtitle, order_index)
VALUES 
    ('/hero-1.jpg', 'Premium Culinary Ingredients', 'High-quality flour, oils, sauces, spices, and raw materials for every kitchen.', 1),
    ('/hero-2.jpg', 'Professional Chef Supplies', 'Baking instruments, cooking utensils, and equipment designed for professionals.', 2),
    ('/hero-3.jpg', 'Finest Raw Materials & Spices', 'Source premium spices, specialized baking supplies, and essential ingredients.', 3),
    ('/hero-4.jpg', 'Equip Your Culinary Journey', 'From cooking utensils to premium raw materials, find everything you need to create.', 4);
