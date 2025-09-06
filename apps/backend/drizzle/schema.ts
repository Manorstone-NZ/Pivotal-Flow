import { sql } from "drizzle-orm"
import { pgTable, varchar, timestamp, text, integer, index, numeric, jsonb, uniqueIndex, foreignKey, unique, check, boolean, inet, date, primaryKey } from "drizzle-orm/pg-core"



export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const quoteLineItems = pgTable("quote_line_items", {
	id: text().primaryKey().notNull(),
	quoteId: text("quote_id").notNull(),
	lineNumber: integer("line_number").notNull(),
	type: varchar({ length: 50 }).default('service').notNull(),
	description: text().notNull(),
	quantity: numeric({ precision: 10, scale:  4 }).default('1.0000').notNull(),
	unitPrice: numeric("unit_price", { precision: 15, scale:  4 }).notNull(),
	unitCost: numeric("unit_cost", { precision: 15, scale:  4 }),
	taxRate: numeric("tax_rate", { precision: 5, scale:  4 }).default('0.1500').notNull(),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }).default('0.00').notNull(),
	discountType: varchar("discount_type", { length: 20 }).default('percentage').notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  4 }).default('0.0000').notNull(),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }).default('0.00').notNull(),
	subtotal: numeric({ precision: 15, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	serviceCategoryId: text("service_category_id"),
	rateCardId: text("rate_card_id"),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	sku: varchar({ length: 50 }),
}, (table): any[] => [
	index("idx_quote_line_items_sku").using("btree", table.sku.asc().nullsLast().op("text_ops")),
]);

export const policyOverrides = pgTable("policy_overrides", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	roleId: text("role_id"),
	resource: varchar({ length: 100 }).notNull(),
	policy: jsonb().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	action: varchar({ length: 100 }).default('all').notNull(),
}, (table): any[] => [
	index("idx_policy_overrides_org_role").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.roleId.asc().nullsLast().op("text_ops")),
	index("idx_policy_overrides_policy").using("gin", table.policy.asc().nullsLast().op("jsonb_path_ops")),
	index("idx_policy_overrides_policy_gin").using("gin", table.policy.asc().nullsLast().op("jsonb_path_ops")),
	index("idx_policy_overrides_resource").using("btree", table.resource.asc().nullsLast().op("text_ops")),
	uniqueIndex("policy_overrides_org_role_resource_action_unique").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.roleId.asc().nullsLast().op("text_ops"), table.resource.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "policy_overrides_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "policy_overrides_role_id_fkey"
		}).onDelete("cascade"),
	unique("policy_overrides_organization_id_role_id_resource_key").on(table.organizationId, table.roleId, table.resource),
	check("policy_is_object", sql`jsonb_typeof(policy) = 'object'::text`),
]);

export const orgSecurityPolicies = pgTable("org_security_policies", {
	id: text().primaryKey().notNull(),
	orgId: text("org_id").notNull(),
	minPasswordLength: integer("min_password_length").default(12).notNull(),
	mfaRequired: boolean("mfa_required").default(true).notNull(),
	sessionTimeoutMinutes: integer("session_timeout_minutes").default(60).notNull(),
	maxLoginAttempts: integer("max_login_attempts").default(5).notNull(),
	passwordExpiryDays: integer("password_expiry_days"),
	extras: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	uniqueIndex("org_security_policies_org_unique").using("btree", table.orgId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [organizations.id],
			name: "org_security_policies_org_id_fkey"
		}).onDelete("cascade"),
	check("extras_is_object", sql`(extras IS NULL) OR (jsonb_typeof(extras) = 'object'::text)`),
]);

