import { pgTable, text, timestamp, boolean, jsonb, integer, varchar } from 'drizzle-orm/pg-core';
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
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  assignedRoles: many(userRoles, { relationName: 'assignedBy' }),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
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
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
