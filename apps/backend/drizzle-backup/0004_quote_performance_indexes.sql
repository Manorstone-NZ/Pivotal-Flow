-- Migration: Add performance indexes for quotes table
-- Date: 2025-01-30
-- Purpose: Add composite indexes for frequent quote filters to meet performance budgets

-- Add composite index for organization + status + created_at (most common filter combination)
CREATE INDEX IF NOT EXISTS idx_quotes_org_status_created 
ON quotes (organization_id, status, created_at DESC);

-- Add composite index for organization + customer_id (frequent customer-based queries)
CREATE INDEX IF NOT EXISTS idx_quotes_org_customer 
ON quotes (organization_id, customer_id);

-- Add GIN index for metadata JSONB (only if metadata is queried)
-- This index will be used for metadata searches but core filters should use typed columns
CREATE INDEX IF NOT EXISTS idx_quotes_metadata_gin 
ON quotes USING GIN (metadata jsonb_path_ops);

-- Add index for project_id queries (less frequent but important)
CREATE INDEX IF NOT EXISTS idx_quotes_org_project 
ON quotes (organization_id, project_id);

-- Add index for created_by queries (for user-specific quote lists)
CREATE INDEX IF NOT EXISTS idx_quotes_org_created_by 
ON quotes (organization_id, created_by);

-- Add index for date range queries (valid_from and valid_until)
CREATE INDEX IF NOT EXISTS idx_quotes_org_valid_dates 
ON quotes (organization_id, valid_from, valid_until);

-- Add index for quote number searches (already unique but needs org scope)
-- Note: quote_number is already unique per organization, but this helps with LIKE queries
CREATE INDEX IF NOT EXISTS idx_quotes_org_quote_number 
ON quotes (organization_id, quote_number);

-- Add index for currency-based queries (for multi-currency organizations)
CREATE INDEX IF NOT EXISTS idx_quotes_org_currency 
ON quotes (organization_id, currency);

-- Add index for total_amount queries (for financial reporting)
CREATE INDEX IF NOT EXISTS idx_quotes_org_total_amount 
ON quotes (organization_id, total_amount DESC);

-- Add index for status transitions (for workflow queries)
CREATE INDEX IF NOT EXISTS idx_quotes_org_status_updated 
ON quotes (organization_id, status, updated_at DESC);

-- Add index for soft delete queries (ensure deleted_at is indexed)
-- Note: This should already exist from previous migrations, but ensuring it's here
CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at 
ON quotes (deleted_at) WHERE deleted_at IS NULL;

-- Add index for quote line items by quote_id (for efficient line item retrieval)
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id 
ON quote_line_items (quote_id);

-- Add index for quote line items by line_number (for ordering)
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_line 
ON quote_line_items (quote_id, line_number);

-- Add index for quote line items by service_category_id (for category-based queries)
CREATE INDEX IF NOT EXISTS idx_quote_line_items_service_category 
ON quote_line_items (service_category_id);

-- Add index for quote line items by rate_card_id (for rate card-based queries)
CREATE INDEX IF NOT EXISTS idx_quote_line_items_rate_card 
ON quote_line_items (rate_card_id);

-- Add GIN index for line item metadata (if queried)
CREATE INDEX IF NOT EXISTS idx_quote_line_items_metadata_gin 
ON quote_line_items USING GIN (metadata jsonb_path_ops);
