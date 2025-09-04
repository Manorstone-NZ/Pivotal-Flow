-- Rollback Migration: Remove payments support
-- Date: 2025-01-30
-- Purpose: Rollback changes from 0007_payments_support.sql

-- Remove payments table and its indexes
DROP INDEX IF EXISTS "idx_payments_invoice_id";
DROP INDEX IF EXISTS "idx_payments_idempotency_key";
DROP INDEX IF EXISTS "idx_payments_status";
DROP TABLE IF EXISTS "payments" CASCADE;

-- Remove invoice_line_items table
DROP TABLE IF EXISTS "invoice_line_items" CASCADE;

-- Remove invoices table and its indexes
DROP INDEX IF EXISTS "invoices_invoice_number_organization_unique";
DROP INDEX IF EXISTS "idx_invoices_status";
DROP INDEX IF EXISTS "idx_invoices_currency";
DROP TABLE IF EXISTS "invoices" CASCADE;
