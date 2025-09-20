-- Migration: Add quote delivery tracking fields
-- Created: 2025-09-20
-- Purpose: Support E13 quote delivery and customer approval system

-- Add delivery tracking fields to quotes table
ALTER TABLE quotes 
ADD COLUMN delivered_at TIMESTAMP,
ADD COLUMN viewed_at TIMESTAMP,
ADD COLUMN public_token VARCHAR(255),
ADD COLUMN token_expires_at TIMESTAMP;

-- Add unique constraint on public_token (when not null)
CREATE UNIQUE INDEX idx_quotes_public_token_unique ON quotes(public_token) WHERE public_token IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_quotes_delivered_at ON quotes(delivered_at) WHERE delivered_at IS NOT NULL;
CREATE INDEX idx_quotes_viewed_at ON quotes(viewed_at) WHERE viewed_at IS NOT NULL;
CREATE INDEX idx_quotes_token_expires_at ON quotes(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- Update status constraint to include VIEWED and EXPIRED
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_valid;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_valid 
CHECK (status IN ('draft', 'pending', 'approved', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled'));

-- Add comment for documentation
COMMENT ON COLUMN quotes.delivered_at IS 'Timestamp when quote was delivered to customer via public link';
COMMENT ON COLUMN quotes.viewed_at IS 'Timestamp when customer first viewed the public quote';
COMMENT ON COLUMN quotes.public_token IS 'Secure token for public customer access to quote';
COMMENT ON COLUMN quotes.token_expires_at IS 'Expiration timestamp for public token (aligned with quote validity)';
