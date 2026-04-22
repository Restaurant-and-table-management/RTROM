-- V6: Add index on kitchen_order_tickets for performance on status-based queries
-- This migration is safe to run on existing data.

CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_status
    ON kitchen_order_tickets (kitchen_status);

CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_order_id
    ON kitchen_order_tickets (order_id);

CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_created_at
    ON kitchen_order_tickets (created_at);

-- Ensure created_at column exists (it may have been missed in V4)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'kitchen_order_tickets'
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE kitchen_order_tickets ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;
