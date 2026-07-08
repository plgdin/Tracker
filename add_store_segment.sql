-- Add store_segment to items table for separating Hotel and Bakery in public storefront
ALTER TABLE items ADD COLUMN IF NOT EXISTS store_segment TEXT DEFAULT 'both';

-- Optional: ensure constraint
-- ALTER TABLE items ADD CONSTRAINT check_store_segment CHECK (store_segment IN ('hotel', 'bakery', 'both'));

-- Update existing online items to 'both' just in case they were added before the default existed
UPDATE items SET store_segment = 'both' WHERE store_segment IS NULL;
