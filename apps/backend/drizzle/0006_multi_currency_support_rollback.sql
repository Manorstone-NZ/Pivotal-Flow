-- Rollback Migration: Remove multi-currency support
-- Date: 2025-01-30
-- Purpose: Rollback changes from 0006_multi_currency_support.sql

-- Remove fx_rate_id columns first
ALTER TABLE "quotes" DROP COLUMN IF EXISTS "fx_rate_id";

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        ALTER TABLE "invoices" DROP COLUMN IF EXISTS "fx_rate_id";
    END IF;
END $$;

-- Remove fx_rates table and its indexes
DROP INDEX IF EXISTS "fx_rates_currency_pair_date_unique";
DROP INDEX IF EXISTS "fx_rates_lookup";
DROP TABLE IF EXISTS "fx_rates" CASCADE;

-- Remove currency references from other tables before dropping currencies table
ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "quotes_currency_fkey";
ALTER TABLE "quotes" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "quotes" ALTER COLUMN "currency" TYPE varchar(3);

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_currency_fkey";
        ALTER TABLE "invoices" ALTER COLUMN "currency" DROP DEFAULT;
        ALTER TABLE "invoices" ALTER COLUMN "currency" TYPE varchar(3);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_currency_fkey";
        ALTER TABLE "payments" ALTER COLUMN "currency" TYPE varchar(3);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rate_cards') THEN
        ALTER TABLE "rate_cards" DROP CONSTRAINT IF EXISTS "rate_cards_currency_fk";
        ALTER TABLE "rate_cards" ALTER COLUMN "currency" TYPE varchar(3);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rate_card_items') THEN
        ALTER TABLE "rate_card_items" DROP CONSTRAINT IF EXISTS "rate_card_items_currency_fk";
        ALTER TABLE "rate_card_items" ALTER COLUMN "currency" TYPE varchar(3);
    END IF;
END $$;

-- Now remove currencies table
DROP TABLE IF EXISTS "currencies" CASCADE;
