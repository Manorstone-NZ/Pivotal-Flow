-- Migration: Normalize JSONB fields according to decision matrix
-- This migration implements the decision matrix to move critical fields from JSONB to typed columns

-- 1. Organizations table - normalize address and contact info
ALTER TABLE organizations 
  ADD COLUMN street TEXT,
  ADD COLUMN suburb TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN region TEXT,
  ADD COLUMN postcode TEXT,
  ADD COLUMN country TEXT,
  ADD COLUMN phone VARCHAR(20),
  ADD COLUMN email VARCHAR(255),
  ADD COLUMN website TEXT,
  ADD COLUMN contact_extras JSONB;

-- 2. Create organization security policies table
CREATE TABLE IF NOT EXISTS org_security_policies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  min_password_length INTEGER NOT NULL DEFAULT 12,
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  session_timeout_minutes INTEGER NOT NULL DEFAULT 60,
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  password_expiry_days INTEGER,
  extras JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT extras_is_object CHECK (extras IS NULL OR jsonb_typeof(extras) = 'object')
);

CREATE UNIQUE INDEX IF NOT EXISTS org_security_policies_org_unique ON org_security_policies(org_id);

-- 3. Create organization feature flags table
CREATE TABLE IF NOT EXISTS org_feature_flags (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  payload JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, flag_key)
);

-- 4. Create organization notification preferences table
CREATE TABLE IF NOT EXISTS org_notification_prefs (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email','sms','push')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, channel)
);

-- 5. Users table - normalize preferences
ALTER TABLE users 
  ADD COLUMN date_format VARCHAR(20) NOT NULL DEFAULT 'DD MMM YYYY',
  ADD COLUMN time_format VARCHAR(10) NOT NULL DEFAULT '24h';

-- Update default locale to NZ
UPDATE users SET locale = 'en-NZ' WHERE locale = 'en-US';

-- 6. Customers table - normalize address and contact info
ALTER TABLE customers 
  ADD COLUMN street TEXT,
  ADD COLUMN suburb TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN region TEXT,
  ADD COLUMN postcode TEXT,
  ADD COLUMN country TEXT,
  ADD COLUMN phone VARCHAR(20),
  ADD COLUMN email VARCHAR(255),
  ADD COLUMN contact_extras JSONB;

-- 7. Projects table - add core fields
ALTER TABLE projects 
  ADD COLUMN code VARCHAR(50),
  ADD COLUMN owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN start_date DATE,
  ADD COLUMN end_date DATE;

-- 8. Service categories table - add core fields
ALTER TABLE service_categories 
  ADD COLUMN code VARCHAR(50),
  ADD COLUMN ordering INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;

-- 9. Rate cards table - add core fields
ALTER TABLE rate_cards 
  ADD COLUMN version VARCHAR(20) NOT NULL DEFAULT '1.0';

-- 10. Rate card items table - add core fields
ALTER TABLE rate_card_items 
  ADD COLUMN item_code VARCHAR(50),
  ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'hour',
  ADD COLUMN tax_class VARCHAR(20) NOT NULL DEFAULT 'standard',
  ADD COLUMN tiering_model_id TEXT;

-- 11. Quotes table - add SKU field
ALTER TABLE quote_line_items 
  ADD COLUMN sku VARCHAR(50);

-- 12. Policy overrides table - add action column and update unique constraint
ALTER TABLE policy_overrides 
  ADD COLUMN action VARCHAR(100) NOT NULL DEFAULT 'all';

-- Drop old unique constraint
DROP INDEX IF EXISTS policy_overrides_org_role_resource_unique;

-- Add new unique constraint with action
CREATE UNIQUE INDEX IF NOT EXISTS policy_overrides_org_role_resource_action_unique 
  ON policy_overrides(organization_id, role_id, resource, action);

-- 13. Audit logs table - improve structure
ALTER TABLE audit_logs 
  ADD COLUMN request_id TEXT,
  ADD COLUMN ip_address INET;

-- Rename user_id to actor_id for clarity
ALTER TABLE audit_logs RENAME COLUMN user_id TO actor_id;

-- 14. Create organization settings key-value table
CREATE TABLE IF NOT EXISTS org_settings (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, key),
  CONSTRAINT value_is_valid CHECK (jsonb_typeof(value) IN ('object','array','string','number','boolean','null'))
);

-- 15. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_address ON organizations(street, city, country);
CREATE INDEX IF NOT EXISTS idx_organizations_contact ON organizations(phone, email);
CREATE INDEX IF NOT EXISTS idx_customers_address ON customers(street, city, country);
CREATE INDEX IF NOT EXISTS idx_customers_contact ON customers(phone, email);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_code ON service_categories(code);
CREATE INDEX IF NOT EXISTS idx_service_categories_ordering ON service_categories(ordering);
CREATE INDEX IF NOT EXISTS idx_rate_cards_version ON rate_cards(version);
CREATE INDEX IF NOT EXISTS idx_rate_card_items_code ON rate_card_items(item_code);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_sku ON quote_line_items(sku);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- 16. Add GIN indexes for JSONB fields that need efficient querying
CREATE INDEX IF NOT EXISTS idx_policy_overrides_policy_gin ON policy_overrides USING GIN (policy jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values_gin ON audit_logs USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values_gin ON audit_logs USING GIN (new_values);

-- 17. Add constraints for data integrity
ALTER TABLE organizations 
  ADD CONSTRAINT organizations_phone_format CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s\-\(\)]+$'),
  ADD CONSTRAINT organizations_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE customers 
  ADD CONSTRAINT customers_phone_format CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s\-\(\)]+$'),
  ADD CONSTRAINT customers_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 18. Migrate existing JSONB data to new columns (if any exists)
-- Note: This would need to be customized based on existing data structure
-- For now, we'll leave the old JSONB columns in place for backward compatibility

-- 19. Add comments for documentation
COMMENT ON TABLE org_security_policies IS 'Organization security policies with typed fields for critical settings';
COMMENT ON TABLE org_feature_flags IS 'Organization feature flags with JSONB payload for flexible configuration';
COMMENT ON TABLE org_notification_prefs IS 'Organization notification preferences by channel';
COMMENT ON TABLE org_settings IS 'Flexible organization settings key-value store with JSONB values';
COMMENT ON COLUMN organizations.street IS 'Street address for geocoding and validation';
COMMENT ON COLUMN organizations.city IS 'City for address validation and geocoding';
COMMENT ON COLUMN organizations.country IS 'Country for address validation and geocoding';
COMMENT ON COLUMN users.date_format IS 'User preferred date format';
COMMENT ON COLUMN users.time_format IS 'User preferred time format (12h/24h)';
COMMENT ON COLUMN projects.code IS 'Project code for easy identification';
COMMENT ON COLUMN projects.owner_id IS 'Project owner for accountability';
COMMENT ON COLUMN service_categories.code IS 'Service category code for easy identification';
COMMENT ON COLUMN rate_card_items.tax_class IS 'Tax classification for proper tax calculation';
COMMENT ON COLUMN quote_line_items.sku IS 'Stock keeping unit for inventory tracking';
