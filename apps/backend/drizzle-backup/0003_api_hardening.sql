-- Migration: API Hardening - Idempotency, Versioning, and Locking
-- This adds support for safe and repeatable writes with idempotency keys,
-- quote versioning, and locking for approved/accepted quotes

-- Idempotency table to store request hashes and responses
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route VARCHAR(255) NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP(3) NOT NULL,
  
  -- Ensure unique idempotency per user and route
  UNIQUE(organization_id, user_id, route, request_hash)
);

-- Add indexes for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_lookup ON idempotency_keys(organization_id, user_id, route, request_hash);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expiry ON idempotency_keys(expires_at);

-- Quote versions table for versioning support
CREATE TABLE IF NOT EXISTS quote_versions (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  exchange_rate DECIMAL(10,6) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,4) NOT NULL,
  discount_amount DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  terms_conditions TEXT,
  notes TEXT,
  internal_notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP(3),
  sent_at TIMESTAMP(3),
  accepted_at TIMESTAMP(3),
  expires_at TIMESTAMP(3),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  
  -- Ensure unique version numbers per quote
  UNIQUE(quote_id, version_number)
);

-- Add indexes for quote versions
CREATE INDEX IF NOT EXISTS idx_quote_versions_quote ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_number ON quote_versions(quote_id, version_number);
CREATE INDEX IF NOT EXISTS idx_quote_versions_created ON quote_versions(created_at);

-- Quote line item versions table
CREATE TABLE IF NOT EXISTS quote_line_item_versions (
  id TEXT PRIMARY KEY,
  quote_version_id TEXT NOT NULL REFERENCES quote_versions(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  sku VARCHAR(50),
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL,
  unit_price DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4),
  unit VARCHAR(50) NOT NULL,
  tax_inclusive BOOLEAN NOT NULL DEFAULT false,
  tax_rate DECIMAL(5,4) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,4) NOT NULL,
  discount_amount DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  service_category_id TEXT REFERENCES service_categories(id) ON DELETE SET NULL,
  rate_card_id TEXT REFERENCES rate_cards(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  
  -- Ensure unique line numbers per quote version
  UNIQUE(quote_version_id, line_number)
);

-- Add indexes for line item versions
CREATE INDEX IF NOT EXISTS idx_quote_line_item_versions_quote_version ON quote_line_item_versions(quote_version_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_item_versions_line ON quote_line_item_versions(quote_version_id, line_number);

-- Add current_version_id column to quotes table for versioning
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS current_version_id TEXT REFERENCES quote_versions(id) ON DELETE SET NULL;

-- Add index for current version lookups
CREATE INDEX IF NOT EXISTS idx_quotes_current_version ON quotes(current_version_id);

-- Add force_edit permission to existing permissions
-- Note: This may need to be added manually depending on the actual permissions table structure
-- INSERT INTO permissions (id, action, resource) VALUES
--   ('perm_quotes_force_edit', 'force_edit', 'quotes')
-- ON CONFLICT DO NOTHING;

-- Add audit log JSON schema validation
-- This ensures audit logs have proper structure for old/new values
CREATE OR REPLACE FUNCTION validate_audit_jsonb_schema()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate oldValues structure if present
  IF NEW.old_values IS NOT NULL AND jsonb_typeof(NEW.old_values) != 'object' THEN
    RAISE EXCEPTION 'old_values must be a JSON object';
  END IF;
  
  -- Validate newValues structure if present
  IF NEW.new_values IS NOT NULL AND jsonb_typeof(NEW.new_values) != 'object' THEN
    RAISE EXCEPTION 'new_values must be a JSON object';
  END IF;
  
  -- Validate metadata structure
  IF NEW.metadata IS NOT NULL AND jsonb_typeof(NEW.metadata) != 'object' THEN
    RAISE EXCEPTION 'metadata must be a JSON object';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit log validation
DROP TRIGGER IF EXISTS audit_logs_jsonb_validation ON audit_logs;
CREATE TRIGGER audit_logs_jsonb_validation
  BEFORE INSERT OR UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION validate_audit_jsonb_schema();

-- Add function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired idempotency keys
-- This should be called periodically (e.g., every hour)
-- Note: In production, you might want to use pg_cron extension or external scheduler
