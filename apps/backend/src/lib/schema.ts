import { pgTable, text, timestamp, boolean, jsonb, integer, varchar, decimal, date, uniqueIndex, index, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Currencies table - ISO 4217 currency codes for validation
export const currencies = pgTable('currencies', {
  code: varchar('code', { length: 3 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// FX Rates table - exchange rates with effective dates
export const fxRates = pgTable('fx_rates', {
  id: text('id').primaryKey(),
  baseCurrency: varchar('base_currency', { length: 3 }).notNull().references(() => currencies.code, { onDelete: 'cascade' }),
  quoteCurrency: varchar('quote_currency', { length: 3 }).notNull().references(() => currencies.code, { onDelete: 'cascade' }),
  rate: decimal('rate', { precision: 15, scale: 6 }).notNull(),
  effectiveFrom: date('effective_from').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  currencyPairDateUnique: uniqueIndex('fx_rates_currency_pair_date_unique').on(table.baseCurrency, table.quoteCurrency, table.effectiveFrom),
  rateLookup: uniqueIndex('fx_rates_lookup').on(table.baseCurrency, table.quoteCurrency, table.effectiveFrom),
}));

// Organizations table - normalized address and contact info
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  taxId: varchar('taxId', { length: 100 }),
  // Normalized address fields
  street: text('street'),
  suburb: text('suburb'),
  city: text('city'),
  region: text('region'),
  postcode: text('postcode'),
  country: text('country'),
  // Normalized contact fields
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: text('website'),
  // Keep JSONB only for flexible extras
  contactExtras: jsonb('contact_extras'), // Social links, secondary channels
  settings: jsonb('settings').notNull().default('{}'), // Feature-specific payloads
  subscriptionPlan: varchar('subscriptionPlan', { length: 50 }).notNull().default('basic'),
  subscriptionStatus: varchar('subscriptionStatus', { length: 20 }).notNull().default('active'),
  trialEndsAt: timestamp('trialEndsAt', { mode: 'date', precision: 3 }),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Organization security policies table
export const orgSecurityPolicies = pgTable('org_security_policies', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  minPasswordLength: integer('min_password_length').notNull().default(12),
  mfaRequired: boolean('mfa_required').notNull().default(true),
  sessionTimeoutMinutes: integer('session_timeout_minutes').notNull().default(60),
  maxLoginAttempts: integer('max_login_attempts').notNull().default(5),
  passwordExpiryDays: integer('password_expiry_days'),
  extras: jsonb('extras'), // Flexible additional security settings
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgUnique: uniqueIndex('org_security_policies_org_unique').on(table.orgId),
}));

// Organization feature flags table
export const orgFeatureFlags = pgTable('org_feature_flags', {
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  flagKey: text('flag_key').notNull(),
  isEnabled: boolean('is_enabled').notNull().default(false),
  payload: jsonb('payload'), // Feature-specific configuration
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgFlagUnique: uniqueIndex('org_feature_flags_pkey').on(table.orgId, table.flagKey),
}));

// Organization notification preferences table
export const orgNotificationPrefs = pgTable('org_notification_prefs', {
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 20 }).notNull(), // email, sms, push
  isEnabled: boolean('is_enabled').notNull().default(true),
  settings: jsonb('settings'), // Channel-specific notification settings
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgChannelUnique: uniqueIndex('org_notification_prefs_pkey').on(table.orgId, table.channel),
}));

