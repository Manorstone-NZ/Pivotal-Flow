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

// Payments table - typed columns for all monetary values
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  invoiceId: text('invoice_id').notNull(),
  // Typed monetary columns
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  // Payment details
  method: varchar('method', { length: 50 }).notNull(), // bank_transfer, credit_card, cash, etc.
  reference: varchar('reference', { length: 100 }), // Bank reference, transaction ID, etc.
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, completed, void, failed
  // Dates
  paidAt: timestamp('paid_at', { mode: 'date', precision: 3 }).notNull(),
  voidedAt: timestamp('voided_at', { mode: 'date', precision: 3 }),
  // Idempotency
  idempotencyKey: text('idempotency_key'),
  // JSONB only for optional gateway payloads
  gatewayPayload: jsonb('gateway_payload'), // Optional opaque gateway response data
  // Audit fields
  createdBy: text('created_by').notNull(),
  voidedBy: text('voided_by'),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Invoices table - typed columns for all monetary values
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  customerId: text('customer_id').notNull(),
  projectId: text('project_id'),
  quoteId: text('quote_id'),
  // Typed monetary columns - no totals in JSONB
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  balanceAmount: decimal('balance_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  // Status and dates
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, sent, part_paid, paid, overdue, written_off
  issuedAt: timestamp('issued_at', { mode: 'date', precision: 3 }),
  dueAt: timestamp('due_at', { mode: 'date', precision: 3 }),
  paidAt: timestamp('paid_at', { mode: 'date', precision: 3 }),
  overdueAt: timestamp('overdue_at', { mode: 'date', precision: 3 }),
  writtenOffAt: timestamp('written_off_at', { mode: 'date', precision: 3 }),
  // FX rate snapshot for display conversions
  fxRateId: text('fx_rate_id'),
  // Normalized fields
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  termsConditions: text('terms_conditions'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  // JSONB only for optional metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Optional display notes, never totals
  // Audit fields
  createdBy: text('created_by').notNull(),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { mode: 'date', precision: 3 }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
});

// Idempotency keys table
export const idempotencyKeys = pgTable('idempotency_keys', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  route: varchar('route', { length: 255 }).notNull(),
  requestHash: text('request_hash').notNull(),
  responseStatus: integer('response_status').notNull(),
  responseBody: jsonb('response_body').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date', precision: 3 }).notNull(),
});

// Types for TypeScript
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
export type FxRate = typeof fxRates.$inferSelect;
export type NewFxRate = typeof fxRates.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKey = typeof idempotencyKeys.$inferInsert;
