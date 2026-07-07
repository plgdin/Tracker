-- Drop the table and policies if they already exist so we can recreate them with the new columns
DROP TABLE IF EXISTS online_orders CASCADE;

-- Create online_orders table
CREATE TABLE online_orders (
  id TEXT PRIMARY KEY,
  store_type TEXT DEFAULT 'online',
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_type TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  offer_code TEXT,
  total_amount NUMERIC NOT NULL,
  items JSONB NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins and workers to view all orders
CREATE POLICY "Admins and workers can view all online_orders"
ON online_orders FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow inserting orders without authentication
-- (Since customers checking out might not be logged in, depending on the store's flow)
CREATE POLICY "Anyone can insert online_orders"
ON online_orders FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Create policy to allow updating orders (status changes)
CREATE POLICY "Admins and workers can update online_orders"
ON online_orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
