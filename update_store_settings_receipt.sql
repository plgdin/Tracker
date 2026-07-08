-- Add receipt configuration columns to store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_header_1 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_header_2 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_header_3 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_header_4 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_footer_1 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS receipt_footer_2 TEXT;
