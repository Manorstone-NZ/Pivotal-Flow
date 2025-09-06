-- Migration: Add jobs table for background job processing
-- Date: 2025-01-30
-- Purpose: Add a generic jobs table for background processing with typed columns and JSONB payload

-- Create jobs table
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" text PRIMARY KEY,
    "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "job_type" varchar(50) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'queued',
    "priority" integer NOT NULL DEFAULT 0,
    "retry_count" integer NOT NULL DEFAULT 0,
    "max_retries" integer NOT NULL DEFAULT 3,
    "payload" jsonb NOT NULL DEFAULT '{}',
    "result" jsonb,
    "error_message" text,
    "progress" integer NOT NULL DEFAULT 0,
    "total_steps" integer,
    "current_step" integer NOT NULL DEFAULT 0,
    "started_at" timestamp(3),
    "completed_at" timestamp(3),
    "scheduled_at" timestamp(3),
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now()
);

-- Create indexes for jobs table
CREATE INDEX IF NOT EXISTS "idx_jobs_organization_id" ON "jobs"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_jobs_user_id" ON "jobs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_jobs_status" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "idx_jobs_job_type" ON "jobs"("job_type");
CREATE INDEX IF NOT EXISTS "idx_jobs_created_at" ON "jobs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_jobs_scheduled_at" ON "jobs"("scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_jobs_user_status" ON "jobs"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_jobs_org_status" ON "jobs"("organization_id", "status");
CREATE INDEX IF NOT EXISTS "idx_jobs_priority_status" ON "jobs"("priority", "status");

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at_trigger
    BEFORE UPDATE ON "jobs"
    FOR EACH ROW
    EXECUTE FUNCTION update_jobs_updated_at();
