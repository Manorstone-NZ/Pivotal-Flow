-- Add used_at field to quotes table for public token replay protection
ALTER TABLE "quotes" ADD COLUMN "token_used_at" timestamp (3);

-- Add index for token usage tracking
CREATE INDEX "idx_quotes_token_used_at" ON "quotes" USING btree ("token_used_at");

-- Add index for public token lookup with used_at
CREATE INDEX "idx_quotes_public_token_used" ON "quotes" USING btree ("public_token", "token_used_at");

-- Add rate limiting table for public endpoints
CREATE TABLE "public_rate_limits" (
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
CREATE INDEX "idx_public_rate_limits_endpoint_ip" ON "public_rate_limits" USING btree ("endpoint", "ip_address", "window_start");
CREATE INDEX "idx_public_rate_limits_token" ON "public_rate_limits" USING btree ("token_id", "window_start");

-- Add audit logging for public token usage
CREATE TABLE "public_token_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"token_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"ip_address" inet NOT NULL,
	"user_agent" text,
	"organization_id" text NOT NULL,
	"quote_id" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);

-- Add indexes for audit logging
CREATE INDEX "idx_public_token_audit_token" ON "public_token_audit" USING btree ("token_id", "created_at");
CREATE INDEX "idx_public_token_audit_org" ON "public_token_audit" USING btree ("organization_id", "created_at");
CREATE INDEX "idx_public_token_audit_action" ON "public_token_audit" USING btree ("action", "created_at");

