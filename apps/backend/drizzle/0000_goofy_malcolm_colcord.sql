-- Migration: 0000_base_schema
-- Description: Initial base schema for Pivotal Flow application
-- This migration creates all core tables with proper relationships, constraints, and indexes

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Currencies table - ISO 4217 currency codes for validation
CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Organizations table - normalized address and contact info
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  tax_id VARCHAR(100),
  -- Normalized address fields
  street TEXT,
  suburb TEXT,
  city TEXT,
  region TEXT,
  postcode TEXT,
  country TEXT,
  -- Normalized contact fields
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  -- Keep JSONB only for flexible extras
  contact_extras JSONB, -- Social links, secondary channels
  settings JSONB NOT NULL DEFAULT '{}', -- Feature-specific payloads
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'basic',
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3),
  
  CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT organizations_currency_fk FOREIGN KEY (currency) REFERENCES currencies(code)
);

-- Organization security policies table
CREATE TABLE IF NOT EXISTS org_security_policies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  min_password_length INTEGER NOT NULL DEFAULT 12,
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  session_timeout_minutes INTEGER NOT NULL DEFAULT 60,
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  password_expiry_days INTEGER,
  extras JSONB, -- Flexible additional security settings
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT extras_is_object CHECK (extras IS NULL OR jsonb_typeof(extras) = 'object')
);

CREATE UNIQUE INDEX IF NOT EXISTS org_security_policies_org_unique ON org_security_policies(org_id);

-- Organization feature flags table
CREATE TABLE IF NOT EXISTS org_feature_flags (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  payload JSONB, -- Feature-specific configuration
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, flag_key)
);

-- Organization notification preferences table
CREATE TABLE IF NOT EXISTS org_notification_prefs (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email','sms','push')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB, -- Channel-specific notification settings
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, channel)
);

-- Users table - normalized preferences, keep metadata in JSONB
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  -- Normalized preference fields
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  locale VARCHAR(10) NOT NULL DEFAULT 'en-NZ',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD MMM YYYY',
  time_format VARCHAR(10) NOT NULL DEFAULT '24h',
  -- Keep JSONB for flexible preferences
  preferences JSONB NOT NULL DEFAULT '{}', -- Dashboard layout, UI tweaks
  metadata JSONB NOT NULL DEFAULT '{}', -- Custom fields per customer
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMP(3),
  last_login_at TIMESTAMP(3),
  login_count INTEGER NOT NULL DEFAULT 0,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP(3),
  password_hash VARCHAR(255),
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE(action, resource)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Policy overrides table - proper scope columns plus JSONB policy
CREATE TABLE IF NOT EXISTS policy_overrides (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL, -- Added action column for proper scoping
  policy JSONB NOT NULL, -- Keep JSONB for policy conditions
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, role_id, resource, action)
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP(3),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Customers table - normalized address and contact info
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_number VARCHAR(50) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  industry VARCHAR(100),
  website TEXT,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  customer_type VARCHAR(50) NOT NULL DEFAULT 'business',
  source VARCHAR(50),
  tags TEXT[],
  rating INTEGER,
  -- Normalized address fields
  street TEXT,
  suburb TEXT,
  city TEXT,
  region TEXT,
  postcode TEXT,
  country TEXT,
  -- Normalized contact fields
  phone VARCHAR(20),
  email VARCHAR(255),
  -- Keep JSONB for flexible extras
  contact_extras JSONB, -- Social links, secondary channels
  billing_info JSONB, -- Flexible billing configuration
  preferences JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3)
);

-- Projects table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Project code
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Labels, custom forms, per customer extras
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3)
);

-- Service categories table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Category code
  description TEXT,
  ordering INTEGER NOT NULL DEFAULT 0, -- Display order
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Per customer fields only
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Rate cards table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS rate_cards (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  description TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Display settings or partner specific notes
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT rate_cards_currency_fk FOREIGN KEY (currency) REFERENCES currencies(code)
);

-- Rate card items table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS rate_card_items (
  id TEXT PRIMARY KEY,
  rate_card_id TEXT NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
  service_category_id TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES roles(id) ON DELETE SET NULL,
  item_code VARCHAR(50), -- Item code/SKU
  unit VARCHAR(20) NOT NULL DEFAULT 'hour', -- hour, day, item, etc.
  base_rate DECIMAL(15,4) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  tax_class VARCHAR(20) NOT NULL DEFAULT 'standard', -- Tax classification
  tiering_model_id TEXT, -- Reference to tiering model
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Rare exceptions or display hints
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT rate_card_items_currency_fk FOREIGN KEY (currency) REFERENCES currencies(code)
);

-- Quotes table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  type VARCHAR(50) NOT NULL DEFAULT 'project',
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  exchange_rate DECIMAL(10,6) NOT NULL DEFAULT '1.000000',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT '0.1500',
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,4) NOT NULL DEFAULT '0.0000',
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  terms_conditions TEXT,
  notes TEXT,
  internal_notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP(3),
  sent_at TIMESTAMP(3),
  accepted_at TIMESTAMP(3),
  expires_at TIMESTAMP(3),
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Customer specific extra fields
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3),
  UNIQUE(quote_number, organization_id),
  CONSTRAINT quotes_currency_fk FOREIGN KEY (currency) REFERENCES currencies(code)
);