// Users table - normalized preferences, keep metadata in JSONB
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'cascade' }), // For external customer users
  email: varchar('email', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 200 }),
  avatarUrl: text('avatar_url'),
  phone: varchar('phone', { length: 20 }),
  userType: varchar('user_type', { length: 20 }).notNull().default('internal'), // 'internal' or 'external_customer'
  // Normalized preference fields
  timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
  locale: varchar('locale', { length: 10 }).notNull().default('en-US'),
  dateFormat: varchar('date_format', { length: 20 }).notNull().default('DD MMM YYYY'),
  timeFormat: varchar('time_format', { length: 10 }).notNull().default('24h'),
  // Keep JSONB for flexible preferences
  preferences: jsonb('preferences').notNull().default('{}'), // Dashboard layout, UI tweaks
  metadata: jsonb('metadata').notNull().default('{}'), // Custom fields per customer
  status: varchar('status', { length: 20 }).notNull().default('active'),
  emailVerified: boolean('email_verified').notNull().default(false),
  emailVerifiedAt: timestamp('email_verified_at', { mode: 'date', precision: 3 }),
  lastLoginAt: timestamp('last_login_at', { mode: 'date', precision: 3 }),
  loginCount: integer('login_count').notNull().default(0),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { mode: 'date', precision: 3 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  mfaSecret: varchar('mfa_secret', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
}, (table) => ({
  customerIdIdx: index('users_customer_id_idx').on(table.customerId),
  externalCustomerLookup: index('users_external_customer_lookup').on(table.organizationId, table.customerId, table.userType),
}));

// Permissions table
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  actionResourceUnique: uniqueIndex('permissions_action_resource_unique').on(table.action, table.resource),
}));

// Roles table
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgNameUnique: uniqueIndex('roles_organization_id_name_key').on(table.organizationId, table.name),
}));

// Role permissions junction table
export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  rolePermissionUnique: uniqueIndex('role_permissions_role_id_permission_id_key').on(table.roleId, table.permissionId),
}));

// Policy overrides table - proper scope columns plus JSONB policy
export const policyOverrides = pgTable('policy_overrides', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // Added action column for proper scoping
  policy: jsonb('policy').notNull(), // Keep JSONB for policy conditions
  description: text('description'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgRoleResourceActionUnique: uniqueIndex('policy_overrides_org_role_resource_action_unique').on(table.organizationId, table.roleId, table.resource, table.action),
}));

// User roles junction table
export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  assignedBy: text('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date', precision: 3 }),
  isActive: boolean('is_active').notNull().default(true),
});

// Customers table - normalized address and contact info
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerNumber: varchar('customer_number', { length: 50 }).notNull().unique(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  website: text('website'),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  customerType: varchar('customer_type', { length: 50 }).notNull().default('business'),
  source: varchar('source', { length: 50 }),
  tags: text('tags').array(),
  rating: integer('rating'),
  // Normalized address fields
  street: text('street'),
  suburb: text('suburb'),
  city: text('city'),
  region: text('region'),
  postcode: text('postcode'),
  country: text('country'),
  // Normalized contact fields
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  // Keep JSONB for flexible extras
  contactExtras: jsonb('contact_extras'), // Social links, secondary channels
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
});

// Projects table - core fields as columns, metadata in JSONB
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }), // Project code
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Labels, custom forms, per customer extras
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
});

