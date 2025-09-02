-- Migration script to convert all database columns from camelCase to snake_case
-- This ensures consistent naming convention: Database uses snake_case, Application uses camelCase

-- Start transaction
BEGIN;

-- 1. CUSTOMERS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE customers RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE customers RENAME COLUMN "customerNumber" TO customer_number;
ALTER TABLE customers RENAME COLUMN "companyName" TO company_name;
ALTER TABLE customers RENAME COLUMN "legalName" TO legal_name;
ALTER TABLE customers RENAME COLUMN "customerType" TO customer_type;
ALTER TABLE customers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE customers RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE customers RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraint name
ALTER TABLE customers DROP CONSTRAINT customers_organizationId_fkey;
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraint name
ALTER TABLE customers DROP CONSTRAINT customers_customerNumber_key;
ALTER TABLE customers ADD CONSTRAINT customers_customer_number_key UNIQUE (customer_number);

-- 2. QUOTES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE quotes RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE quotes RENAME COLUMN "quoteNumber" TO quote_number;
ALTER TABLE quotes RENAME COLUMN "customerId" TO customer_id;
ALTER TABLE quotes RENAME COLUMN "projectId" TO project_id;
ALTER TABLE quotes RENAME COLUMN "validFrom" TO valid_from;
ALTER TABLE quotes RENAME COLUMN "validUntil" TO valid_until;
ALTER TABLE quotes RENAME COLUMN "exchangeRate" TO exchange_rate;
ALTER TABLE quotes RENAME COLUMN "taxRate" TO tax_rate;
ALTER TABLE quotes RENAME COLUMN "taxAmount" TO tax_amount;
ALTER TABLE quotes RENAME COLUMN "discountType" TO discount_type;
ALTER TABLE quotes RENAME COLUMN "discountValue" TO discount_value;
ALTER TABLE quotes RENAME COLUMN "discountAmount" TO discount_amount;
ALTER TABLE quotes RENAME COLUMN "totalAmount" TO total_amount;
ALTER TABLE quotes RENAME COLUMN "termsConditions" TO terms_conditions;
ALTER TABLE quotes RENAME COLUMN "internalNotes" TO internal_notes;
ALTER TABLE quotes RENAME COLUMN "createdBy" TO created_by;
ALTER TABLE quotes RENAME COLUMN "approvedBy" TO approved_by;
ALTER TABLE quotes RENAME COLUMN "approvedAt" TO approved_at;
ALTER TABLE quotes RENAME COLUMN "sentAt" TO sent_at;
ALTER TABLE quotes RENAME COLUMN "acceptedAt" TO accepted_at;
ALTER TABLE quotes RENAME COLUMN "expiresAt" TO expires_at;
ALTER TABLE quotes RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE quotes RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE quotes RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraints
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_organizationId_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_customerId_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_projectId_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE SET NULL;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_createdBy_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_approvedBy_fkey;
ALTER TABLE quotes ADD CONSTRAINT quotes_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES users(id) ON UPDATE SET NULL;

-- Update unique constraint
ALTER TABLE quotes DROP CONSTRAINT quotes_quoteNumber_organizationId_unique;
ALTER TABLE quotes ADD CONSTRAINT quotes_quote_number_organization_id_unique 
    UNIQUE (quote_number, organization_id);

-- 3. QUOTE_LINE_ITEMS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE quote_line_items RENAME COLUMN "quoteId" TO quote_id;
ALTER TABLE quote_line_items RENAME COLUMN "lineNumber" TO line_number;
ALTER TABLE quote_line_items RENAME COLUMN "unitPrice" TO unit_price;
ALTER TABLE quote_line_items RENAME COLUMN "unitCost" TO unit_cost;
ALTER TABLE quote_line_items RENAME COLUMN "taxInclusive" TO tax_inclusive;
ALTER TABLE quote_line_items RENAME COLUMN "taxRate" TO tax_rate;
ALTER TABLE quote_line_items RENAME COLUMN "taxAmount" TO tax_amount;
ALTER TABLE quote_line_items RENAME COLUMN "discountType" TO discount_type;
ALTER TABLE quote_line_items RENAME COLUMN "discountValue" TO discount_value;
ALTER TABLE quote_line_items RENAME COLUMN "discountAmount" TO discount_amount;
ALTER TABLE quote_line_items RENAME COLUMN "totalAmount" TO total_amount;
ALTER TABLE quote_line_items RENAME COLUMN "serviceCategoryId" TO service_category_id;
ALTER TABLE quote_line_items RENAME COLUMN "rateCardId" TO rate_card_id;
ALTER TABLE quote_line_items RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE quote_line_items RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraints
ALTER TABLE quote_line_items DROP CONSTRAINT IF EXISTS quote_line_items_quoteId_fkey;
ALTER TABLE quote_line_items ADD CONSTRAINT quote_line_items_quote_id_fkey 
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE quote_line_items DROP CONSTRAINT IF EXISTS quote_line_items_serviceCategoryId_fkey;
ALTER TABLE quote_line_items ADD CONSTRAINT quote_line_items_service_category_id_fkey 
    FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON UPDATE SET NULL;

