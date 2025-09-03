-- Migration: Add export jobs table for async reporting
-- This table stores export job metadata and status

CREATE TABLE IF NOT EXISTS "export_jobs" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "report_type" varchar(50) NOT NULL,
  "format" varchar(10) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "filters" jsonb NOT NULL DEFAULT '{}',
  "file_name" text NOT NULL,
  "total_rows" integer,
  "processed_rows" integer DEFAULT 0,
  "download_url" text,
  "error_message" text,
  "started_at" timestamp(3),
  "completed_at" timestamp(3),
  "created_at" timestamp(3) NOT NULL DEFAULT NOW(),
  "updated_at" timestamp(3) NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "export_jobs_organization_id_idx" ON "export_jobs" ("organization_id");
CREATE INDEX IF NOT EXISTS "export_jobs_user_id_idx" ON "export_jobs" ("user_id");
CREATE INDEX IF NOT EXISTS "export_jobs_status_idx" ON "export_jobs" ("status");
CREATE INDEX IF NOT EXISTS "export_jobs_report_type_idx" ON "export_jobs" ("report_type");
CREATE INDEX IF NOT EXISTS "export_jobs_created_at_idx" ON "export_jobs" ("created_at");

-- Composite index for user's jobs
CREATE INDEX IF NOT EXISTS "export_jobs_user_status_idx" ON "export_jobs" ("user_id", "status");

-- Composite index for organization's jobs
CREATE INDEX IF NOT EXISTS "export_jobs_org_status_idx" ON "export_jobs" ("organization_id", "status");

-- Update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_export_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_export_jobs_updated_at ON export_jobs;
CREATE TRIGGER trigger_update_export_jobs_updated_at
    BEFORE UPDATE ON export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_export_jobs_updated_at();