// Service categories table - core fields as columns, metadata in JSONB
export const serviceCategories = pgTable('service_categories', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }), // Category code
  description: text('description'),
  ordering: integer('ordering').notNull().default(0), // Display order
  isVisible: boolean('is_visible').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Per customer fields only
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate cards table - core fields as columns, metadata in JSONB
export const rateCards = pgTable('rate_cards', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 20 }).notNull().default('1.0'),
  description: text('description'),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  effectiveFrom: date('effective_from').notNull(),
  effectiveUntil: date('effective_until'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Display settings or partner specific notes
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate card items table - core fields as columns, metadata in JSONB
export const rateCardItems = pgTable('rate_card_items', {
  id: text('id').primaryKey(),
  rateCardId: text('rate_card_id').notNull().references(() => rateCards.id, { onDelete: 'cascade' }),
  serviceCategoryId: text('service_category_id').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  roleId: text('role_id').references(() => roles.id, { onDelete: 'set null' }),
  itemCode: varchar('item_code', { length: 50 }), // Item code/SKU
  unit: varchar('unit', { length: 20 }).notNull().default('hour'), // hour, day, item, etc.
  baseRate: decimal('base_rate', { precision: 15, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  taxClass: varchar('tax_class', { length: 20 }).notNull().default('standard'), // Tax classification
  tieringModelId: text('tiering_model_id'), // Reference to tiering model
  effectiveFrom: date('effective_from').notNull(),
  effectiveUntil: date('effective_until'),
  isActive: boolean('is_active').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Rare exceptions or display hints
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Quotes table - core fields as columns, metadata in JSONB
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  quoteNumber: varchar('quote_number', { length: 50 }).notNull(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  type: varchar('type', { length: 50 }).notNull().default('project'),
  validFrom: date('valid_from').notNull(),
  validUntil: date('valid_until').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 6 }).notNull().default('1.000000'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.1500'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountType: varchar('discount_type', { length: 20 }).notNull().default('percentage'),
  discountValue: decimal('discount_value', { precision: 10, scale: 4 }).notNull().default('0.0000'),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  termsConditions: text('terms_conditions'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { mode: 'date', precision: 3 }),
  sentAt: timestamp('sent_at', { mode: 'date', precision: 3 }),
  acceptedAt: timestamp('accepted_at', { mode: 'date', precision: 3 }),
  expiresAt: timestamp('expires_at', { mode: 'date', precision: 3 }),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Customer specific extra fields
  // Note: currentVersionId will be managed at the application level to avoid circular references
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
}, (table) => ({
  quoteNumberOrgUnique: uniqueIndex('quotes_quote_number_organization_id_unique').on(table.quoteNumber, table.organizationId),
}));

// Quote line items table - core fields as columns, metadata in JSONB
export const quoteLineItems = pgTable('quote_line_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  lineNumber: integer('line_number').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('service'),
  sku: varchar('sku', { length: 50 }), // SKU/code
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1.0000'),
  unitPrice: decimal('unit_price', { precision: 15, scale: 4 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 15, scale: 4 }),
  unit: varchar('unit', { length: 50 }).notNull().default('hour'), // New field
  taxInclusive: boolean('tax_inclusive').notNull().default(false), // New field
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.1500'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountType: varchar('discount_type', { length: 20 }).notNull().default('percentage'),
  discountValue: decimal('discount_value', { precision: 10, scale: 4 }).notNull().default('0.0000'),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  serviceCategoryId: text('service_category_id').references(() => serviceCategories.id, { onDelete: 'set null' }),
  rateCardId: text('rate_card_id').references(() => rateCards.id, { onDelete: 'set null' }),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Rare extras only
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Idempotency keys table for safe and repeatable writes
export const idempotencyKeys = pgTable('idempotency_keys', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  route: varchar('route', { length: 255 }).notNull(),
  requestHash: text('request_hash').notNull(),
  responseStatus: integer('response_status').notNull(),
  responseBody: jsonb('response_body').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date', precision: 3 }).notNull(),
}, (table) => ({
  idempotencyUnique: uniqueIndex('idempotency_keys_org_user_route_hash_unique').on(table.organizationId, table.userId, table.route, table.requestHash),
}));

// Quote versions table for versioning support
export const quoteVersions = pgTable('quote_versions', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  validFrom: date('valid_from').notNull(),
  validUntil: date('valid_until').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 6 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull(),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 4 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  termsConditions: text('terms_conditions'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { mode: 'date', precision: 3 }),
  sentAt: timestamp('sent_at', { mode: 'date', precision: 3 }),
  acceptedAt: timestamp('accepted_at', { mode: 'date', precision: 3 }),
  expiresAt: timestamp('expires_at', { mode: 'date', precision: 3 }),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  versionUnique: uniqueIndex('quote_versions_quote_version_unique').on(table.quoteId, table.versionNumber),
}));

// Quote line item versions table
export const quoteLineItemVersions = pgTable('quote_line_item_versions', {
  id: text('id').primaryKey(),
  quoteVersionId: text('quote_version_id').notNull().references(() => quoteVersions.id, { onDelete: 'cascade' }),
  lineNumber: integer('line_number').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  sku: varchar('sku', { length: 50 }),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 4 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 15, scale: 4 }),
  unit: varchar('unit', { length: 50 }).notNull(),
  taxInclusive: boolean('tax_inclusive').notNull().default(false),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull(),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 4 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  serviceCategoryId: text('service_category_id').references(() => serviceCategories.id, { onDelete: 'set null' }),
  rateCardId: text('rate_card_id').references(() => rateCards.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  lineNumberUnique: uniqueIndex('quote_line_item_versions_version_line_unique').on(table.quoteVersionId, table.lineNumber),
}));

