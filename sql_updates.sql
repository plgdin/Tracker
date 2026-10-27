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