export const customers = pgTable("customers", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	customerNumber: varchar("customer_number", { length: 50 }).notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	legalName: varchar("legal_name", { length: 255 }),
	industry: varchar({ length: 100 }),
	website: text(),
	description: text(),
	status: varchar({ length: 20 }).default('active').notNull(),
	customerType: varchar("customer_type", { length: 50 }).default('business').notNull(),
	source: varchar({ length: 50 }),
	tags: text().array(),
	rating: integer(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3, mode: 'string' }),
	street: text(),
	suburb: text(),
	city: text(),
	region: text(),
	postcode: text(),
	country: text(),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 255 }),
	contactExtras: jsonb("contact_extras"),
}, (table): any[] => [
	uniqueIndex("customers_customer_number_key").using("btree", table.customerNumber.asc().nullsLast().op("text_ops")),
	index("idx_customers_address").using("btree", table.street.asc().nullsLast().op("text_ops"), table.city.asc().nullsLast().op("text_ops"), table.country.asc().nullsLast().op("text_ops")),
	index("idx_customers_contact").using("btree", table.phone.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("idx_customers_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "customers_organization_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	check("customers_phone_format", sql`(phone IS NULL) OR ((phone)::text ~ '^[+]?[0-9\s\-\(\)]+$'::text)`),
	check("customers_email_format", sql`(email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)`),
]);

export const organizations = pgTable("organizations", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	domain: varchar({ length: 255 }),
	industry: varchar({ length: 100 }),
	size: varchar({ length: 50 }),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	taxId: varchar({ length: 100 }),
	address: jsonb(),
	contactInfo: jsonb(),
	settings: jsonb().default({}).notNull(),
	subscriptionPlan: varchar({ length: 50 }).default('basic').notNull(),
	subscriptionStatus: varchar({ length: 20 }).default('active').notNull(),
	trialEndsAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	street: text(),
	suburb: text(),
	city: text(),
	region: text(),
	postcode: text(),
	country: text(),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 255 }),
	website: text(),
	contactExtras: jsonb("contact_extras"),
}, (table): any[] => [
	index("idx_organizations_address").using("btree", table.street.asc().nullsLast().op("text_ops"), table.city.asc().nullsLast().op("text_ops"), table.country.asc().nullsLast().op("text_ops")),
	index("idx_organizations_contact").using("btree", table.phone.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("idx_organizations_domain").using("btree", table.domain.asc().nullsLast().op("text_ops")),
	index("idx_organizations_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("organizations_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	check("organizations_phone_format", sql`(phone IS NULL) OR ((phone)::text ~ '^[+]?[0-9\s\-\(\)]+$'::text)`),
	check("organizations_email_format", sql`(email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)`),
]);

export const serviceCategories = pgTable("service_categories", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	code: varchar({ length: 50 }),
	ordering: integer().default(0).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
}, (table): any[] => [
	index("idx_service_categories_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("idx_service_categories_ordering").using("btree", table.ordering.asc().nullsLast().op("int4_ops")),
]);

export const organizationSettings = pgTable("organization_settings", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: jsonb().notNull(),
	description: text(),
	isSystem: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table): any[] => [
	uniqueIndex("organization_settings_organizationId_category_key_key").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.category.asc().nullsLast().op("text_ops"), table.key.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "organization_settings_organizationId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const roles = pgTable("roles", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	permissions: jsonb().default([]).notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table): any[] => [
	index("idx_roles_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_roles_org_active").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.isActive.asc().nullsLast().op("text_ops")),
	index("idx_roles_org_name").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("roles_organization_id_name_key").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "roles_organization_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userRoles = pgTable("user_roles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	roleId: text("role_id").notNull(),
	organizationId: text("organization_id").notNull(),
	assignedBy: text("assigned_by"),
	assignedAt: timestamp("assigned_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
}, (table): any[] => [
	index("idx_user_roles_org_role_active").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.roleId.asc().nullsLast().op("text_ops"), table.isActive.asc().nullsLast().op("text_ops")),
	index("idx_user_roles_org_user_active").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_roles_user_id_role_id_organization_id_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.roleId.asc().nullsLast().op("text_ops"), table.organizationId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_roles_role_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "user_roles_organization_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "user_roles_assigned_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const auditLogs = pgTable("audit_logs", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar({ length: 100 }).notNull(),
	entityId: text().notNull(),
	oldValues: jsonb(),
	newValues: jsonb(),
	userAgent: text(),
	sessionId: varchar({ length: 255 }),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	requestId: text("request_id"),
	ipAddress: inet("ip_address"),
}, (table): any[] => [
	index("idx_audit_logs_ip").using("btree", table.ipAddress.asc().nullsLast().op("inet_ops")),
	index("idx_audit_logs_org_action").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_audit_logs_org_created").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_audit_logs_org_entity").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_request").using("btree", table.requestId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "audit_logs_organizationId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_userId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	email: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 100 }),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 200 }),
	avatarUrl: text("avatar_url"),
	phone: varchar({ length: 20 }),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	locale: varchar({ length: 10 }).default('en-US').notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	emailVerifiedAt: timestamp("email_verified_at", { precision: 3, mode: 'string' }),
	lastLoginAt: timestamp("last_login_at", { precision: 3, mode: 'string' }),
	loginCount: integer("login_count").default(0).notNull(),
	failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
	lockedUntil: timestamp("locked_until", { precision: 3, mode: 'string' }),
	passwordHash: varchar("password_hash", { length: 255 }),
	mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
	mfaSecret: varchar("mfa_secret", { length: 255 }),
	preferences: jsonb().default({}).notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3, mode: 'string' }),
	dateFormat: varchar("date_format", { length: 20 }).default('DD MMM YYYY').notNull(),
	timeFormat: varchar("time_format", { length: 10 }).default('24h').notNull(),
}, (table): any[] => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_org_created").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_users_org_email").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_org_status_deleted").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops"), table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_users_username").using("btree", table.username.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_organization_id_email_key").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_username_key").using("btree", table.username.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "users_organization_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const rolePermissions = pgTable("role_permissions", {
	id: text().primaryKey().notNull(),
	roleId: text("role_id").notNull(),
	permissionId: text("permission_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table): any[] => [
	index("idx_role_permissions_permission").using("btree", table.permissionId.asc().nullsLast().op("text_ops")),
	index("idx_role_permissions_permission_id").using("btree", table.permissionId.asc().nullsLast().op("text_ops")),
	index("idx_role_permissions_role").using("btree", table.roleId.asc().nullsLast().op("text_ops")),
	index("idx_role_permissions_role_id").using("btree", table.roleId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_fkey"
		}).onDelete("cascade"),
	unique("role_permissions_role_id_permission_id_key").on(table.roleId, table.permissionId),
]);

