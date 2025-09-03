-- Migration: Add customer portal user support
-- Description: Add external customer user support for portal access

-- Add customer_id field to users table for external customer users
ALTER TABLE users ADD COLUMN customer_id text REFERENCES customers(id) ON DELETE CASCADE;

-- Add index for customer user lookups
CREATE INDEX IF NOT EXISTS users_customer_id_idx ON users(customer_id) WHERE customer_id IS NOT NULL;

-- Add user_type field to distinguish internal vs external users
ALTER TABLE users ADD COLUMN user_type varchar(20) NOT NULL DEFAULT 'internal';

-- Add check constraint for user_type
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('internal', 'external_customer'));

-- Add constraint: external_customer users must have customer_id
ALTER TABLE users ADD CONSTRAINT users_external_customer_check 
  CHECK (
    (user_type = 'internal' AND customer_id IS NULL) OR 
    (user_type = 'external_customer' AND customer_id IS NOT NULL)
  );

-- Create index for external customer user lookups
CREATE INDEX IF NOT EXISTS users_external_customer_lookup ON users(organization_id, customer_id, user_type) 
  WHERE user_type = 'external_customer' AND deleted_at IS NULL;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();
