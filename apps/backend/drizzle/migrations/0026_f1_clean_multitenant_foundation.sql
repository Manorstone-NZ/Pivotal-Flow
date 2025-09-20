-- Migration: F1 Clean Multitenant Foundation
-- Created: 2025-09-20
-- Purpose: Clean slate UUID-based multitenant architecture (purges existing data)

-- PHASE 1: Clean existing data (sample data purge)
TRUNCATE TABLE time_entries CASCADE;
TRUNCATE TABLE quote_line_items CASCADE;
TRUNCATE TABLE quotes CASCADE;
TRUNCATE TABLE invoice_line_items CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE rate_card_items CASCADE;
TRUNCATE TABLE rate_cards CASCADE;
TRUNCATE TABLE customer_contacts CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE permissions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- Drop and recreate ID mapping table
DROP TABLE IF EXISTS id_mappings CASCADE;

-- PHASE 2: Update core tables to use UUIDs

-- Update organizations table to use UUIDs
ALTER TABLE organizations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE organizations ALTER COLUMN id TYPE UUID USING gen_random_uuid();

-- Update users table to use UUIDs  
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE users ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update customers table to use UUIDs
ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE customers ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE customers ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update quotes table to use UUIDs
ALTER TABLE quotes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE quotes ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE quotes ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();
ALTER TABLE quotes ALTER COLUMN customer_id TYPE UUID USING gen_random_uuid();

-- Update projects table to use UUIDs
ALTER TABLE projects ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE projects ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE projects ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update rate_cards table to use UUIDs
ALTER TABLE rate_cards ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE rate_cards ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE rate_cards ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update invoices table to use UUIDs
ALTER TABLE invoices ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invoices ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE invoices ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update time_entries table to use UUIDs
ALTER TABLE time_entries ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE time_entries ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE time_entries ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- Update permissions table to use UUIDs
ALTER TABLE permissions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE permissions ALTER COLUMN id TYPE UUID USING gen_random_uuid();

-- Update roles table to use UUIDs
ALTER TABLE roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE roles ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE roles ALTER COLUMN organization_id TYPE UUID USING gen_random_uuid();

-- PHASE 3: Now the F1 tables will work properly with UUID references

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
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- 4. Add tenant_id to domain tables
ALTER TABLE customers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE quotes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE time_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE rate_cards ADD COLUMN tenant_id UUID REFERENCES tenants(id);

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
COMMENT ON TABLE tenants IS 'F1: Tenant entities for SaaS multitenant architecture';
COMMENT ON TABLE memberships IS 'F1: User-tenant relationships with role-based access';
COMMENT ON TABLE tenant_features IS 'F1: Per-tenant SaaS service allow-listing';

COMMENT ON COLUMN tenants.slug IS 'URL-safe tenant identifier for subdomain routing';
COMMENT ON COLUMN tenants.status IS 'Tenant status: ACTIVE allows access, SUSPENDED blocks access';
COMMENT ON COLUMN memberships.role IS 'Tenant role: OWNER > ADMIN > STAFF > VIEWER';
COMMENT ON COLUMN tenant_features.feature_code IS 'SaaS feature identifier (Quotes, Invoices, CustomerPortal, etc.)';

-- 7. Insert sample tenant and admin user for testing
INSERT INTO tenants (id, name, slug, billing_email, default_currency, timezone, status)
VALUES (
  gen_random_uuid(),
  'Pivotal Flow Ltd',
  'pivotal-flow',
  'billing@pivotalflow.com',
  'NZD',
  'Pacific/Auckland',
  'ACTIVE'
);

-- Get the tenant ID for reference
DO $$
DECLARE
    tenant_uuid UUID;
    user_uuid UUID;
BEGIN
    -- Get the tenant ID
    SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'pivotal-flow';
    
    -- Create admin user
    INSERT INTO users (
        id, organization_id, email, first_name, last_name, 
        password_hash, status, email_verified, timezone
    ) VALUES (
        gen_random_uuid(),
        (SELECT id FROM organizations LIMIT 1), -- Temporary org reference
        'admin@pivotalflow.com',
        'Admin',
        'User',
        '$2b$12$LQv3c1yqBwlFNkPAWHxvxO/srfEq3y7w.L.1M2Y.H.W.P.F.L.O.W',
        'active',
        true,
        'Pacific/Auckland'
    ) RETURNING id INTO user_uuid;
    
    -- Create membership
    INSERT INTO memberships (user_id, tenant_id, role)
    VALUES (user_uuid, tenant_uuid, 'OWNER');
    
    -- Create feature flags
    INSERT INTO tenant_features (tenant_id, feature_code, enabled)
    VALUES 
        (tenant_uuid, 'Quotes', true),
        (tenant_uuid, 'Invoices', true),
        (tenant_uuid, 'CustomerPortal', true),
        (tenant_uuid, 'RateCards', true),
        (tenant_uuid, 'TimeTracking', true),
        (tenant_uuid, 'Projects', true),
        (tenant_uuid, 'Reports', true),
        (tenant_uuid, 'UserManagement', true);
END $$;