// Audit logs table - proper envelope columns plus JSONB for values
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: text('entity_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  actorId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  requestId: text('request_id'), // For request tracing
  ipAddress: inet('ip_address'), // Proper IP address type
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  // Keep JSONB for old/new values
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Approval requests table - typed columns for all state, JSONB only for optional notes
export const approvalRequests = pgTable('approval_requests', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'quote', 'invoice', 'project'
  entityId: text('entity_id').notNull(),
  requestedBy: text('requested_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approverId: text('approver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected', 'cancelled'
  requestedAt: timestamp('requested_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { mode: 'date', precision: 3 }),
  reason: text('reason'), // Optional reason for approval/rejection
  // JSONB only for optional notes
  notes: jsonb('notes').notNull().default('{}'), // Optional notes, never state
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  entityUnique: uniqueIndex('approval_requests_entity_unique').on(table.entityType, table.entityId),
  approverStatusIndex: uniqueIndex('idx_approval_requests_approver_status').on(table.approverId, table.status),
  organizationStatusIndex: uniqueIndex('idx_approval_requests_org_status').on(table.organizationId, table.status),
}));

// Invoices table - typed columns for all monetary values
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  quoteId: text('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  // Typed monetary columns - no totals in JSONB
  currency: varchar('currency', { length: 3 }).notNull().default('NZD').references(() => currencies.code),
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
  fxRateId: text('fx_rate_id').references(() => fxRates.id, { onDelete: 'set null' }),
  // Normalized fields
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  termsConditions: text('terms_conditions'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  // JSONB only for optional metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Optional display notes, never totals
  // Audit fields
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { mode: 'date', precision: 3 }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
}, (table) => ({
  invoiceNumberUnique: uniqueIndex('invoices_invoice_number_organization_unique').on(table.invoiceNumber, table.organizationId),
  statusIndex: uniqueIndex('idx_invoices_status').on(table.status),
  currencyIndex: uniqueIndex('idx_invoices_currency').on(table.currency),
}));

// Invoice line items table
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  // Typed monetary columns
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1.0000'),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull().default('0.00'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  // Normalized fields
  description: text('description').notNull(),
  unit: varchar('unit', { length: 20 }).notNull().default('hour'),
  serviceCategoryId: text('service_category_id').references(() => serviceCategories.id, { onDelete: 'set null' }),
  rateCardId: text('rate_card_id').references(() => rateCards.id, { onDelete: 'set null' }),
  // JSONB only for optional metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Optional display notes, never totals
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Payments table - typed columns for all monetary values
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  // Typed monetary columns
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().references(() => currencies.code),
  // Payment details
  method: varchar('method', { length: 50 }).notNull(), // bank_transfer, credit_card, cash, etc.
  reference: varchar('reference', { length: 100 }), // Bank reference, transaction ID, etc.
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, completed, void, failed
  // Dates
  paidAt: timestamp('paid_at', { mode: 'date', precision: 3 }).notNull(),
  voidedAt: timestamp('voided_at', { mode: 'date', precision: 3 }),
  // Idempotency
  idempotencyKey: text('idempotency_key').references(() => idempotencyKeys.id, { onDelete: 'set null' }),
  // JSONB only for optional gateway payloads
  gatewayPayload: jsonb('gateway_payload'), // Optional opaque gateway response data
  // Audit fields
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voidedBy: text('voided_by').references(() => users.id, { onDelete: 'set null' }),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  invoiceIdIndex: uniqueIndex('idx_payments_invoice_id').on(table.invoiceId),
  idempotencyKeyIndex: uniqueIndex('idx_payments_idempotency_key').on(table.idempotencyKey),
  statusIndex: uniqueIndex('idx_payments_status').on(table.status),
}));

// Organization settings key-value table with JSONB value
export const orgSettings = pgTable('org_settings', {
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(), // Flexible value storage
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgKeyUnique: uniqueIndex('org_settings_org_key_unique').on(table.orgId, table.key),
}));

