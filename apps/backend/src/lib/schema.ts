import { pgTable, text, timestamp, boolean, jsonb, integer, varchar, decimal, date, uniqueIndex, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Currencies table - ISO 4217 currency codes for validation
export const currencies = pgTable('currencies', {
  code: varchar('code', { length: 3 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

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
  contactExtras: jsonb('contactExtras'), // Social links, secondary channels
  settings: jsonb('settings').notNull().default('{}'), // Feature-specific payloads
  subscriptionPlan: varchar('subscriptionPlan', { length: 50 }).notNull().default('basic'),
  subscriptionStatus: varchar('subscriptionStatus', { length: 20 }).notNull().default('active'),
  trialEndsAt: timestamp('trialEndsAt', { mode: 'date', precision: 3 }),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Organization security policies table
export const orgSecurityPolicies = pgTable('org_security_policies', {
  id: text('id').primaryKey(),
  orgId: text('orgId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  minPasswordLength: integer('minPasswordLength').notNull().default(12),
  mfaRequired: boolean('mfaRequired').notNull().default(true),
  sessionTimeoutMinutes: integer('sessionTimeoutMinutes').notNull().default(60),
  maxLoginAttempts: integer('maxLoginAttempts').notNull().default(5),
  passwordExpiryDays: integer('passwordExpiryDays'),
  extras: jsonb('extras'), // Flexible additional security settings
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgUnique: uniqueIndex('org_security_policies_org_unique').on(table.orgId),
}));

// Organization feature flags table
export const orgFeatureFlags = pgTable('org_feature_flags', {
  orgId: text('orgId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  flagKey: text('flagKey').notNull(),
  isEnabled: boolean('isEnabled').notNull().default(false),
  payload: jsonb('payload'), // Feature-specific configuration
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgFlagUnique: uniqueIndex('org_feature_flags_org_flag_unique').on(table.orgId, table.flagKey),
}));

// Organization notification preferences table
export const orgNotificationPrefs = pgTable('org_notification_prefs', {
  orgId: text('orgId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 20 }).notNull(), // email, sms, push
  isEnabled: boolean('isEnabled').notNull().default(true),
  settings: jsonb('settings'), // Channel-specific notification settings
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgChannelUnique: uniqueIndex('org_notification_prefs_org_channel_unique').on(table.orgId, table.channel),
}));

// Users table - normalized preferences, keep metadata in JSONB
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique(),
  firstName: varchar('firstName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }).notNull(),
  displayName: varchar('displayName', { length: 200 }),
  avatarUrl: text('avatarUrl'),
  phone: varchar('phone', { length: 20 }),
  // Normalized preference fields
  timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
  locale: varchar('locale', { length: 10 }).notNull().default('en-NZ'),
  dateFormat: varchar('dateFormat', { length: 20 }).notNull().default('DD MMM YYYY'),
  timeFormat: varchar('timeFormat', { length: 10 }).notNull().default('24h'),
  // Keep JSONB for flexible preferences
  preferences: jsonb('preferences').notNull().default('{}'), // Dashboard layout, UI tweaks
  metadata: jsonb('metadata').notNull().default('{}'), // Custom fields per customer
  status: varchar('status', { length: 20 }).notNull().default('active'),
  emailVerified: boolean('emailVerified').notNull().default(false),
  emailVerifiedAt: timestamp('emailVerifiedAt', { mode: 'date', precision: 3 }),
  lastLoginAt: timestamp('lastLoginAt', { mode: 'date', precision: 3 }),
  loginCount: integer('loginCount').notNull().default(0),
  failedLoginAttempts: integer('failedLoginAttempts').notNull().default(0),
  lockedUntil: timestamp('lockedUntil', { mode: 'date', precision: 3 }),
  passwordHash: varchar('passwordHash', { length: 255 }),
  mfaEnabled: boolean('mfaEnabled').notNull().default(false),
  mfaSecret: varchar('mfaSecret', { length: 255 }),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  actionResourceUnique: uniqueIndex('permissions_action_resource_unique').on(table.action, table.resource),
}));

// Roles table
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isSystem: boolean('isSystem').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgNameUnique: uniqueIndex('roles_organization_name_unique').on(table.organizationId, table.name),
}));

// Role permissions junction table
export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permissionId').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  rolePermissionUnique: uniqueIndex('role_permissions_role_permission_unique').on(table.roleId, table.permissionId),
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
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  assignedBy: text('assignedBy').references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assignedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  expiresAt: timestamp('expiresAt', { mode: 'date', precision: 3 }),
  isActive: boolean('isActive').notNull().default(true),
});

