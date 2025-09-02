-- Migration Script 1: Customers Table Only
BEGIN;

-- Drop constraints and indexes that reference old column names
ALTER TABLE customers DROP CONSTRAINT "customers_organizationId_fkey";
DROP INDEX "customers_customerNumber_key";

-- Rename columns from camelCase to snake_case
ALTER TABLE customers RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE customers RENAME COLUMN "customerNumber" TO customer_number;
ALTER TABLE customers RENAME COLUMN "companyName" TO company_name;
ALTER TABLE customers RENAME COLUMN "legalName" TO legal_name;
ALTER TABLE customers RENAME COLUMN "customerType" TO customer_type;
ALTER TABLE customers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE customers RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE customers RENAME COLUMN "deletedAt" TO deleted_at;

-- Recreate constraints with new column names
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE UNIQUE INDEX customers_customer_number_key ON customers (customer_number);

COMMIT;
