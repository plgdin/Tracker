-- Add GST percentage column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC DEFAULT 0;
