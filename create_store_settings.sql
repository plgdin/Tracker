-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    upi_id TEXT NOT NULL DEFAULT 'anshajshaji3-2@okicici',
    phone_number TEXT NOT NULL DEFAULT '919778052356',
    bank_details TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- In case the table already exists, add the column
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS bank_details TEXT;

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access on store_settings" ON store_settings;
CREATE POLICY "Allow public read access on store_settings"
ON store_settings FOR SELECT
USING (true);

-- Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated users to update store_settings" ON store_settings;
CREATE POLICY "Allow authenticated users to update store_settings"
ON store_settings FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to insert (for initial creation if missing)
DROP POLICY IF EXISTS "Allow authenticated users to insert store_settings" ON store_settings;
CREATE POLICY "Allow authenticated users to insert store_settings"
ON store_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert default row if not exists
INSERT INTO store_settings (id, upi_id, phone_number)
VALUES ('default', 'anshajshaji3-2@okicici', '919778052356')
ON CONFLICT (id) DO NOTHING;