-- Quote line items table - core fields as columns, metadata in JSONB
CREATE TABLE IF NOT EXISTS quote_line_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'service',
  sku VARCHAR(50), -- SKU/code
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL DEFAULT '1.0000',
  unit_price DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4),
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT '0.1500',
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,4) NOT NULL DEFAULT '0.0000',
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  subtotal DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  service_category_id TEXT REFERENCES service_categories(id) ON DELETE SET NULL,
  rate_card_id TEXT REFERENCES rate_cards(id) ON DELETE SET NULL,
  -- Keep JSONB for flexible metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Rare extras only
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Audit logs table - proper envelope columns plus JSONB for values
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  entity_id TEXT NOT NULL,
  action VARCHAR(100) NOT NULL,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  request_id TEXT, -- For request tracing
  ip_address INET, -- Proper IP address type
  user_agent TEXT,
  session_id VARCHAR(255),
  -- Keep JSONB for old/new values
  old_values JSONB,
  new_values JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Organization settings key-value table with JSONB value
CREATE TABLE IF NOT EXISTS org_settings (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL, -- Flexible value storage
  description TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

CREATE INDEX IF NOT EXISTS idx_service_categories_organization_id ON service_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_ordering ON service_categories(ordering);

CREATE INDEX IF NOT EXISTS idx_rate_cards_organization_id ON rate_cards(organization_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_currency ON rate_cards(currency);
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective_from ON rate_cards(effective_from);

CREATE INDEX IF NOT EXISTS idx_rate_card_items_rate_card_id ON rate_card_items(rate_card_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_items_service_category_id ON rate_card_items(service_category_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_items_currency ON rate_card_items(currency);

CREATE INDEX IF NOT EXISTS idx_quotes_organization_id ON quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_currency ON quotes(currency);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at ON quotes(deleted_at);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_service_category_id ON quote_line_items(service_category_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Insert initial currency data
INSERT INTO currencies (code, name, symbol, is_active) VALUES
  ('USD', 'US Dollar', '$', true),
  ('EUR', 'Euro', '€', true),
  ('GBP', 'British Pound', '£', true),
  ('NZD', 'New Zealand Dollar', 'NZ$', true),
  ('AUD', 'Australian Dollar', 'A$', true),
  ('CAD', 'Canadian Dollar', 'C$', true),
  ('CHF', 'Swiss Franc', 'CHF', true),
  ('JPY', 'Japanese Yen', '¥', true),
  ('CNY', 'Chinese Yuan', '¥', true),
  ('INR', 'Indian Rupee', '₹', true)
ON CONFLICT (code) DO NOTHING;

-- Insert initial permissions
INSERT INTO permissions (id, action, resource, description, category) VALUES
  ('perm_org_view', 'view', 'organization', 'View organization details', 'organization'),
  ('perm_org_edit', 'edit', 'organization', 'Edit organization details', 'organization'),
  ('perm_users_view', 'view', 'users', 'View users', 'users'),
  ('perm_users_create', 'create', 'users', 'Create users', 'users'),
  ('perm_users_edit', 'edit', 'users', 'Edit users', 'users'),
  ('perm_users_delete', 'delete', 'users', 'Delete users', 'users'),
  ('perm_customers_view', 'view', 'customers', 'View customers', 'customers'),
  ('perm_customers_create', 'create', 'customers', 'Create customers', 'customers'),
  ('perm_customers_edit', 'edit', 'customers', 'Edit customers', 'customers'),
  ('perm_customers_delete', 'delete', 'customers', 'Delete customers', 'customers'),
  ('perm_quotes_view', 'view', 'quotes', 'View quotes', 'quotes'),
  ('perm_quotes_create', 'create', 'quotes', 'Create quotes', 'quotes'),
  ('perm_quotes_edit', 'edit', 'quotes', 'Edit quotes', 'quotes'),
  ('perm_quotes_delete', 'delete', 'quotes', 'Delete quotes', 'quotes'),
  ('perm_quotes_approve', 'approve', 'quotes', 'Approve quotes', 'quotes'),
  ('perm_projects_view', 'view', 'projects', 'View projects', 'projects'),
  ('perm_projects_create', 'create', 'projects', 'Create projects', 'projects'),
  ('perm_projects_edit', 'edit', 'projects', 'Edit projects', 'projects'),
  ('perm_projects_delete', 'delete', 'projects', 'Delete projects', 'projects'),
  ('perm_rate_cards_view', 'view', 'rate_cards', 'View rate cards', 'rate_cards'),
  ('perm_rate_cards_create', 'create', 'rate_cards', 'Create rate cards', 'rate_cards'),
  ('perm_rate_cards_edit', 'edit', 'rate_cards', 'Edit rate cards', 'rate_cards'),
  ('perm_rate_cards_delete', 'delete', 'rate_cards', 'Delete rate cards', 'rate_cards'),
  ('perm_reports_view', 'view', 'reports', 'View reports', 'reports'),
  ('perm_settings_view', 'view', 'settings', 'View settings', 'settings'),
  ('perm_settings_edit', 'edit', 'settings', 'Edit settings', 'settings')
ON CONFLICT (action, resource) DO NOTHING;
