-- Expiry Date Tracker Database Schema (V2 with Roles & Audit Logs)

-- 1. Create profiles table (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'worker', 'pending', 'disabled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- owner/workspace
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- the worker who added it
    barcode TEXT,
    name TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    quantity INTEGER DEFAULT 1,
    category TEXT DEFAULT 'Uncategorized',
    brand TEXT,
    origin TEXT,
    notes TEXT,
    price NUMERIC,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4F46E5',
    icon TEXT DEFAULT 'tag',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create shopping_list table
CREATE TABLE shopping_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- workspace
    worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'added_item', 'deleted_item'
    details JSONB, -- stores item name, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Simplified for demo: assumes all authenticated users can read/write their workspace data)
-- For a real production app, you would lock down deletes/audit logs to admins only.

CREATE POLICY "Enable read access for authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on id" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to approve/disable users. This is a simple demo policy.
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Public can read items and categories (Storefront access)
CREATE POLICY "Public users can read items" ON items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items" ON items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update items" ON items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete items" ON items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Public users can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Setup Storage for item images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true) ON CONFLICT DO NOTHING;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'pending')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Add store_type to existing tables
ALTER TABLE items ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE categories ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE shopping_list ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE audit_logs ADD COLUMN store_type TEXT DEFAULT 'offline';

-- Add store_type to ledger tables
ALTER TABLE ledger_purchase_invoices ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE ledger_sales_invoices ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE ledger_customers ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE ledger_payments ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE ledger_inventory ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE ledger_brands ADD COLUMN store_type TEXT DEFAULT 'offline';
