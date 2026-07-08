-- Add footer configuration columns to store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_description TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_phone TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_hours TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_days TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_copyright TEXT;
