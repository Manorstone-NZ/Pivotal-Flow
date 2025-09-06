-- Rollback Migration: Remove jobs table
-- Date: 2025-01-30
-- Purpose: Rollback changes from 0008_add_jobs_table.sql

-- Remove trigger and function
DROP TRIGGER IF EXISTS jobs_updated_at_trigger ON "jobs";
DROP FUNCTION IF EXISTS update_jobs_updated_at();

-- Remove indexes
DROP INDEX IF EXISTS "idx_jobs_organization_id";
DROP INDEX IF EXISTS "idx_jobs_user_id";
DROP INDEX IF EXISTS "idx_jobs_status";
DROP INDEX IF EXISTS "idx_jobs_job_type";
DROP INDEX IF EXISTS "idx_jobs_created_at";
DROP INDEX IF EXISTS "idx_jobs_scheduled_at";
DROP INDEX IF EXISTS "idx_jobs_user_status";
DROP INDEX IF EXISTS "idx_jobs_org_status";
DROP INDEX IF EXISTS "idx_jobs_priority_status";

-- Remove jobs table
DROP TABLE IF EXISTS "jobs" CASCADE;
