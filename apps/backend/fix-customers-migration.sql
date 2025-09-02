-- Fix customers table migration
BEGIN;

-- Drop the unique index first
DROP INDEX "customers_customerNumber_key";

-- Update foreign key constraint to reference the new column name
ALTER TABLE customers DROP CONSTRAINT "customers_organizationId_fkey";
ALTER TABLE customers ADD CONSTRAINT customers_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Recreate the unique index with the new column name
CREATE UNIQUE INDEX customers_customer_number_key ON customers (customer_number);

COMMIT;
