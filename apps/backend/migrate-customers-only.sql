-- Step-by-step migration: Start with customers table only
BEGIN;

-- Rename columns from camelCase to snake_case
ALTER TABLE customers RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE customers RENAME COLUMN "customerNumber" TO customer_number;
ALTER TABLE customers RENAME COLUMN "companyName" TO company_name;
ALTER TABLE customers RENAME COLUMN "legalName" TO legal_name;
ALTER TABLE customers RENAME COLUMN "customerType" TO customer_type;
ALTER TABLE customers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE customers RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE customers RENAME COLUMN "deletedAt" TO deleted_at;

-- Update foreign key constraint
ALTER TABLE customers DROP CONSTRAINT "customers_organizationId_fkey";
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE customers DROP CONSTRAINT "customers_customerNumber_key";
ALTER TABLE customers ADD CONSTRAINT customers_customer_number_key UNIQUE (customer_number);

COMMIT;