// Resource allocations table - core planning fields as typed columns, notes in JSONB
export const resourceAllocations = pgTable('resource_allocations', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 100 }).notNull(), // Developer, Designer, Project Manager, etc.
  allocationPercent: decimal('allocation_percent', { precision: 5, scale: 2 }).notNull(), // 0.00 to 100.00
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isBillable: boolean('is_billable').notNull().default(true),
  // Keep JSONB only for optional notes and metadata
  notes: jsonb('notes').notNull().default('{}'), // Optional notes about the allocation
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
}, (table) => ({
  // Ensure no overlapping allocations for the same user
  userDateOverlap: uniqueIndex('resource_allocations_user_date_overlap').on(
    table.userId, 
    table.startDate, 
    table.endDate
  ),
  // Index for efficient project queries
  projectUser: uniqueIndex('resource_allocations_project_user').on(
    table.projectId, 
    table.userId, 
    table.startDate
  ),
  // Index for capacity calculations
  userDateRange: uniqueIndex('resource_allocations_user_date_range').on(
    table.userId, 
    table.startDate, 
    table.endDate
  ),
}));

// Export jobs table - async export job metadata and status
export const exportJobs = pgTable('export_jobs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportType: varchar('report_type', { length: 50 }).notNull(),
  format: varchar('format', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  filters: jsonb('filters').notNull().default('{}'),
  fileName: text('file_name').notNull(),
  totalRows: integer('total_rows'),
  processedRows: integer('processed_rows').notNull().default(0),
  downloadUrl: text('download_url'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { mode: 'date', precision: 3 }),
  completedAt: timestamp('completed_at', { mode: 'date', precision: 3 }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  organizationIdIdx: index('export_jobs_organization_id_idx').on(table.organizationId),
  userIdIdx: index('export_jobs_user_id_idx').on(table.userId),
  statusIdx: index('export_jobs_status_idx').on(table.status),
  reportTypeIdx: index('export_jobs_report_type_idx').on(table.reportType),
  createdAtIdx: index('export_jobs_created_at_idx').on(table.createdAt),
  userStatusIdx: index('export_jobs_user_status_idx').on(table.userId, table.status),
  orgStatusIdx: index('export_jobs_org_status_idx').on(table.organizationId, table.status),
}));

// Relations
export const currenciesRelations = relations(currencies, ({ many }) => ({
  organizations: many(organizations),
  rateCards: many(rateCards),
  rateCardItems: many(rateCardItems),
  quotes: many(quotes),
  invoices: many(invoices),
  payments: many(payments),
  baseFxRates: many(fxRates, { relationName: 'baseCurrency' }),
  quoteFxRates: many(fxRates, { relationName: 'quoteCurrency' }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  defaultCurrency: one(currencies, {
    fields: [organizations.currency],
    references: [currencies.code],
  }),
  users: many(users),
  roles: many(roles),
  userRoles: many(userRoles),
  customers: many(customers),
  projects: many(projects),
  serviceCategories: many(serviceCategories),
  rateCards: many(rateCards),
  quotes: many(quotes),
  auditLogs: many(auditLogs),
  approvalRequests: many(approvalRequests),
  policyOverrides: many(policyOverrides),
  securityPolicies: many(orgSecurityPolicies),
  featureFlags: many(orgFeatureFlags),
  notificationPrefs: many(orgNotificationPrefs),
  settings: many(orgSettings),
  resourceAllocations: many(resourceAllocations),
  exportJobs: many(exportJobs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [users.customerId],
    references: [customers.id],
  }),
  userRoles: many(userRoles),
  assignedRoles: many(userRoles, { relationName: 'assignedBy' }),
  createdQuotes: many(quotes, { relationName: 'createdBy' }),
  approvedQuotes: many(quotes, { relationName: 'approvedBy' }),
  ownedProjects: many(projects, { relationName: 'owner' }),
  auditLogs: many(auditLogs, { relationName: 'actor' }),
  requestedApprovals: many(approvalRequests, { relationName: 'requestedBy' }),
  approverApprovals: many(approvalRequests, { relationName: 'approver' }),
  resourceAllocations: many(resourceAllocations),
  exportJobs: many(exportJobs),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
  rateCardItems: many(rateCardItems),
  policyOverrides: many(policyOverrides),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
  assignedBy: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

export const policyOverridesRelations = relations(policyOverrides, ({ one }) => ({
  organization: one(organizations, {
    fields: [policyOverrides.organizationId],
    references: [organizations.id],
  }),
  role: one(roles, {
    fields: [policyOverrides.roleId],
    references: [roles.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  quotes: many(quotes),
  portalUsers: many(users), // External customer users for portal access
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  quotes: many(quotes),
  resourceAllocations: many(resourceAllocations),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [serviceCategories.organizationId],
    references: [organizations.id],
  }),
  rateCardItems: many(rateCardItems),
  quoteLineItems: many(quoteLineItems),
}));

export const rateCardsRelations = relations(rateCards, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [rateCards.organizationId],
    references: [organizations.id],
  }),
  currency: one(currencies, {
    fields: [rateCards.currency],
    references: [currencies.code],
  }),
  rateCardItems: many(rateCardItems),
  quoteLineItems: many(quoteLineItems),
}));

