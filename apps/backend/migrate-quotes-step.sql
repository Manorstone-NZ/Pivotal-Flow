-- Migration Script 2: Quotes Table Only
BEGIN;

-- Drop constraints that reference old column names
ALTER TABLE quotes DROP CONSTRAINT "quotes_quoteNumber_organizationId_unique";

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

-- Recreate constraints with new column names
ALTER TABLE quotes ADD CONSTRAINT quotes_quote_number_organization_id_unique 
    UNIQUE (quote_number, organization_id);

COMMIT;