export const permissions = pgTable("permissions", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).notNull(),
	resource: varchar({ length: 100 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table): any[] => [
	index("idx_permissions_action_resource").using("btree", table.action.asc().nullsLast().op("text_ops"), table.resource.asc().nullsLast().op("text_ops")),
	index("idx_permissions_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	uniqueIndex("permissions_category_resource_action_key").using("btree", table.category.asc().nullsLast().op("text_ops"), table.resource.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops")),
	uniqueIndex("permissions_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }),
	description: text(),
	status: varchar({ length: 50 }).default('active').notNull(),
	ownerId: text("owner_id"),
	startDate: date("start_date"),
	endDate: date("end_date"),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3, mode: 'string' }),
}, (table): any[] => [
	index("idx_projects_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_projects_organization_id").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("idx_projects_owner_id").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	index("idx_projects_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "projects_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "projects_owner_id_fkey"
		}).onDelete("set null"),
]);

export const rateCards = pgTable("rate_cards", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	version: varchar({ length: 20 }).default('1.0').notNull(),
	description: text(),
	currency: varchar({ length: 3 }).default('NZD').notNull(),
	effectiveFrom: date("effective_from").notNull(),
	effectiveUntil: date("effective_until"),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	index("idx_rate_cards_currency").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	index("idx_rate_cards_effective_from").using("btree", table.effectiveFrom.asc().nullsLast().op("date_ops")),
	index("idx_rate_cards_organization_id").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "rate_cards_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.currency],
			foreignColumns: [currencies.code],
			name: "rate_cards_currency_fk"
		}),
]);

