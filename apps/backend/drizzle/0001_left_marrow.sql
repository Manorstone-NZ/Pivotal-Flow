CREATE TABLE "approval_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"approver_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp (3) DEFAULT now() NOT NULL,
	"decided_at" timestamp (3),
	"reason" text,
	"notes" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" text NOT NULL,
	"action" varchar(100) NOT NULL,
	"user_id" text,
	"request_id" text,
	"ip_address" "inet",
	"user_agent" text,
	"session_id" varchar(255),
	"old_values" jsonb,
	"new_values" jsonb,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"customer_number" varchar(50) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"industry" varchar(100),
	"website" text,
	"description" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"customer_type" varchar(50) DEFAULT 'business' NOT NULL,
	"source" varchar(50),
	"tags" text[],
	"rating" integer,
	"street" text,
	"suburb" text,
	"city" text,
	"region" text,
	"postcode" text,
	"country" text,
	"phone" varchar(20),
	"email" varchar(255),
	"contact_extras" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3),
	CONSTRAINT "customers_customer_number_unique" UNIQUE("customer_number")
);
--> statement-breakpoint
CREATE TABLE "export_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"format" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"filters" jsonb DEFAULT '{}' NOT NULL,
	"file_name" text NOT NULL,
	"total_rows" integer,
	"processed_rows" integer DEFAULT 0 NOT NULL,
	"download_url" text,
	"error_message" text,
	"started_at" timestamp (3),
	"completed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"base_currency" varchar(3) NOT NULL,
	"quote_currency" varchar(3) NOT NULL,
	"rate" numeric(15, 6) NOT NULL,
	"effective_from" date NOT NULL,
	"source" varchar(50) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"route" varchar(255) NOT NULL,
	"request_hash" text NOT NULL,
	"response_status" integer NOT NULL,
	"response_body" jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"expires_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"quantity" numeric(10, 4) DEFAULT '1.0000' NOT NULL,
	"unit_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"description" text NOT NULL,
	"unit" varchar(20) DEFAULT 'hour' NOT NULL,
	"service_category_id" text,
	"rate_card_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"customer_id" text NOT NULL,
	"project_id" text,
	"quote_id" text,
	"currency" varchar(3) DEFAULT 'NZD' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"balance_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"issued_at" timestamp (3),
	"due_at" timestamp (3),
	"paid_at" timestamp (3),
	"overdue_at" timestamp (3),
	"written_off_at" timestamp (3),
	"fx_rate_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"terms_conditions" text,
	"notes" text,
	"internal_notes" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"result" jsonb,
	"error_message" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"total_steps" integer,
	"current_step" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp (3),
	"completed_at" timestamp (3),
	"scheduled_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_feature_flags" (
	"org_id" text NOT NULL,
	"flag_key" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"payload" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_notification_prefs" (
	"org_id" text NOT NULL,
	"channel" varchar(20) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"settings" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_security_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"min_password_length" integer DEFAULT 12 NOT NULL,
	"mfa_required" boolean DEFAULT true NOT NULL,
	"session_timeout_minutes" integer DEFAULT 60 NOT NULL,
	"max_login_attempts" integer DEFAULT 5 NOT NULL,
	"password_expiry_days" integer,
	"extras" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_settings" (
	"org_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"industry" varchar(100),
	"size" varchar(50),
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"taxId" varchar(100),
	"street" text,
	"suburb" text,
	"city" text,
	"region" text,
	"postcode" text,
	"country" text,
	"phone" varchar(20),
	"email" varchar(255),
	"website" text,
	"contact_extras" jsonb,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"subscriptionPlan" varchar(50) DEFAULT 'basic' NOT NULL,
	"subscriptionStatus" varchar(20) DEFAULT 'active' NOT NULL,
	"trialEndsAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"deletedAt" timestamp (3),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"method" varchar(50) NOT NULL,
	"reference" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp (3) NOT NULL,
	"voided_at" timestamp (3),
	"idempotency_key" text,
	"gateway_payload" jsonb,
	"created_by" text NOT NULL,
	"voided_by" text,
	"void_reason" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"roleId" text NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"policy" jsonb NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"description" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"owner_id" text,
	"start_date" date,
	"end_date" date,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "quote_line_item_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_version_id" text NOT NULL,
	"line_number" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"sku" varchar(50),
	"description" text NOT NULL,
	"quantity" numeric(10, 4) NOT NULL,
	"unit_price" numeric(15, 4) NOT NULL,
	"unit_cost" numeric(15, 4),
	"unit" varchar(50) NOT NULL,
	"tax_inclusive" boolean DEFAULT false NOT NULL,
	"tax_rate" numeric(5, 4) NOT NULL,
	"tax_amount" numeric(15, 2) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 4) NOT NULL,
	"discount_amount" numeric(15, 2) NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"service_category_id" text,
	"rate_card_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_line_items" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_id" text NOT NULL,
	"line_number" integer NOT NULL,
	"type" varchar(50) DEFAULT 'service' NOT NULL,
	"sku" varchar(50),
	"description" text NOT NULL,
	"quantity" numeric(10, 4) DEFAULT '1.0000' NOT NULL,
	"unit_price" numeric(15, 4) NOT NULL,
	"unit_cost" numeric(15, 4),
	"unit" varchar(50) DEFAULT 'hour' NOT NULL,
	"tax_inclusive" boolean DEFAULT false NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0.1500' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"discount_value" numeric(10, 4) DEFAULT '0.0000' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"service_category_id" text,
	"rate_card_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"organization_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"project_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"valid_from" date NOT NULL,
	"valid_until" date NOT NULL,
	"currency" varchar(3) NOT NULL,
	"exchange_rate" numeric(10, 6) NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_rate" numeric(5, 4) NOT NULL,
	"tax_amount" numeric(15, 2) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 4) NOT NULL,
	"discount_amount" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"terms_conditions" text,
	"notes" text,
	"internal_notes" text,
	"created_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp (3),
	"sent_at" timestamp (3),
	"accepted_at" timestamp (3),
	"expires_at" timestamp (3),
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"quote_number" varchar(50) NOT NULL,
	"customer_id" text NOT NULL,
	"project_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"type" varchar(50) DEFAULT 'project' NOT NULL,
	"valid_from" date NOT NULL,
	"valid_until" date NOT NULL,
	"currency" varchar(3) DEFAULT 'NZD' NOT NULL,
	"exchange_rate" numeric(10, 6) DEFAULT '1.000000' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0.1500' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"discount_value" numeric(10, 4) DEFAULT '0.0000' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"terms_conditions" text,
	"notes" text,
	"internal_notes" text,
	"created_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp (3),
	"sent_at" timestamp (3),
	"accepted_at" timestamp (3),
	"expires_at" timestamp (3),
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "rate_card_items" (
	"id" text PRIMARY KEY NOT NULL,
	"rate_card_id" text NOT NULL,
	"service_category_id" text NOT NULL,
	"role_id" text,
	"item_code" varchar(50),
	"unit" varchar(20) DEFAULT 'hour' NOT NULL,
	"base_rate" numeric(15, 4) NOT NULL,
	"currency" varchar(3) DEFAULT 'NZD' NOT NULL,
	"tax_class" varchar(20) DEFAULT 'standard' NOT NULL,
	"tiering_model_id" text,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(20) DEFAULT '1.0' NOT NULL,
	"description" text,
	"currency" varchar(3) DEFAULT 'NZD' NOT NULL,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(100) NOT NULL,
	"allocation_percent" numeric(5, 2) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_billable" boolean DEFAULT true NOT NULL,
	"notes" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"description" text,
	"ordering" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_classes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "tax_classes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp (3) DEFAULT now() NOT NULL,
	"expires_at" timestamp (3),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"customer_id" text,
	"email" varchar(255) NOT NULL,
	"username" varchar(100),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"display_name" varchar(200),
	"avatar_url" text,
	"phone" varchar(20),
	"user_type" varchar(20) DEFAULT 'internal' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"locale" varchar(10) DEFAULT 'en-US' NOT NULL,
	"date_format" varchar(20) DEFAULT 'DD MMM YYYY' NOT NULL,
	"time_format" varchar(10) DEFAULT '24h' NOT NULL,
	"preferences" jsonb DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp (3),
	"last_login_at" timestamp (3),
	"login_count" integer DEFAULT 0 NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp (3),
	"password_hash" varchar(255),
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_secret" varchar(255),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates" ADD CONSTRAINT "fx_rates_base_currency_currencies_code_fk" FOREIGN KEY ("base_currency") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates" ADD CONSTRAINT "fx_rates_quote_currency_currencies_code_fk" FOREIGN KEY ("quote_currency") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_rate_card_id_rate_cards_id_fk" FOREIGN KEY ("rate_card_id") REFERENCES "public"."rate_cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_fx_rate_id_fx_rates_id_fk" FOREIGN KEY ("fx_rate_id") REFERENCES "public"."fx_rates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_feature_flags" ADD CONSTRAINT "org_feature_flags_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_notification_prefs" ADD CONSTRAINT "org_notification_prefs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_security_policies" ADD CONSTRAINT "org_security_policies_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_settings" ADD CONSTRAINT "org_settings_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_idempotency_key_idempotency_keys_id_fk" FOREIGN KEY ("idempotency_key") REFERENCES "public"."idempotency_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_overrides" ADD CONSTRAINT "policy_overrides_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_overrides" ADD CONSTRAINT "policy_overrides_roleId_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item_versions" ADD CONSTRAINT "quote_line_item_versions_quote_version_id_quote_versions_id_fk" FOREIGN KEY ("quote_version_id") REFERENCES "public"."quote_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item_versions" ADD CONSTRAINT "quote_line_item_versions_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item_versions" ADD CONSTRAINT "quote_line_item_versions_rate_card_id_rate_cards_id_fk" FOREIGN KEY ("rate_card_id") REFERENCES "public"."rate_cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_rate_card_id_rate_cards_id_fk" FOREIGN KEY ("rate_card_id") REFERENCES "public"."rate_cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_card_items" ADD CONSTRAINT "rate_card_items_rate_card_id_rate_cards_id_fk" FOREIGN KEY ("rate_card_id") REFERENCES "public"."rate_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_card_items" ADD CONSTRAINT "rate_card_items_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_card_items" ADD CONSTRAINT "rate_card_items_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "approval_requests_entity_unique" ON "approval_requests" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_approval_requests_approver_status" ON "approval_requests" USING btree ("approver_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_approval_requests_org_status" ON "approval_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "export_jobs_organization_id_idx" ON "export_jobs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "export_jobs_user_id_idx" ON "export_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "export_jobs_status_idx" ON "export_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "export_jobs_report_type_idx" ON "export_jobs" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "export_jobs_created_at_idx" ON "export_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "export_jobs_user_status_idx" ON "export_jobs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "export_jobs_org_status_idx" ON "export_jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "fx_rates_currency_pair_date_unique" ON "fx_rates" USING btree ("base_currency","quote_currency","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "fx_rates_lookup" ON "fx_rates" USING btree ("base_currency","quote_currency","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_org_user_route_hash_unique" ON "idempotency_keys" USING btree ("organization_id","user_id","route","request_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_invoice_number_organization_unique" ON "invoices" USING btree ("invoice_number","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invoices_currency" ON "invoices" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "idx_jobs_organization_id" ON "jobs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_user_id" ON "jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_status" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_jobs_job_type" ON "jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_jobs_created_at" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_jobs_scheduled_at" ON "jobs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_jobs_user_status" ON "jobs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_jobs_org_status" ON "jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_jobs_priority_status" ON "jobs" USING btree ("priority","status");--> statement-breakpoint
CREATE UNIQUE INDEX "org_feature_flags_pkey" ON "org_feature_flags" USING btree ("org_id","flag_key");--> statement-breakpoint
CREATE UNIQUE INDEX "org_notification_prefs_pkey" ON "org_notification_prefs" USING btree ("org_id","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "org_security_policies_org_unique" ON "org_security_policies" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_settings_org_key_unique" ON "org_settings" USING btree ("org_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payments_invoice_id" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payments_idempotency_key" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_action_resource_unique" ON "permissions" USING btree ("action","resource");--> statement-breakpoint
CREATE UNIQUE INDEX "policy_overrides_org_role_resource_action_unique" ON "policy_overrides" USING btree ("organizationId","roleId","resource","action");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_line_item_versions_version_line_unique" ON "quote_line_item_versions" USING btree ("quote_version_id","line_number");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_versions_quote_version_unique" ON "quote_versions" USING btree ("quote_id","version_number");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_quote_number_organization_id_unique" ON "quotes" USING btree ("quote_number","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_allocations_user_date_overlap" ON "resource_allocations" USING btree ("user_id","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_allocations_project_user" ON "resource_allocations" USING btree ("project_id","user_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_allocations_user_date_range" ON "resource_allocations" USING btree ("user_id","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_organization_id_name_key" ON "roles" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_classes_code_unique" ON "tax_classes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_classes_active_order" ON "tax_classes" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "users_customer_id_idx" ON "users" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "users_external_customer_lookup" ON "users" USING btree ("organization_id","customer_id","user_type");