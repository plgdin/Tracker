-- Add store_type to existing tables (with IF EXISTS to prevent crashes if a table is missing)
ALTER TABLE IF EXISTS items ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS categories ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS shopping_list ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS audit_logs ADD COLUMN store_type TEXT DEFAULT 'offline';

-- Add store_type to ledger tables
ALTER TABLE IF EXISTS ledger_purchase_invoices ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS ledger_sales_invoices ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS ledger_customers ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS ledger_payments ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS ledger_inventory ADD COLUMN store_type TEXT DEFAULT 'offline';
ALTER TABLE IF EXISTS ledger_brands ADD COLUMN store_type TEXT DEFAULT 'offline';

-- Ensure online_orders allows customer UTR updates
DROP POLICY IF EXISTS "Admins and workers can update online_orders" ON online_orders;
DROP POLICY IF EXISTS "Allow updating online_orders transaction and status" ON online_orders;
CREATE POLICY "Allow updating online_orders transaction and status"
ON online_orders FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);