// Customers table - normalized address and contact info
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerNumber: varchar('customerNumber', { length: 50 }).notNull().unique(),
  companyName: varchar('companyName', { length: 255 }).notNull(),
  legalName: varchar('legalName', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  website: text('website'),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  customerType: varchar('customerType', { length: 50 }).notNull().default('business'),
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
  contactExtras: jsonb('contactExtras'), // Social links, secondary channels
  billingInfo: jsonb('billingInfo'), // Flexible billing configuration
  preferences: jsonb('preferences').notNull().default('{}'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Projects table - core fields as columns, metadata in JSONB
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }), // Project code
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  ownerId: text('ownerId').references(() => users.id, { onDelete: 'set null' }),
  startDate: date('startDate'),
  endDate: date('endDate'),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Labels, custom forms, per customer extras
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Service categories table - core fields as columns, metadata in JSONB
export const serviceCategories = pgTable('service_categories', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }), // Category code
  description: text('description'),
  ordering: integer('ordering').notNull().default(0), // Display order
  isVisible: boolean('isVisible').notNull().default(true),
  isActive: boolean('isActive').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Per customer fields only
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate cards table - core fields as columns, metadata in JSONB
export const rateCards = pgTable('rate_cards', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 20 }).notNull().default('1.0'),
  description: text('description'),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  effectiveFrom: date('effectiveFrom').notNull(),
  effectiveUntil: date('effectiveUntil'),
  isDefault: boolean('isDefault').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Display settings or partner specific notes
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate card items table - core fields as columns, metadata in JSONB
export const rateCardItems = pgTable('rate_card_items', {
  id: text('id').primaryKey(),
  rateCardId: text('rateCardId').notNull().references(() => rateCards.id, { onDelete: 'cascade' }),
  serviceCategoryId: text('serviceCategoryId').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  roleId: text('roleId').references(() => roles.id, { onDelete: 'set null' }),
  itemCode: varchar('itemCode', { length: 50 }), // Item code/SKU
  unit: varchar('unit', { length: 20 }).notNull().default('hour'), // hour, day, item, etc.
  baseRate: decimal('baseRate', { precision: 15, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  taxClass: varchar('taxClass', { length: 20 }).notNull().default('standard'), // Tax classification
  tieringModelId: text('tieringModelId'), // Reference to tiering model
  effectiveFrom: date('effectiveFrom').notNull(),
  effectiveUntil: date('effectiveUntil'),
  isActive: boolean('isActive').notNull().default(true),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Rare exceptions or display hints
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Quotes table - core fields as columns, metadata in JSONB
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  quoteNumber: varchar('quoteNumber', { length: 50 }).notNull(),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  projectId: text('projectId').references(() => projects.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  type: varchar('type', { length: 50 }).notNull().default('project'),
  validFrom: date('validFrom').notNull(),
  validUntil: date('validUntil').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  exchangeRate: decimal('exchangeRate', { precision: 10, scale: 6 }).notNull().default('1.000000'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxRate: decimal('taxRate', { precision: 5, scale: 4 }).notNull().default('0.1500'),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountType: varchar('discountType', { length: 20 }).notNull().default('percentage'),
  discountValue: decimal('discountValue', { precision: 10, scale: 4 }).notNull().default('0.0000'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  termsConditions: text('termsConditions'),
  notes: text('notes'),
  internalNotes: text('internalNotes'),
  createdBy: text('createdBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approvedBy: text('approvedBy').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approvedAt', { mode: 'date', precision: 3 }),
  sentAt: timestamp('sentAt', { mode: 'date', precision: 3 }),
  acceptedAt: timestamp('acceptedAt', { mode: 'date', precision: 3 }),
  expiresAt: timestamp('expiresAt', { mode: 'date', precision: 3 }),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Customer specific extra fields
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
}, (table) => ({
  quoteNumberOrgUnique: uniqueIndex('quotes_quoteNumber_organizationId_unique').on(table.quoteNumber, table.organizationId),
}));

// Quote line items table - core fields as columns, metadata in JSONB
export const quoteLineItems = pgTable('quote_line_items', {
  id: text('id').primaryKey(),
  quoteId: text('quoteId').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  lineNumber: integer('lineNumber').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('service'),
  sku: varchar('sku', { length: 50 }), // SKU/code
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1.0000'),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 4 }).notNull(),
  unitCost: decimal('unitCost', { precision: 15, scale: 4 }),
  taxRate: decimal('taxRate', { precision: 5, scale: 4 }).notNull().default('0.1500'),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  discountType: varchar('discountType', { length: 20 }).notNull().default('percentage'),
  discountValue: decimal('discountValue', { precision: 10, scale: 4 }).notNull().default('0.0000'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  serviceCategoryId: text('serviceCategoryId').references(() => serviceCategories.id, { onDelete: 'set null' }),
  rateCardId: text('rateCardId').references(() => rateCards.id, { onDelete: 'set null' }),
  // Keep JSONB for flexible metadata
  metadata: jsonb('metadata').notNull().default('{}'), // Rare extras only
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Audit logs table - proper envelope columns plus JSONB for values
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  entityType: varchar('entityType', { length: 100 }).notNull(),
  entityId: text('entityId').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  actorId: text('actorId').references(() => users.id, { onDelete: 'set null' }),
  requestId: text('requestId'), // For request tracing
  ipAddress: inet('ipAddress'), // Proper IP address type
  userAgent: text('userAgent'),
  sessionId: varchar('sessionId', { length: 255 }),
  // Keep JSONB for old/new values
  oldValues: jsonb('oldValues'),
  newValues: jsonb('newValues'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Organization settings key-value table with JSONB value
export const orgSettings = pgTable('org_settings', {
  orgId: text('orgId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(), // Flexible value storage
  description: text('description'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
}, (table) => ({
  orgKeyUnique: uniqueIndex('org_settings_org_key_unique').on(table.orgId, table.key),
}));

// Relations
export const currenciesRelations = relations(currencies, ({ many }) => ({
  organizations: many(organizations),
  rateCards: many(rateCards),
  rateCardItems: many(rateCardItems),
  quotes: many(quotes),
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
  policyOverrides: many(policyOverrides),
  securityPolicies: many(orgSecurityPolicies),
  featureFlags: many(orgFeatureFlags),
  notificationPrefs: many(orgNotificationPrefs),
  settings: many(orgSettings),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  assignedRoles: many(userRoles, { relationName: 'assignedBy' }),
  createdQuotes: many(quotes, { relationName: 'createdBy' }),
  approvedQuotes: many(quotes, { relationName: 'approvedBy' }),
  ownedProjects: many(projects, { relationName: 'owner' }),
  auditLogs: many(auditLogs, { relationName: 'actor' }),
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

// Types for TypeScript
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
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
