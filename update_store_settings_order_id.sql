-- 1. Add order ID configuration columns to store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS order_id_prefix TEXT DEFAULT 'ORD-';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS order_id_sequence INTEGER DEFAULT 1000;

-- 2. Create RPC to fetch and increment the order ID atomically
CREATE OR REPLACE FUNCTION get_next_order_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_prefix TEXT;
    current_seq INTEGER;
    new_order_id TEXT;
BEGIN
    -- Lock the row for update to prevent concurrent race conditions
    SELECT order_id_prefix, order_id_sequence 
    INTO current_prefix, current_seq
    FROM store_settings 
    WHERE id = 'default'
    FOR UPDATE;

    -- If no settings found, fallback to defaults
    IF NOT FOUND THEN
        current_prefix := 'ORD-';
        current_seq := 1000;
        
        INSERT INTO store_settings (id, order_id_prefix, order_id_sequence)
        VALUES ('default', current_prefix, current_seq + 1)
        ON CONFLICT (id) DO UPDATE 
        SET order_id_sequence = current_seq + 1;
    ELSE
        -- Increment the sequence
        UPDATE store_settings 
        SET order_id_sequence = current_seq + 1 
        WHERE id = 'default';
    END IF;

    -- Generate the final ID (e.g. ORD-1000)
    new_order_id := COALESCE(current_prefix, 'ORD-') || current_seq::TEXT;
    
    RETURN new_order_id;
END;
$$;
