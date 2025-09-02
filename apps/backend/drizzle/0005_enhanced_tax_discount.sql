-- Migration: Add tax inclusive and unit fields to quote line items
-- Generated at: 2025-09-02

-- Add unit field to quote_line_items table
ALTER TABLE quote_line_items ADD COLUMN unit VARCHAR(50) NOT NULL DEFAULT 'hour';

-- Add tax_inclusive field to quote_line_items table
ALTER TABLE quote_line_items ADD COLUMN tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE;

-- Add actorId field to audit_logs table (rename from userId)
ALTER TABLE audit_logs RENAME COLUMN user_id TO actor_id;
