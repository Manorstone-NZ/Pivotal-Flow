-- Migration: Add invoices and payments tables
-- Description: Adds invoices, invoice_line_items, and payments tables with proper monetary columns and relationships

-- Create invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" text PRIMARY KEY,
    "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "invoice_number" varchar(50) NOT NULL,
    "customer_id" text NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
    "project_id" text REFERENCES "projects"("id") ON DELETE SET NULL,
    "quote_id" text REFERENCES "quotes"("id") ON DELETE SET NULL,
    "currency" varchar(3) NOT NULL DEFAULT 'NZD' REFERENCES "currencies"("code"),
    "subtotal" decimal(15,2) NOT NULL DEFAULT 0.00,
    "tax_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "discount_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "total_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "paid_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "balance_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "status" varchar(20) NOT NULL DEFAULT 'draft',
    "issued_at" timestamp(3),
    "due_at" timestamp(3),
    "paid_at" timestamp(3),
    "overdue_at" timestamp(3),
    "written_off_at" timestamp(3),
    "fx_rate_id" text REFERENCES "fx_rates"("id") ON DELETE SET NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "terms_conditions" text,
    "notes" text,
    "internal_notes" text,
    "metadata" jsonb NOT NULL DEFAULT '{}',
    "created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "approved_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "approved_at" timestamp(3),
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now(),
    "deleted_at" timestamp(3)
);

-- Create unique indexes for invoices
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoice_number_organization_unique" ON "invoices"("invoice_number", "organization_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "idx_invoices_currency" ON "invoices"("currency");

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS "invoice_line_items" (
    "id" text PRIMARY KEY,
    "invoice_id" text NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
    "quantity" decimal(10,4) NOT NULL DEFAULT 1.0000,
    "unit_price" decimal(15,2) NOT NULL DEFAULT 0.00,
    "subtotal" decimal(15,2) NOT NULL DEFAULT 0.00,
    "tax_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "discount_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "total_amount" decimal(15,2) NOT NULL DEFAULT 0.00,
    "description" text NOT NULL,
    "unit" varchar(20) NOT NULL DEFAULT 'hour',
    "service_category_id" text REFERENCES "service_categories"("id") ON DELETE SET NULL,
    "rate_card_id" text REFERENCES "rate_cards"("id") ON DELETE SET NULL,
    "metadata" jsonb NOT NULL DEFAULT '{}',
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" text PRIMARY KEY,
    "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "invoice_id" text NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
    "amount" decimal(15,2) NOT NULL,
    "currency" varchar(3) NOT NULL REFERENCES "currencies"("code"),
    "method" varchar(50) NOT NULL,
    "reference" varchar(100),
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "paid_at" timestamp(3) NOT NULL,
    "voided_at" timestamp(3),
    "idempotency_key" text REFERENCES "idempotency_keys"("id") ON DELETE SET NULL,
    "gateway_payload" jsonb,
    "created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "voided_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "void_reason" text,
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS "idx_payments_invoice_id" ON "payments"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_payments_idempotency_key" ON "payments"("idempotency_key");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments"("status");

-- Insert some sample invoices for testing
INSERT INTO "invoices" ("id", "organization_id", "invoice_number", "customer_id", "title", "currency", "subtotal", "tax_amount", "total_amount", "status", "created_by") VALUES
    (gen_random_uuid()::text, 'org-1', 'INV-001', 'cust-1', 'Web Development Services', 'NZD', 5000.00, 750.00, 5750.00, 'sent', 'user-1'),
    (gen_random_uuid()::text, 'org-1', 'INV-002', 'cust-1', 'Consulting Services', 'AUD', 3000.00, 450.00, 3450.00, 'part_paid', 'user-1'),
    (gen_random_uuid()::text, 'org-1', 'INV-003', 'cust-2', 'Design Services', 'USD', 2000.00, 300.00, 2300.00, 'paid', 'user-1')
ON CONFLICT DO NOTHING;

