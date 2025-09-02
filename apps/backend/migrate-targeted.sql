-- Targeted Migration: Only tables that need camelCase to snake_case conversion
-- Rate cards and rate_card_items are already snake_case ✅

BEGIN;

-- ============================================================================
-- 1. CUSTOMERS TABLE
-- ============================================================================

-- Rename columns from camelCase to snake_case
ALTER TABLE customers RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE customers RENAME COLUMN "customerNumber" TO customer_number;
ALTER TABLE customers RENAME COLUMN "companyName" TO company_name;
ALTER TABLE customers RENAME COLUMN "legalName" TO legal_name;
ALTER TABLE customers RENAME COLUMN "customerType" TO customer_type;
ALTER TABLE customers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE customers RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE customers RENAME COLUMN "deletedAt" TO deleted_at;

-- Drop and recreate foreign key constraint
ALTER TABLE customers DROP CONSTRAINT "customers_organizationId_fkey";
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Drop and recreate unique index
DROP INDEX "customers_customerNumber_key";
CREATE UNIQUE INDEX customers_customer_number_key ON customers (customer_number);

-- ============================================================================
-- 2. QUOTES TABLE
-- ============================================================================

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

-- Drop and recreate unique constraint
ALTER TABLE quotes DROP CONSTRAINT "quotes_quoteNumber_organizationId_unique";
ALTER TABLE quotes ADD CONSTRAINT quotes_quote_number_organization_id_unique 
    UNIQUE (quote_number, organization_id);

-- ============================================================================
-- 3. QUOTE_LINE_ITEMS TABLE
-- ============================================================================

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

-- ============================================================================
-- 4. USERS TABLE
-- ============================================================================

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

-- Drop and recreate foreign key constraint
ALTER TABLE users DROP CONSTRAINT "users_organizationId_fkey";
ALTER TABLE users ADD CONSTRAINT users_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Drop and recreate unique constraint
ALTER TABLE users DROP CONSTRAINT "users_organizationId_email_key";
ALTER TABLE users ADD CONSTRAINT users_organization_id_email_key 
    UNIQUE (organization_id, email);

-- ============================================================================
-- 5. PROJECTS TABLE
-- ============================================================================

-- Rename columns from camelCase to snake_case
ALTER TABLE projects RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE projects RENAME COLUMN "ownerId" TO owner_id;
ALTER TABLE projects RENAME COLUMN "startDate" TO start_date;
ALTER TABLE projects RENAME COLUMN "endDate" TO end_date;
ALTER TABLE projects RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE projects RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE projects RENAME COLUMN "deletedAt" TO deleted_at;

-- ============================================================================
-- 6. SERVICE_CATEGORIES TABLE
-- ============================================================================

-- Rename columns from camelCase to snake_case
ALTER TABLE service_categories RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE service_categories RENAME COLUMN "isActive" TO is_active;
ALTER TABLE service_categories RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE service_categories RENAME COLUMN "updatedAt" TO updated_at;

COMMIT;
