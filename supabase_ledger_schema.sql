-- ================================================================
-- LEDGER MANAGEMENT SYSTEM — Supabase Schema
-- Run these statements in your Supabase SQL Editor
-- ================================================================

-- 2. Brands
CREATE TABLE IF NOT EXISTS ledger_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS ledger_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  outstanding_balance NUMERIC(12,2) DEFAULT 0,
  last_purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Purchase Invoices
CREATE TABLE IF NOT EXISTS ledger_purchase_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  purchase_date DATE NOT NULL,
  brand_name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Fix #1: Only cash and cheque for purchasing
  payment_method TEXT CHECK (payment_method IN ('cash','cheque')) DEFAULT 'cash',
  cheque_number TEXT,
  cheque_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Purchase Items (line items per invoice)
CREATE TABLE IF NOT EXISTS ledger_purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES ledger_purchase_invoices(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sales Invoices
CREATE TABLE IF NOT EXISTS ledger_sales_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  sale_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  previous_balance NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  -- Fix #2: Only cash and upi for selling
  payment_method TEXT CHECK (payment_method IN ('cash','upi')) DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sales Items (line items per invoice)
CREATE TABLE IF NOT EXISTS ledger_sales_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES ledger_sales_invoices(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments collected from customers
CREATE TABLE IF NOT EXISTS ledger_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash','upi','card','bank_transfer','cheque')) DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Inventory stock tracking
CREATE TABLE IF NOT EXISTS ledger_inventory (
  item_name TEXT PRIMARY KEY,
  stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE ledger_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_inventory ENABLE ROW LEVEL SECURITY;

-- Admin-only access (matches your existing RLS pattern)
CREATE POLICY "Admins full access ledger_purchase_invoices"
  ON ledger_purchase_invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_purchase_items"
  ON ledger_purchase_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_sales_invoices"
  ON ledger_sales_invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_sales_items"
  ON ledger_sales_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_customers"
  ON ledger_customers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_payments"
  ON ledger_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_inventory"
  ON ledger_inventory FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_suppliers"
  ON ledger_suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access ledger_brands"
  ON ledger_brands FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================================
-- USEFUL VIEWS (optional helpers)
-- ================================================================

-- Customer outstanding summary
CREATE OR REPLACE VIEW ledger_outstanding_summary AS
SELECT
  c.name AS customer_name,
  c.phone,
  c.outstanding_balance,
  c.last_purchase_date,
  COUNT(s.id) AS total_invoices,
  COALESCE(SUM(s.total_amount), 0) AS total_billed,
  COALESCE(SUM(s.amount_paid), 0) AS total_collected
FROM ledger_customers c
LEFT JOIN ledger_sales_invoices s ON s.customer_name = c.name
WHERE c.outstanding_balance > 0
GROUP BY c.id, c.name, c.phone, c.outstanding_balance, c.last_purchase_date
ORDER BY c.outstanding_balance DESC;

-- Purchase brand totals
CREATE OR REPLACE VIEW ledger_brand_totals AS
SELECT
  brand_name,
  COUNT(*) AS invoice_count,
  SUM(total_amount) AS total_purchased
FROM ledger_purchase_invoices
GROUP BY brand_name
ORDER BY total_purchased DESC;
