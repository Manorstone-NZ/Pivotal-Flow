import { pgTable, text, timestamp, boolean, jsonb, integer, varchar, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Organizations table
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
  address: jsonb('address'),
  contactInfo: jsonb('contactInfo'),
  settings: jsonb('settings').notNull().default('{}'),
  subscriptionPlan: varchar('subscriptionPlan', { length: 50 }).notNull().default('basic'),
  subscriptionStatus: varchar('subscriptionStatus', { length: 20 }).notNull().default('active'),
  trialEndsAt: timestamp('trialEndsAt', { mode: 'date', precision: 3 }),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Users table
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
  timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
  locale: varchar('locale', { length: 10 }).notNull().default('en-US'),
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
  preferences: jsonb('preferences').notNull().default('{}'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Roles table
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  permissions: jsonb('permissions').notNull().default('[]'),
  isSystem: boolean('isSystem').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

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

// Customers table (for quotes)
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: jsonb('address'),
  contactInfo: jsonb('contactInfo'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Projects table (for quotes)
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Service categories table (for rate cards)
export const serviceCategories = pgTable('service_categories', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('isActive').notNull().default(true),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate cards table
export const rateCards = pgTable('rate_cards', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  effectiveFrom: date('effectiveFrom').notNull(),
  effectiveUntil: date('effectiveUntil'),
  isDefault: boolean('isDefault').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Rate card items table
export const rateCardItems = pgTable('rate_card_items', {
  id: text('id').primaryKey(),
  rateCardId: text('rateCardId').notNull().references(() => rateCards.id, { onDelete: 'cascade' }),
  serviceCategoryId: text('serviceCategoryId').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  roleId: text('roleId').references(() => roles.id, { onDelete: 'set null' }),
  baseRate: decimal('baseRate', { precision: 15, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NZD'),
  effectiveFrom: date('effectiveFrom').notNull(),
  effectiveUntil: date('effectiveUntil'),
  isActive: boolean('isActive').notNull().default(true),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Quotes table
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  quoteNumber: varchar('quoteNumber', { length: 50 }).notNull().unique(),
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
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date', precision: 3 }),
});

// Quote line items table
export const quoteLineItems = pgTable('quote_line_items', {
  id: text('id').primaryKey(),
  quoteId: text('quoteId').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  lineNumber: integer('lineNumber').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('service'),
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
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entityType', { length: 100 }).notNull(),
  entityId: text('entityId').notNull(),
  oldValues: jsonb('oldValues'),
  newValues: jsonb('newValues'),
  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: text('userAgent'),
  sessionId: varchar('sessionId', { length: 255 }),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  roles: many(roles),
  userRoles: many(userRoles),
  customers: many(customers),
  projects: many(projects),
  serviceCategories: many(serviceCategories),
  rateCards: many(rateCards),
  quotes: many(quotes),
  auditLogs: many(auditLogs),
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
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  rateCardItems: many(rateCardItems),
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
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
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
