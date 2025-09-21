-- Add sessions table for proper session management with PASETO tokens
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"tenant_id" text REFERENCES "tenants"("id") ON DELETE set null,
	"device_fingerprint" text NOT NULL,
	"ip_hash" text NOT NULL,
	"refresh_kid" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"revoked_at" timestamp (3)
);

-- Add indexes for sessions table
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_tenant_id" ON "sessions" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_device_fingerprint" ON "sessions" USING btree ("device_fingerprint");
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "idx_sessions_revoked_at" ON "sessions" USING btree ("revoked_at");

-- Add password hash algorithm support for Argon2id migration
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash_algo" varchar(50) DEFAULT 'legacy';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash_salt" text;

-- Add indexes for password hash fields
CREATE INDEX IF NOT EXISTS "idx_users_password_hash_algo" ON "users" USING btree ("password_hash_algo");

-- Add OPRF records table for OPAQUE PAKE
CREATE TABLE IF NOT EXISTS "oprf_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"record_data" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"expires_at" timestamp (3) NOT NULL
);

-- Add indexes for OPRF records
CREATE INDEX IF NOT EXISTS "idx_oprf_records_user_id" ON "oprf_records" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_oprf_records_expires_at" ON "oprf_records" USING btree ("expires_at");

-- Add PASETO keys table for token signing/encryption
CREATE TABLE IF NOT EXISTS "paseto_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"key_id" varchar(50) NOT NULL,
	"key_type" varchar(20) NOT NULL CHECK ("key_type" IN ('public', 'local')),
	"key_purpose" varchar(20) NOT NULL CHECK ("key_purpose" IN ('access', 'refresh', 'public')),
	"key_data" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"expires_at" timestamp (3),
	"is_active" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp (3)
);

-- Add unique constraint for active keys
CREATE UNIQUE INDEX IF NOT EXISTS "idx_paseto_keys_active_key_purpose" ON "paseto_keys" USING btree ("key_purpose") WHERE "is_active" = true AND "revoked_at" IS NULL;

-- Add audit table for authentication events
CREATE TABLE IF NOT EXISTS "auth_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text REFERENCES "users"("id") ON DELETE set null,
	"session_id" text REFERENCES "sessions"("id") ON DELETE set null,
	"tenant_id" text REFERENCES "tenants"("id") ON DELETE set null,
	"action" varchar(50) NOT NULL,
	"ip_address" inet,
	"user_agent" text,
	"device_fingerprint" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);

-- Add indexes for auth audit
CREATE INDEX IF NOT EXISTS "idx_auth_audit_user_id" ON "auth_audit" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_session_id" ON "auth_audit" USING btree ("session_id");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_tenant_id" ON "auth_audit" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_action" ON "auth_audit" USING btree ("action");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_created_at" ON "auth_audit" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_success" ON "auth_audit" USING btree ("success");

-- Add constraints for data validation
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_fingerprint_not_empty" CHECK (length("device_fingerprint") > 0);
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_ip_hash_not_empty" CHECK (length("ip_hash") > 0);
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_expires_at_after_created" CHECK ("expires_at" > "created_at");

ALTER TABLE "users" ADD CONSTRAINT "users_password_hash_algo_valid" CHECK ("password_hash_algo" IN ('legacy', 'argon2id'));

ALTER TABLE "oprf_records" ADD CONSTRAINT "oprf_records_expires_at_after_created" CHECK ("expires_at" > "created_at");
ALTER TABLE "oprf_records" ADD CONSTRAINT "oprf_records_record_data_not_empty" CHECK (length("record_data") > 0);

ALTER TABLE "paseto_keys" ADD CONSTRAINT "paseto_keys_key_id_not_empty" CHECK (length("key_id") > 0);
ALTER TABLE "paseto_keys" ADD CONSTRAINT "paseto_keys_key_data_not_empty" CHECK (length("key_data") > 0);

ALTER TABLE "auth_audit" ADD CONSTRAINT "auth_audit_action_valid" CHECK ("action" IN ('login', 'logout', 'register', 'refresh', 'assume_tenant', 'password_change', 'password_reset', 'session_revoke'));

-- Add cleanup functions for expired records
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
  UPDATE "sessions" SET "revoked_at" = now() WHERE "expires_at" < now() AND "revoked_at" IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_oprf_records() RETURNS void AS $$
BEGIN
  DELETE FROM "oprf_records" WHERE "expires_at" < now();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_paseto_keys() RETURNS void AS $$
BEGIN
  UPDATE "paseto_keys" SET "revoked_at" = now() WHERE "expires_at" < now() AND "revoked_at" IS NULL;
END;
$$ LANGUAGE plpgsql;