export const currencies = pgTable("currencies", {
	code: varchar({ length: 3 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	symbol: varchar({ length: 10 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	index("idx_currencies_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_currencies_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
]);

export const rateCardItems = pgTable("rate_card_items", {
	id: text().primaryKey().notNull(),
	rateCardId: text("rate_card_id").notNull(),
	serviceCategoryId: text("service_category_id").notNull(),
	roleId: text("role_id"),
	itemCode: varchar("item_code", { length: 50 }),
	unit: varchar({ length: 20 }).default('hour').notNull(),
	baseRate: numeric("base_rate", { precision: 15, scale:  4 }).notNull(),
	currency: varchar({ length: 3 }).default('NZD').notNull(),
	taxClass: varchar("tax_class", { length: 20 }).default('standard').notNull(),
	tieringModelId: text("tiering_model_id"),
	effectiveFrom: date("effective_from").notNull(),
	effectiveUntil: date("effective_until"),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	index("idx_rate_card_items_currency").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	index("idx_rate_card_items_rate_card_id").using("btree", table.rateCardId.asc().nullsLast().op("text_ops")),
	index("idx_rate_card_items_service_category_id").using("btree", table.serviceCategoryId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.rateCardId],
			foreignColumns: [rateCards.id],
			name: "rate_card_items_rate_card_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceCategoryId],
			foreignColumns: [serviceCategories.id],
			name: "rate_card_items_service_category_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "rate_card_items_role_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.currency],
			foreignColumns: [currencies.code],
			name: "rate_card_items_currency_fk"
		}),
]);

export const idempotencyKeys = pgTable("idempotency_keys", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	userId: text("user_id").notNull(),
	route: varchar({ length: 255 }).notNull(),
	requestHash: text("request_hash").notNull(),
	responseStatus: integer("response_status").notNull(),
	responseBody: jsonb("response_body").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
}, (table): any[] => [
	index("idx_idempotency_keys_expiry").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_idempotency_keys_lookup").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.route.asc().nullsLast().op("text_ops"), table.requestHash.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "idempotency_keys_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "idempotency_keys_user_id_fkey"
		}).onDelete("cascade"),
	unique("idempotency_keys_organization_id_user_id_route_request_hash_key").on(table.organizationId, table.userId, table.route, table.requestHash),
]);

export const quoteVersions: any = pgTable("quote_versions", {
	id: text().primaryKey().notNull(),
	quoteId: text("quote_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	organizationId: text("organization_id").notNull(),
	customerId: text("customer_id").notNull(),
	projectId: text("project_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	validFrom: date("valid_from").notNull(),
	validUntil: date("valid_until").notNull(),
	currency: varchar({ length: 3 }).notNull(),
	exchangeRate: numeric("exchange_rate", { precision: 10, scale:  6 }).notNull(),
	subtotal: numeric({ precision: 15, scale:  2 }).notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  4 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }).notNull(),
	discountType: varchar("discount_type", { length: 20 }).notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  4 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	termsConditions: text("terms_conditions"),
	notes: text(),
	internalNotes: text("internal_notes"),
	createdBy: text("created_by").notNull(),
	approvedBy: text("approved_by"),
	approvedAt: timestamp("approved_at", { precision: 3, mode: 'string' }),
	sentAt: timestamp("sent_at", { precision: 3, mode: 'string' }),
	acceptedAt: timestamp("accepted_at", { precision: 3, mode: 'string' }),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	index("idx_quote_versions_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_quote_versions_number").using("btree", table.quoteId.asc().nullsLast().op("int4_ops"), table.versionNumber.asc().nullsLast().op("text_ops")),
	index("idx_quote_versions_quote").using("btree", table.quoteId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "quote_versions_quote_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "quote_versions_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "quote_versions_customer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "quote_versions_project_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "quote_versions_created_by_fkey"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "quote_versions_approved_by_fkey"
		}).onDelete("set null"),
	unique("quote_versions_quote_id_version_number_key").on(table.quoteId, table.versionNumber),
]);

