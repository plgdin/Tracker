-- Expiry Date Tracker Database Schema

-- 1. Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    quantity INTEGER DEFAULT 1,
    category TEXT DEFAULT 'Uncategorized',
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4F46E5', -- Indigo
    icon TEXT DEFAULT 'tag',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create shopping_list table
CREATE TABLE shopping_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
-- Items Policies
CREATE POLICY "Users can view their own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view their own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Shopping List Policies
CREATE POLICY "Users can view their own shopping list" ON shopping_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shopping list" ON shopping_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping list" ON shopping_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping list" ON shopping_list FOR DELETE USING (auth.uid() = user_id);

-- 6. Setup Storage for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

CREATE POLICY "Anyone can view item images" ON storage.objects FOR SELECT USING ( bucket_id = 'item-images' );
CREATE POLICY "Users can upload their own item images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'item-images' AND auth.uid() = owner );
CREATE POLICY "Users can update their own item images" ON storage.objects FOR UPDATE USING ( bucket_id = 'item-images' AND auth.uid() = owner );
CREATE POLICY "Users can delete their own item images" ON storage.objects FOR DELETE USING ( bucket_id = 'item-images' AND auth.uid() = owner );