export const rateCardItemsRelations = relations(rateCardItems, ({ one }) => ({
  rateCard: one(rateCards, {
    fields: [rateCardItems.rateCardId],
    references: [rateCards.id],
  }),
  serviceCategory: one(serviceCategories, {
    fields: [rateCardItems.serviceCategoryId],
    references: [serviceCategories.id],
  }),
  role: one(roles, {
    fields: [rateCardItems.roleId],
    references: [roles.id],
  }),
  currency: one(currencies, {
    fields: [rateCardItems.currency],
    references: [currencies.code],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [quotes.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [quotes.projectId],
    references: [projects.id],
  }),
  currency: one(currencies, {
    fields: [quotes.currency],
    references: [currencies.code],
  }),
  createdBy: one(users, {
    fields: [quotes.createdBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [quotes.approvedBy],
    references: [users.id],
  }),
  lineItems: many(quoteLineItems),
  versions: many(quoteVersions),
}));

export const quoteLineItemsRelations = relations(quoteLineItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLineItems.quoteId],
    references: [quotes.id],
  }),
  serviceCategory: one(serviceCategories, {
    fields: [quoteLineItems.serviceCategoryId],
    references: [serviceCategories.id],
  }),
  rateCard: one(rateCards, {
    fields: [quoteLineItems.rateCardId],
    references: [rateCards.id],
  }),
}));

// Relations for new API hardening tables
export const idempotencyKeysRelations = relations(idempotencyKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [idempotencyKeys.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [idempotencyKeys.userId],
    references: [users.id],
  }),
}));

