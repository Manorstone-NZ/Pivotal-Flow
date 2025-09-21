-- Add tokenUsedAt field to quotes table for public token replay protection
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "token_used_at" timestamp (3);

-- Add index for token usage tracking
CREATE INDEX IF NOT EXISTS "idx_quotes_token_used_at" ON "quotes" USING btree ("token_used_at");

-- Add index for public token lookup with used_at
CREATE INDEX IF NOT EXISTS "idx_quotes_public_token_used" ON "quotes" USING btree ("public_token", "token_used_at");

-- Add rate limiting table for public endpoints
CREATE TABLE IF NOT EXISTS "public_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"ip_address" inet NOT NULL,
	"token_id" text,
	"request_count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp (3) DEFAULT now() NOT NULL,
	"last_request" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);

-- Add indexes for rate limiting
CREATE INDEX IF NOT EXISTS "idx_public_rate_limits_endpoint_ip" ON "public_rate_limits" USING btree ("endpoint", "ip_address");
CREATE INDEX IF NOT EXISTS "idx_public_rate_limits_window_start" ON "public_rate_limits" USING btree ("window_start");
CREATE INDEX IF NOT EXISTS "idx_public_rate_limits_token_id" ON "public_rate_limits" USING btree ("token_id");

-- Add audit table for public token usage
CREATE TABLE IF NOT EXISTS "public_token_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"token_id" text NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"ip_address" inet,
	"user_agent" text,
	"tenant_id" text,
	"organization_id" text,
	"success" boolean NOT NULL DEFAULT true,
	"error_message" text,
	"request_data" jsonb DEFAULT '{}',
	"response_data" jsonb DEFAULT '{}',
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);

-- Add indexes for audit table
CREATE INDEX IF NOT EXISTS "idx_public_token_audit_token_id" ON "public_token_audit" USING btree ("token_id");
CREATE INDEX IF NOT EXISTS "idx_public_token_audit_resource" ON "public_token_audit" USING btree ("resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "idx_public_token_audit_created_at" ON "public_token_audit" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "idx_public_token_audit_tenant_id" ON "public_token_audit" USING btree ("tenant_id");

-- Add foreign key constraints
ALTER TABLE "public_token_audit" ADD CONSTRAINT "public_token_audit_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "public_token_audit" ADD CONSTRAINT "public_token_audit_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;

-- Add unique constraints for better data integrity
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quotes_public_token_unique" ON "quotes" USING btree ("public_token") WHERE "public_token" IS NOT NULL;

-- Add check constraints for data validation
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_public_token_not_empty" CHECK ("public_token" IS NULL OR length("public_token") > 0);
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_token_used_at_after_created" CHECK ("token_used_at" IS NULL OR "token_used_at" >= "created_at");

-- Add constraints for rate limiting table
ALTER TABLE "public_rate_limits" ADD CONSTRAINT "public_rate_limits_request_count_positive" CHECK ("request_count" > 0);
ALTER TABLE "public_rate_limits" ADD CONSTRAINT "public_rate_limits_window_start_not_future" CHECK ("window_start" <= now());

-- Add constraints for audit table
ALTER TABLE "public_token_audit" ADD CONSTRAINT "public_token_audit_token_id_not_empty" CHECK (length("token_id") > 0);
ALTER TABLE "public_token_audit" ADD CONSTRAINT "public_token_audit_resource_type_valid" CHECK ("resource_type" IN ('quote', 'invoice', 'project'));
ALTER TABLE "public_token_audit" ADD CONSTRAINT "public_token_audit_action_valid" CHECK ("action" IN ('view', 'accept', 'reject', 'download'));

