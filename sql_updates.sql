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
