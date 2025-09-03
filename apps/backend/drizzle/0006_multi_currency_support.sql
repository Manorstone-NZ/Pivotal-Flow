-- Migration: Add multi-currency support
-- Description: Adds currencies table, fx_rates table, and fx_rate_id columns to quotes and invoices

-- Create currencies table
CREATE TABLE IF NOT EXISTS "currencies" (
    "code" varchar(3) PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "symbol" varchar(10),
    "decimals" integer NOT NULL DEFAULT 2,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now()
);

-- Create fx_rates table
CREATE TABLE IF NOT EXISTS "fx_rates" (
    "id" text PRIMARY KEY,
    "base_currency" varchar(3) NOT NULL REFERENCES "currencies"("code") ON DELETE CASCADE,
    "quote_currency" varchar(3) NOT NULL REFERENCES "currencies"("code") ON DELETE CASCADE,
    "rate" decimal(15,6) NOT NULL,
    "effective_from" date NOT NULL,
    "source" varchar(50) NOT NULL,
    "verified" boolean NOT NULL DEFAULT false,
    "created_at" timestamp(3) NOT NULL DEFAULT now(),
    "updated_at" timestamp(3) NOT NULL DEFAULT now()
);

-- Create unique indexes for fx_rates
CREATE UNIQUE INDEX IF NOT EXISTS "fx_rates_currency_pair_date_unique" ON "fx_rates"("base_currency", "quote_currency", "effective_from");
CREATE UNIQUE INDEX IF NOT EXISTS "fx_rates_lookup" ON "fx_rates"("base_currency", "quote_currency", "effective_from");

-- Add fx_rate_id column to quotes table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "fx_rate_id" text REFERENCES "fx_rates"("id") ON DELETE SET NULL;

-- Add fx_rate_id column to invoices table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "fx_rate_id" text REFERENCES "fx_rates"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Insert default currencies
INSERT INTO "currencies" ("code", "name", "symbol", "decimals", "is_active") VALUES
    ('NZD', 'New Zealand Dollar', '$', 2, true),
    ('AUD', 'Australian Dollar', 'A$', 2, true),
    ('USD', 'US Dollar', '$', 2, true),
    ('EUR', 'Euro', '€', 2, true),
    ('GBP', 'British Pound', '£', 2, true),
    ('CAD', 'Canadian Dollar', 'C$', 2, true),
    ('JPY', 'Japanese Yen', '¥', 0, true)
ON CONFLICT ("code") DO NOTHING;

-- Insert some default FX rates
INSERT INTO "fx_rates" ("id", "base_currency", "quote_currency", "rate", "effective_from", "source", "verified") VALUES
    (gen_random_uuid()::text, 'NZD', 'USD', 0.600000, CURRENT_DATE, 'manual', true),
    (gen_random_uuid()::text, 'USD', 'NZD', 1.666667, CURRENT_DATE, 'manual', true),
    (gen_random_uuid()::text, 'NZD', 'AUD', 0.920000, CURRENT_DATE, 'manual', true),
    (gen_random_uuid()::text, 'AUD', 'NZD', 1.086957, CURRENT_DATE, 'manual', true),
    (gen_random_uuid()::text, 'USD', 'AUD', 1.533333, CURRENT_DATE, 'manual', true),
    (gen_random_uuid()::text, 'AUD', 'USD', 0.652174, CURRENT_DATE, 'manual', true)
ON CONFLICT ("base_currency", "quote_currency", "effective_from") DO NOTHING;
