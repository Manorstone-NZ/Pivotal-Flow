-- Rollback Migration: Remove performance indexes for quotes table
-- Date: 2025-01-30
-- Purpose: Rollback the performance indexes added in 0004_quote_performance_indexes.sql

-- Remove composite indexes
DROP INDEX IF EXISTS idx_quotes_org_status_created;
DROP INDEX IF EXISTS idx_quotes_org_customer;
DROP INDEX IF EXISTS idx_quotes_org_project;
DROP INDEX IF EXISTS idx_quotes_org_created_by;
DROP INDEX IF EXISTS idx_quotes_org_valid_dates;
DROP INDEX IF EXISTS idx_quotes_org_quote_number;
DROP INDEX IF EXISTS idx_quotes_org_currency;
DROP INDEX IF EXISTS idx_quotes_org_total_amount;
DROP INDEX IF EXISTS idx_quotes_org_status_updated;

-- Remove GIN indexes
DROP INDEX IF EXISTS idx_quotes_metadata_gin;

-- Remove quote line item indexes
DROP INDEX IF EXISTS idx_quote_line_items_quote_id;
DROP INDEX IF EXISTS idx_quote_line_items_quote_line;
DROP INDEX IF EXISTS idx_quote_line_items_service_category;
DROP INDEX IF EXISTS idx_quote_line_items_rate_card;
DROP INDEX IF EXISTS idx_quote_line_items_metadata_gin;

-- Note: We don't drop idx_quotes_deleted_at as it should exist from previous migrations
-- and is important for soft delete performance
