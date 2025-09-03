import { pgTable, text, timestamp, boolean, jsonb, integer, varchar, decimal, date, uniqueIndex } from 'drizzle-orm/pg-core';

// Currencies table - ISO 4217 currency codes with decimal places
export const currencies = pgTable('currencies', {
  code: varchar('code', { length: 3 }).primaryKey(), // ISO 4217 code (NZD, AUD, USD, etc.)
  name: varchar('name', { length: 100 }).notNull(), // Full name (New Zealand Dollar)
  symbol: varchar('symbol', { length: 10 }), // Currency symbol ($, €, £, etc.)
  decimals: integer('decimals').notNull().default(2), // Decimal places for rounding (2 for most, 0 for JPY)
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// FX Rates table - Exchange rates with source and effective date
export const fxRates = pgTable('fx_rates', {
  id: text('id').primaryKey(),
  baseCurrency: varchar('base_currency', { length: 3 }).notNull().references(() => currencies.code, { onDelete: 'cascade' }),
  quoteCurrency: varchar('quote_currency', { length: 3 }).notNull().references(() => currencies.code, { onDelete: 'cascade' }),
  rate: decimal('rate', { precision: 15, scale: 6 }).notNull(), // Exchange rate (e.g., 1.234567)
  effectiveFrom: date('effective_from').notNull(), // Date from which this rate is effective
  source: varchar('source', { length: 50 }).notNull(), // Source of the rate (RBNZ, ECB, manual, etc.)
  verified: boolean('verified').notNull().default(false), // Whether rate has been verified
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate rates for same currency pair and date
  currencyPairDateUnique: uniqueIndex('fx_rates_currency_pair_date_unique').on(
    table.baseCurrency, 
    table.quoteCurrency, 
    table.effectiveFrom
  ),
  // Index for efficient rate lookups
  rateLookup: uniqueIndex('fx_rates_lookup').on(
    table.baseCurrency, 
    table.quoteCurrency, 
    table.effectiveFrom
  ),
}));

// Types for TypeScript
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
export type FxRate = typeof fxRates.$inferSelect;
export type NewFxRate = typeof fxRates.$inferInsert;