export const quoteVersionsRelations = relations(quoteVersions, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [quoteVersions.quoteId],
    references: [quotes.id],
  }),
  organization: one(organizations, {
    fields: [quoteVersions.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [quoteVersions.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [quoteVersions.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [quoteVersions.createdBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [quoteVersions.approvedBy],
    references: [users.id],
  }),
  lineItems: many(quoteLineItemVersions),
}));

export const quoteLineItemVersionsRelations = relations(quoteLineItemVersions, ({ one }) => ({
  quoteVersion: one(quoteVersions, {
    fields: [quoteLineItemVersions.quoteVersionId],
    references: [quoteVersions.id],
  }),
  serviceCategory: one(serviceCategories, {
    fields: [quoteLineItemVersions.serviceCategoryId],
    references: [serviceCategories.id],
  }),
  rateCard: one(rateCards, {
    fields: [quoteLineItemVersions.rateCardId],
    references: [rateCards.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// Approval requests relations
export const approvalRequestsRelations = relations(approvalRequests, ({ one }) => ({
  organization: one(organizations, {
    fields: [approvalRequests.organizationId],
    references: [organizations.id],
  }),
  requestedBy: one(users, {
    fields: [approvalRequests.requestedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [approvalRequests.approverId],
    references: [users.id],
  }),
}));

// Invoice relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  quote: one(quotes, {
    fields: [invoices.quoteId],
    references: [quotes.id],
  }),
  currency: one(currencies, {
    fields: [invoices.currency],
    references: [currencies.code],
  }),
  fxRate: one(fxRates, {
    fields: [invoices.fxRateId],
    references: [fxRates.id],
  }),
  createdBy: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [invoices.approvedBy],
    references: [users.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

// Invoice line items relations
export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  serviceCategory: one(serviceCategories, {
    fields: [invoiceLineItems.serviceCategoryId],
    references: [serviceCategories.id],
  }),
  rateCard: one(rateCards, {
    fields: [invoiceLineItems.rateCardId],
    references: [rateCards.id],
  }),
}));

// Payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organizationId],
    references: [organizations.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  currency: one(currencies, {
    fields: [payments.currency],
    references: [currencies.code],
  }),
  idempotencyKey: one(idempotencyKeys, {
    fields: [payments.idempotencyKey],
    references: [idempotencyKeys.id],
  }),
  createdBy: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
  voidedBy: one(users, {
    fields: [payments.voidedBy],
    references: [users.id],
  }),
}));

// FX Rates relations
export const fxRatesRelations = relations(fxRates, ({ one }) => ({
  baseCurrency: one(currencies, {
    fields: [fxRates.baseCurrency],
    references: [currencies.code],
    relationName: 'baseCurrency',
  }),
  quoteCurrency: one(currencies, {
    fields: [fxRates.quoteCurrency],
    references: [currencies.code],
    relationName: 'quoteCurrency',
  }),
}));

// Resource allocations relations
export const resourceAllocationsRelations = relations(resourceAllocations, ({ one }) => ({
  organization: one(organizations, {
    fields: [resourceAllocations.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [resourceAllocations.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [resourceAllocations.userId],
    references: [users.id],
  }),
}));

// Export jobs relations
export const exportJobsRelations = relations(exportJobs, ({ one }) => ({
  organization: one(organizations, {
    fields: [exportJobs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [exportJobs.userId],
    references: [users.id],
  }),
}));

// Types for TypeScript
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
export type FxRate = typeof fxRates.$inferSelect;
export type NewFxRate = typeof fxRates.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type PolicyOverride = typeof policyOverrides.$inferSelect;
export type NewPolicyOverride = typeof policyOverrides.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type RateCard = typeof rateCards.$inferSelect;
export type NewRateCard = typeof rateCards.$inferInsert;
export type RateCardItem = typeof rateCardItems.$inferSelect;
export type NewRateCardItem = typeof rateCardItems.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type NewQuoteLineItem = typeof quoteLineItems.$inferInsert;
export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKey = typeof idempotencyKeys.$inferInsert;
export type QuoteVersion = typeof quoteVersions.$inferSelect;
export type NewQuoteVersion = typeof quoteVersions.$inferInsert;
export type QuoteLineItemVersion = typeof quoteLineItemVersions.$inferSelect;
export type NewQuoteLineItemVersion = typeof quoteLineItemVersions.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type OrgSecurityPolicy = typeof orgSecurityPolicies.$inferSelect;
export type NewOrgSecurityPolicy = typeof orgSecurityPolicies.$inferInsert;
export type OrgFeatureFlag = typeof orgFeatureFlags.$inferSelect;
export type NewOrgFeatureFlag = typeof orgFeatureFlags.$inferInsert;
export type OrgNotificationPref = typeof orgNotificationPrefs.$inferSelect;
export type NewOrgNotificationPref = typeof orgNotificationPrefs.$inferInsert;
export type OrgSetting = typeof orgSettings.$inferSelect;
export type NewOrgSetting = typeof orgSettings.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type NewApprovalRequest = typeof approvalRequests.$inferInsert;
export type ResourceAllocation = typeof resourceAllocations.$inferSelect;
export type NewResourceAllocation = typeof resourceAllocations.$inferInsert;
export type ExportJob = typeof exportJobs.$inferSelect;
export type NewExportJob = typeof exportJobs.$inferInsert;