export const quoteLineItemVersions = pgTable("quote_line_item_versions", {
	id: text().primaryKey().notNull(),
	quoteVersionId: text("quote_version_id").notNull(),
	lineNumber: integer("line_number").notNull(),
	type: varchar({ length: 50 }).notNull(),
	sku: varchar({ length: 50 }),
	description: text().notNull(),
	quantity: numeric({ precision: 10, scale:  4 }).notNull(),
	unitPrice: numeric("unit_price", { precision: 15, scale:  4 }).notNull(),
	unitCost: numeric("unit_cost", { precision: 15, scale:  4 }),
	unit: varchar({ length: 50 }).notNull(),
	taxInclusive: boolean("tax_inclusive").default(false).notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  4 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }).notNull(),
	discountType: varchar("discount_type", { length: 20 }).notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  4 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }).notNull(),
	subtotal: numeric({ precision: 15, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	serviceCategoryId: text("service_category_id"),
	rateCardId: text("rate_card_id"),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	index("idx_quote_line_item_versions_line").using("btree", table.quoteVersionId.asc().nullsLast().op("int4_ops"), table.lineNumber.asc().nullsLast().op("text_ops")),
	index("idx_quote_line_item_versions_quote_version").using("btree", table.quoteVersionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.quoteVersionId],
			foreignColumns: [quoteVersions.id],
			name: "quote_line_item_versions_quote_version_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceCategoryId],
			foreignColumns: [serviceCategories.id],
			name: "quote_line_item_versions_service_category_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.rateCardId],
			foreignColumns: [rateCards.id],
			name: "quote_line_item_versions_rate_card_id_fkey"
		}).onDelete("set null"),
	unique("quote_line_item_versions_quote_version_id_line_number_key").on(table.quoteVersionId, table.lineNumber),
]);

export const quotes: any = pgTable("quotes", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	quoteNumber: varchar("quote_number", { length: 50 }).notNull(),
	customerId: text("customer_id").notNull(),
	projectId: text("project_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('draft').notNull(),
	type: varchar({ length: 50 }).default('project').notNull(),
	validFrom: date("valid_from").notNull(),
	validUntil: date("valid_until").notNull(),
	currency: varchar({ length: 3 }).default('NZD').notNull(),
	exchangeRate: numeric("exchange_rate", { precision: 10, scale:  6 }).default('1.000000').notNull(),
	subtotal: numeric({ precision: 15, scale:  2 }).default('0.00').notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  4 }).default('0.1500').notNull(),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }).default('0.00').notNull(),
	discountType: varchar("discount_type", { length: 20 }).default('percentage').notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  4 }).default('0.0000').notNull(),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }).default('0.00').notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).default('0.00').notNull(),
	termsConditions: text("terms_conditions"),
	notes: text(),
	internalNotes: text("internal_notes"),
	createdBy: text("created_by").notNull(),
	approvedBy: text("approved_by"),
	approvedAt: timestamp("approved_at", { precision: 3, mode: 'string' }),
	sentAt: timestamp("sent_at", { precision: 3, mode: 'string' }),
	acceptedAt: timestamp("accepted_at", { precision: 3, mode: 'string' }),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3, mode: 'string' }),
	currentVersionId: text("current_version_id"),
}, (table): any[] => [
	index("idx_quotes_currency").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	index("idx_quotes_current_version").using("btree", table.currentVersionId.asc().nullsLast().op("text_ops")),
	index("idx_quotes_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.currentVersionId],
			foreignColumns: [quoteVersions.id],
			name: "quotes_current_version_id_fkey"
		}).onDelete("set null"),
	unique("quotes_quote_number_organization_id_unique").on(table.organizationId, table.quoteNumber),
]);

export const orgSettings = pgTable("org_settings", {
	orgId: text("org_id").notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [organizations.id],
			name: "org_settings_org_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.orgId, table.key], name: "org_settings_pkey"}),
	check("value_is_valid", sql`jsonb_typeof(value) = ANY (ARRAY['object'::text, 'array'::text, 'string'::text, 'number'::text, 'boolean'::text, 'null'::text])`),
]);

export const orgFeatureFlags = pgTable("org_feature_flags", {
	orgId: text("org_id").notNull(),
	flagKey: text("flag_key").notNull(),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	payload: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [organizations.id],
			name: "org_feature_flags_org_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.orgId, table.flagKey], name: "org_feature_flags_pkey"}),
]);

export const orgNotificationPrefs = pgTable("org_notification_prefs", {
	orgId: text("org_id").notNull(),
	channel: varchar({ length: 20 }).notNull(),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	settings: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).defaultNow().notNull(),
}, (table): any[] => [
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [organizations.id],
			name: "org_notification_prefs_org_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.orgId, table.channel], name: "org_notification_prefs_pkey"}),
	check("org_notification_prefs_channel_check", sql`(channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'push'::character varying])::text[])`),
]);