ALTER TABLE quote_line_items DROP CONSTRAINT IF EXISTS quote_line_items_rateCardId_fkey;
ALTER TABLE quote_line_items ADD CONSTRAINT quote_line_items_rate_card_id_fkey 
    FOREIGN KEY (rate_card_id) REFERENCES rate_cards(id) ON UPDATE SET NULL;

-- 4. USERS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE users RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE users RENAME COLUMN "firstName" TO first_name;
ALTER TABLE users RENAME COLUMN "lastName" TO last_name;
ALTER TABLE users RENAME COLUMN "displayName" TO display_name;
ALTER TABLE users RENAME COLUMN "avatarUrl" TO avatar_url;
ALTER TABLE users RENAME COLUMN "emailVerified" TO email_verified;
ALTER TABLE users RENAME COLUMN "emailVerifiedAt" TO email_verified_at;
ALTER TABLE users RENAME COLUMN "lastLoginAt" TO last_login_at;
ALTER TABLE users RENAME COLUMN "loginCount" TO login_count;
ALTER TABLE users RENAME COLUMN "failedLoginAttempts" TO failed_login_attempts;
ALTER TABLE users RENAME COLUMN "lockedUntil" TO locked_until;
ALTER TABLE users RENAME COLUMN "passwordHash" TO password_hash;
ALTER TABLE users RENAME COLUMN "mfaEnabled" TO mfa_enabled;
ALTER TABLE users RENAME COLUMN "mfaSecret" TO mfa_secret;
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE users RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraint
ALTER TABLE users DROP CONSTRAINT users_organizationId_fkey;
ALTER TABLE users ADD CONSTRAINT users_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraints
ALTER TABLE users DROP CONSTRAINT users_organizationId_email_key;
ALTER TABLE users ADD CONSTRAINT users_organization_id_email_key 
    UNIQUE (organization_id, email);

-- Update indexes
DROP INDEX IF EXISTS idx_users_org_created;
CREATE INDEX idx_users_org_created ON users (organization_id, created_at DESC);

DROP INDEX IF EXISTS idx_users_org_email;
CREATE INDEX idx_users_org_email ON users (organization_id, email);

DROP INDEX IF EXISTS idx_users_org_status_deleted;
CREATE INDEX idx_users_org_status_deleted ON users (organization_id, status, deleted_at);

-- 5. PROJECTS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE projects RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE projects RENAME COLUMN "ownerId" TO owner_id;
ALTER TABLE projects RENAME COLUMN "startDate" TO start_date;
ALTER TABLE projects RENAME COLUMN "endDate" TO end_date;
ALTER TABLE projects RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE projects RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE projects RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_organizationId_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_owner_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON UPDATE SET NULL;

-- 6. SERVICE_CATEGORIES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE service_categories RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE service_categories RENAME COLUMN "isActive" TO is_active;
ALTER TABLE service_categories RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE service_categories RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint
ALTER TABLE service_categories DROP CONSTRAINT IF EXISTS service_categories_organizationId_fkey;
ALTER TABLE service_categories ADD CONSTRAINT service_categories_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- 7. AUDIT_LOGS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE audit_logs RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE audit_logs RENAME COLUMN "entityType" TO entity_type;
ALTER TABLE audit_logs RENAME COLUMN "entityId" TO entity_id;
ALTER TABLE audit_logs RENAME COLUMN "actorId" TO actor_id;
ALTER TABLE audit_logs RENAME COLUMN "requestId" TO request_id;
ALTER TABLE audit_logs RENAME COLUMN "ipAddress" TO ip_address;
ALTER TABLE audit_logs RENAME COLUMN "userAgent" TO user_agent;
ALTER TABLE audit_logs RENAME COLUMN "sessionId" TO session_id;
ALTER TABLE audit_logs RENAME COLUMN "oldValues" TO old_values;
ALTER TABLE audit_logs RENAME COLUMN "newValues" TO new_values;
ALTER TABLE audit_logs RENAME COLUMN "createdAt" TO created_at;

