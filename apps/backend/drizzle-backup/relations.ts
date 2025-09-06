import { relations } from "drizzle-orm/relations";

import { organizations, policyOverrides, roles, orgSecurityPolicies, customers, organizationSettings, users, userRoles, auditLogs, rolePermissions, permissions, projects, rateCards, currencies, rateCardItems, serviceCategories, idempotencyKeys, quotes, quoteVersions, quoteLineItemVersions, orgSettings, orgFeatureFlags, orgNotificationPrefs } from "./schema.js";

export const policyOverridesRelations = relations(policyOverrides, ({one}) => ({
	organization: one(organizations, {
		fields: [policyOverrides.organizationId],
		references: [organizations.id]
	}),
	role: one(roles, {
		fields: [policyOverrides.roleId],
		references: [roles.id]
	}),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	policyOverrides: many(policyOverrides),
	orgSecurityPolicies: many(orgSecurityPolicies),
	customers: many(customers),
	organizationSettings: many(organizationSettings),
	roles: many(roles),
	userRoles: many(userRoles),
	auditLogs: many(auditLogs),
	users: many(users),
	projects: many(projects),
	rateCards: many(rateCards),
	idempotencyKeys: many(idempotencyKeys),
	quoteVersions: many(quoteVersions),
	orgSettings: many(orgSettings),
	orgFeatureFlags: many(orgFeatureFlags),
	orgNotificationPrefs: many(orgNotificationPrefs),
}));

export const rolesRelations = relations(roles, ({one, many}) => ({
	policyOverrides: many(policyOverrides),
	organization: one(organizations, {
		fields: [roles.organizationId],
		references: [organizations.id]
	}),
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions),
	rateCardItems: many(rateCardItems),
}));

export const orgSecurityPoliciesRelations = relations(orgSecurityPolicies, ({one}) => ({
	organization: one(organizations, {
		fields: [orgSecurityPolicies.orgId],
		references: [organizations.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	organization: one(organizations, {
		fields: [customers.organizationId],
		references: [organizations.id]
	}),
	quoteVersions: many(quoteVersions),
}));

export const organizationSettingsRelations = relations(organizationSettings, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationSettings.organizationId],
		references: [organizations.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user_userId: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
		relationName: "userRoles_userId_users_id"
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	organization: one(organizations, {
		fields: [userRoles.organizationId],
		references: [organizations.id]
	}),
	user_assignedBy: one(users, {
		fields: [userRoles.assignedBy],
		references: [users.id],
		relationName: "userRoles_assignedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_users_id"
	}),
	userRoles_assignedBy: many(userRoles, {
		relationName: "userRoles_assignedBy_users_id"
	}),
	auditLogs: many(auditLogs),
	organization: one(organizations, {
		fields: [users.organizationId],
		references: [organizations.id]
	}),
	projects: many(projects),
	idempotencyKeys: many(idempotencyKeys),
	quoteVersions_createdBy: many(quoteVersions, {
		relationName: "quoteVersions_createdBy_users_id"
	}),
	quoteVersions_approvedBy: many(quoteVersions, {
		relationName: "quoteVersions_approvedBy_users_id"
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogs.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [projects.ownerId],
		references: [users.id]
	}),
	quoteVersions: many(quoteVersions),
}));

export const rateCardsRelations = relations(rateCards, ({one, many}) => ({
	organization: one(organizations, {
		fields: [rateCards.organizationId],
		references: [organizations.id]
	}),
	currency: one(currencies, {
		fields: [rateCards.currency],
		references: [currencies.code]
	}),
	rateCardItems: many(rateCardItems),
	quoteLineItemVersions: many(quoteLineItemVersions),
}));

export const currenciesRelations = relations(currencies, ({many}) => ({
	rateCards: many(rateCards),
	rateCardItems: many(rateCardItems),
}));

export const rateCardItemsRelations = relations(rateCardItems, ({one}) => ({
	rateCard: one(rateCards, {
		fields: [rateCardItems.rateCardId],
		references: [rateCards.id]
	}),
	serviceCategory: one(serviceCategories, {
		fields: [rateCardItems.serviceCategoryId],
		references: [serviceCategories.id]
	}),
	role: one(roles, {
		fields: [rateCardItems.roleId],
		references: [roles.id]
	}),
	currency: one(currencies, {
		fields: [rateCardItems.currency],
		references: [currencies.code]
	}),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({many}) => ({
	rateCardItems: many(rateCardItems),
	quoteLineItemVersions: many(quoteLineItemVersions),
}));

export const idempotencyKeysRelations = relations(idempotencyKeys, ({one}) => ({
	organization: one(organizations, {
		fields: [idempotencyKeys.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [idempotencyKeys.userId],
		references: [users.id]
	}),
}));

export const quoteVersionsRelations = relations(quoteVersions, ({one, many}) => ({
	quote: one(quotes, {
		fields: [quoteVersions.quoteId],
		references: [quotes.id],
		relationName: "quoteVersions_quoteId_quotes_id"
	}),
	organization: one(organizations, {
		fields: [quoteVersions.organizationId],
		references: [organizations.id]
	}),
	customer: one(customers, {
		fields: [quoteVersions.customerId],
		references: [customers.id]
	}),
	project: one(projects, {
		fields: [quoteVersions.projectId],
		references: [projects.id]
	}),
	user_createdBy: one(users, {
		fields: [quoteVersions.createdBy],
		references: [users.id],
		relationName: "quoteVersions_createdBy_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [quoteVersions.approvedBy],
		references: [users.id],
		relationName: "quoteVersions_approvedBy_users_id"
	}),
	quoteLineItemVersions: many(quoteLineItemVersions),
	quotes: many(quotes, {
		relationName: "quotes_currentVersionId_quoteVersions_id"
	}),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	quoteVersions: many(quoteVersions, {
		relationName: "quoteVersions_quoteId_quotes_id"
	}),
	quoteVersion: one(quoteVersions, {
		fields: [quotes.currentVersionId],
		references: [quoteVersions.id],
		relationName: "quotes_currentVersionId_quoteVersions_id"
	}),
}));

export const quoteLineItemVersionsRelations = relations(quoteLineItemVersions, ({one}) => ({
	quoteVersion: one(quoteVersions, {
		fields: [quoteLineItemVersions.quoteVersionId],
		references: [quoteVersions.id]
	}),
	serviceCategory: one(serviceCategories, {
		fields: [quoteLineItemVersions.serviceCategoryId],
		references: [serviceCategories.id]
	}),
	rateCard: one(rateCards, {
		fields: [quoteLineItemVersions.rateCardId],
		references: [rateCards.id]
	}),
}));

export const orgSettingsRelations = relations(orgSettings, ({one}) => ({
	organization: one(organizations, {
		fields: [orgSettings.orgId],
		references: [organizations.id]
	}),
}));

export const orgFeatureFlagsRelations = relations(orgFeatureFlags, ({one}) => ({
	organization: one(organizations, {
		fields: [orgFeatureFlags.orgId],
		references: [organizations.id]
	}),
}));

export const orgNotificationPrefsRelations = relations(orgNotificationPrefs, ({one}) => ({
	organization: one(organizations, {
		fields: [orgNotificationPrefs.orgId],
		references: [organizations.id]
	}),
}));