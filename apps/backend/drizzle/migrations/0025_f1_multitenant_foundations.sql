-- Migration: F1 Multitenant Foundations & API Safety
-- Created: 2025-09-20
-- Purpose: Implement proper multitenant architecture with tenant isolation

-- 1. Create tenants table (proper tenant entity)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create memberships table (user-tenant relationships)  
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'STAFF', 'VIEWER')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 3. Create tenant_features table (SaaS service allow-listing)
CREATE TABLE tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_code VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, feature_code)
);

-- 4. Create ID mapping tables for migration from string IDs to UUIDs
CREATE TABLE id_mappings (
  old_id TEXT PRIMARY KEY,
  new_id UUID NOT NULL DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'organization', 'user', etc.
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Migrate existing organizations to tenants with UUID mapping
INSERT INTO id_mappings (old_id, entity_type)
SELECT id, 'organization' FROM organizations;

INSERT INTO tenants (id, name, slug, billing_email, default_currency, timezone, status, created_at, updated_at)
SELECT 
  m.new_id,
  o.name,
  o.slug,
  COALESCE(o.email, 'billing@' || o.slug || '.com'),
  COALESCE(o.currency, 'USD'),
  COALESCE(o.timezone, 'UTC'),
  'ACTIVE',
  o.created_at,
  COALESCE(o.updated_at, o.created_at)
FROM organizations o
JOIN id_mappings m ON o.id = m.old_id
WHERE m.entity_type = 'organization';

-- 6. Migrate existing users to have UUID mappings
INSERT INTO id_mappings (old_id, entity_type)
SELECT id, 'user' FROM users
WHERE NOT EXISTS (SELECT 1 FROM id_mappings WHERE old_id = users.id);

-- 7. Create memberships for existing users
INSERT INTO memberships (user_id, tenant_id, role, created_at, updated_at)
SELECT 
  u_map.new_id,
  t_map.new_id,
  CASE 
    WHEN u.email = 'admin@pivotalflow.com' THEN 'OWNER'
    WHEN u.email LIKE '%admin%' THEN 'ADMIN'
    ELSE 'STAFF'
  END,
  NOW(),
  NOW()
FROM users u
JOIN id_mappings u_map ON u.id = u_map.old_id AND u_map.entity_type = 'user'
JOIN id_mappings t_map ON u.organization_id = t_map.old_id AND t_map.entity_type = 'organization';

-- 8. Create default feature flags for all tenants
INSERT INTO tenant_features (tenant_id, feature_code, enabled, created_at, updated_at)
SELECT 
  t.id,
  feature.code,
  true,
  NOW(),
  NOW()
FROM tenants t
CROSS JOIN (
  VALUES 
    ('Quotes'),
    ('Invoices'),
    ('CustomerPortal'),
    ('RateCards'),
    ('TimeTracking'),
    ('Projects'),
    ('Reports'),
    ('UserManagement')
) AS feature(code);

-- 9. Add tenant_id to domain tables (start with core tables)
-- Note: We'll add to existing tables and backfill, then make NOT NULL in a later migration

-- Add tenant_id to customers table
ALTER TABLE customers ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to quotes table  
ALTER TABLE quotes ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to projects table
ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to time_entries table
ALTER TABLE time_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to invoices table
ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to rate_cards table
ALTER TABLE rate_cards ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- 10. Backfill tenant_id on domain tables using ID mapping
UPDATE customers SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = customers.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

UPDATE quotes SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = quotes.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

UPDATE projects SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = projects.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

UPDATE time_entries SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = time_entries.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

UPDATE invoices SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = invoices.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

UPDATE rate_cards SET tenant_id = (
  SELECT t_map.new_id FROM id_mappings t_map 
  WHERE t_map.old_id = rate_cards.organization_id AND t_map.entity_type = 'organization'
) WHERE tenant_id IS NULL;

-- 5. Create indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_tenant_id ON memberships(tenant_id);
CREATE INDEX idx_memberships_user_tenant ON memberships(user_id, tenant_id);
CREATE INDEX idx_tenant_features_tenant_id ON tenant_features(tenant_id);
CREATE INDEX idx_tenant_features_code ON tenant_features(feature_code);

-- Domain table indexes
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_quotes_tenant_id ON quotes(tenant_id);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_time_entries_tenant_id ON time_entries(tenant_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_rate_cards_tenant_id ON rate_cards(tenant_id);

-- 6. Add comments for documentation
COMMENT ON TABLE tenants IS 'Tenant entities for SaaS multitenant architecture';
COMMENT ON TABLE memberships IS 'User-tenant relationships with role-based access';
COMMENT ON TABLE tenant_features IS 'Per-tenant SaaS service allow-listing';

COMMENT ON COLUMN tenants.slug IS 'URL-safe tenant identifier for subdomain routing';
COMMENT ON COLUMN tenants.status IS 'Tenant status: ACTIVE allows access, SUSPENDED blocks access';
COMMENT ON COLUMN memberships.role IS 'Tenant role: OWNER > ADMIN > STAFF > VIEWER';
COMMENT ON COLUMN tenant_features.feature_code IS 'SaaS feature identifier (Quotes, Invoices, CustomerPortal, etc.)';