-- Update foreign key constraints
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_organizationId_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_userId_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (actor_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 8. USER_ROLES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE user_roles RENAME COLUMN "userId" TO user_id;
ALTER TABLE user_roles RENAME COLUMN "roleId" TO role_id;
ALTER TABLE user_roles RENAME COLUMN "assignedBy" TO assigned_by;
ALTER TABLE user_roles RENAME COLUMN "assignedAt" TO assigned_at;
ALTER TABLE user_roles RENAME COLUMN "expiresAt" TO expires_at;
ALTER TABLE user_roles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE user_roles RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraints
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_userId_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_roleId_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_assignedBy_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 9. ROLES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE roles RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE roles RENAME COLUMN "roleName" TO role_name;
ALTER TABLE roles RENAME COLUMN "displayName" TO display_name;
ALTER TABLE roles RENAME COLUMN "description" TO description;
ALTER TABLE roles RENAME COLUMN "isSystem" TO is_system;
ALTER TABLE roles RENAME COLUMN "isActive" TO is_active;
ALTER TABLE roles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE roles RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE roles RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraint
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_organizationId_fkey;
ALTER TABLE roles ADD CONSTRAINT roles_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- 10. ROLE_PERMISSIONS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE role_permissions RENAME COLUMN "roleId" TO role_id;
ALTER TABLE role_permissions RENAME COLUMN "permissionId" TO permission_id;
ALTER TABLE role_permissions RENAME COLUMN "grantedBy" TO granted_by;
ALTER TABLE role_permissions RENAME COLUMN "grantedAt" TO granted_at;
ALTER TABLE role_permissions RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE role_permissions RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraints
ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_roleId_fkey;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permissionId_fkey;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey 
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_grantedBy_fkey;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 11. PERMISSIONS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE permissions RENAME COLUMN "permissionName" TO permission_name;
ALTER TABLE permissions RENAME COLUMN "displayName" TO display_name;
ALTER TABLE permissions RENAME COLUMN "description" TO description;
ALTER TABLE permissions RENAME COLUMN "resourceType" TO resource_type;
ALTER TABLE permissions RENAME COLUMN "resourceId" TO resource_id;
ALTER TABLE permissions RENAME COLUMN "isSystem" TO is_system;
ALTER TABLE permissions RENAME COLUMN "isActive" TO is_active;
ALTER TABLE permissions RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE permissions RENAME COLUMN "updatedAt" TO updated_at;

-- 12. ORG_SETTINGS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE org_settings RENAME COLUMN "orgId" TO org_id;
ALTER TABLE org_settings RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE org_settings RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint
ALTER TABLE org_settings DROP CONSTRAINT IF EXISTS org_settings_orgId_fkey;
ALTER TABLE org_settings ADD CONSTRAINT org_settings_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE org_settings DROP CONSTRAINT IF EXISTS org_settings_org_key_unique;
ALTER TABLE org_settings ADD CONSTRAINT org_settings_org_key_unique 
    UNIQUE (org_id, key);

-- 13. ORG_SECURITY_POLICIES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE org_security_policies RENAME COLUMN "orgId" TO org_id;
ALTER TABLE org_security_policies RENAME COLUMN "minPasswordLength" TO min_password_length;
ALTER TABLE org_security_policies RENAME COLUMN "requireUppercase" TO require_uppercase;
ALTER TABLE org_security_policies RENAME COLUMN "requireLowercase" TO require_lowercase;
ALTER TABLE org_security_policies RENAME COLUMN "requireNumbers" TO require_numbers;
ALTER TABLE org_security_policies RENAME COLUMN "requireSpecialChars" TO require_special_chars;
ALTER TABLE org_security_policies RENAME COLUMN "maxLoginAttempts" TO max_login_attempts;
ALTER TABLE org_security_policies RENAME COLUMN "lockoutDuration" TO lockout_duration;
ALTER TABLE org_security_policies RENAME COLUMN "sessionTimeout" TO session_timeout;
ALTER TABLE org_security_policies RENAME COLUMN "mfaRequired" TO mfa_required;
ALTER TABLE org_security_policies RENAME COLUMN "passwordExpiryDays" TO password_expiry_days;
ALTER TABLE org_security_policies RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE org_security_policies RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint
ALTER TABLE org_security_policies DROP CONSTRAINT IF EXISTS org_security_policies_orgId_fkey;
ALTER TABLE org_security_policies ADD CONSTRAINT org_security_policies_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- 14. ORG_FEATURE_FLAGS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE org_feature_flags RENAME COLUMN "orgId" TO org_id;
ALTER TABLE org_feature_flags RENAME COLUMN "flagKey" TO flag_key;
ALTER TABLE org_feature_flags RENAME COLUMN "isEnabled" TO is_enabled;
ALTER TABLE org_feature_flags RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE org_feature_flags RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint
ALTER TABLE org_feature_flags DROP CONSTRAINT IF EXISTS org_feature_flags_orgId_fkey;
ALTER TABLE org_feature_flags ADD CONSTRAINT org_feature_flags_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE org_feature_flags DROP CONSTRAINT IF EXISTS org_feature_flags_orgId_flagKey_unique;
ALTER TABLE org_feature_flags ADD CONSTRAINT org_feature_flags_org_id_flag_key_unique 
    UNIQUE (org_id, flag_key);

-- 15. ORG_NOTIFICATION_PREFS TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE org_notification_prefs RENAME COLUMN "orgId" TO org_id;
ALTER TABLE org_notification_prefs RENAME COLUMN "isEnabled" TO is_enabled;
ALTER TABLE org_notification_prefs RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE org_notification_prefs RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint
ALTER TABLE org_notification_prefs DROP CONSTRAINT IF EXISTS org_notification_prefs_orgId_fkey;
ALTER TABLE org_notification_prefs ADD CONSTRAINT org_notification_prefs_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE org_notification_prefs DROP CONSTRAINT IF EXISTS org_notification_prefs_orgId_type_unique;
ALTER TABLE org_notification_prefs ADD CONSTRAINT org_notification_prefs_org_id_type_unique 
    UNIQUE (org_id, type);

-- 16. POLICY_OVERRIDES TABLE
-- Rename columns from camelCase to snake_case
ALTER TABLE policy_overrides RENAME COLUMN "orgId" TO org_id;
ALTER TABLE policy_overrides RENAME COLUMN "userId" TO user_id;
ALTER TABLE policy_overrides RENAME COLUMN "policyType" TO policy_type;
ALTER TABLE policy_overrides RENAME COLUMN "policyKey" TO policy_key;
ALTER TABLE policy_overrides RENAME COLUMN "overrideValue" TO override_value;
ALTER TABLE policy_overrides RENAME COLUMN "grantedBy" TO granted_by;
ALTER TABLE policy_overrides RENAME COLUMN "grantedAt" TO granted_at;
ALTER TABLE policy_overrides RENAME COLUMN "expiresAt" TO expires_at;
ALTER TABLE policy_overrides RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE policy_overrides RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraints
ALTER TABLE policy_overrides DROP CONSTRAINT IF EXISTS policy_overrides_orgId_fkey;
ALTER TABLE policy_overrides ADD CONSTRAINT policy_overrides_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE policy_overrides DROP CONSTRAINT IF EXISTS policy_overrides_userId_fkey;
ALTER TABLE policy_overrides ADD CONSTRAINT policy_overrides_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE policy_overrides DROP CONSTRAINT IF EXISTS policy_overrides_grantedBy_fkey;
ALTER TABLE policy_overrides ADD CONSTRAINT policy_overrides_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Update unique constraint
ALTER TABLE policy_overrides DROP CONSTRAINT IF EXISTS policy_overrides_orgId_userId_policyType_policyKey_unique;
ALTER TABLE policy_overrides ADD CONSTRAINT policy_overrides_org_id_user_id_policy_type_policy_key_unique 
    UNIQUE (org_id, user_id, policy_type, policy_key);

-- Commit the transaction
COMMIT;
