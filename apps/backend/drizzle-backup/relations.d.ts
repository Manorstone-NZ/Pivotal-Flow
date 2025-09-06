export declare const policyOverridesRelations: import("drizzle-orm/relations").Relations<"policy_overrides", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    role: import("drizzle-orm/relations").One<"roles", false>;
}>;
export declare const organizationsRelations: import("drizzle-orm/relations").Relations<"organizations", {
    policyOverrides: import("drizzle-orm/relations").Many<"policy_overrides">;
    orgSecurityPolicies: import("drizzle-orm/relations").Many<"org_security_policies">;
    customers: import("drizzle-orm/relations").Many<"customers">;
    organizationSettings: import("drizzle-orm/relations").Many<"organization_settings">;
    roles: import("drizzle-orm/relations").Many<"roles">;
    userRoles: import("drizzle-orm/relations").Many<"user_roles">;
    auditLogs: import("drizzle-orm/relations").Many<"audit_logs">;
    users: import("drizzle-orm/relations").Many<"users">;
    projects: import("drizzle-orm/relations").Many<"projects">;
    rateCards: import("drizzle-orm/relations").Many<"rate_cards">;
    idempotencyKeys: import("drizzle-orm/relations").Many<"idempotency_keys">;
    quoteVersions: import("drizzle-orm/relations").Many<any>;
    orgSettings: import("drizzle-orm/relations").Many<"org_settings">;
    orgFeatureFlags: import("drizzle-orm/relations").Many<"org_feature_flags">;
    orgNotificationPrefs: import("drizzle-orm/relations").Many<"org_notification_prefs">;
}>;
export declare const rolesRelations: import("drizzle-orm/relations").Relations<"roles", {
    policyOverrides: import("drizzle-orm/relations").Many<"policy_overrides">;
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    userRoles: import("drizzle-orm/relations").Many<"user_roles">;
    rolePermissions: import("drizzle-orm/relations").Many<"role_permissions">;
    rateCardItems: import("drizzle-orm/relations").Many<"rate_card_items">;
}>;
export declare const orgSecurityPoliciesRelations: import("drizzle-orm/relations").Relations<"org_security_policies", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
}>;
export declare const customersRelations: import("drizzle-orm/relations").Relations<"customers", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    quoteVersions: import("drizzle-orm/relations").Many<any>;
}>;
export declare const organizationSettingsRelations: import("drizzle-orm/relations").Relations<"organization_settings", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
}>;
export declare const userRolesRelations: import("drizzle-orm/relations").Relations<"user_roles", {
    user_userId: import("drizzle-orm/relations").One<"users", true>;
    role: import("drizzle-orm/relations").One<"roles", true>;
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    user_assignedBy: import("drizzle-orm/relations").One<"users", false>;
}>;
export declare const usersRelations: import("drizzle-orm/relations").Relations<"users", {
    userRoles_userId: import("drizzle-orm/relations").Many<"user_roles">;
    userRoles_assignedBy: import("drizzle-orm/relations").Many<"user_roles">;
    auditLogs: import("drizzle-orm/relations").Many<"audit_logs">;
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    projects: import("drizzle-orm/relations").Many<"projects">;
    idempotencyKeys: import("drizzle-orm/relations").Many<"idempotency_keys">;
    quoteVersions_createdBy: import("drizzle-orm/relations").Many<any>;
    quoteVersions_approvedBy: import("drizzle-orm/relations").Many<any>;
}>;
export declare const auditLogsRelations: import("drizzle-orm/relations").Relations<"audit_logs", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    user: import("drizzle-orm/relations").One<"users", false>;
}>;
export declare const rolePermissionsRelations: import("drizzle-orm/relations").Relations<"role_permissions", {
    role: import("drizzle-orm/relations").One<"roles", true>;
    permission: import("drizzle-orm/relations").One<"permissions", true>;
}>;
export declare const permissionsRelations: import("drizzle-orm/relations").Relations<"permissions", {
    rolePermissions: import("drizzle-orm/relations").Many<"role_permissions">;
}>;
export declare const projectsRelations: import("drizzle-orm/relations").Relations<"projects", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    user: import("drizzle-orm/relations").One<"users", false>;
    quoteVersions: import("drizzle-orm/relations").Many<any>;
}>;
export declare const rateCardsRelations: import("drizzle-orm/relations").Relations<"rate_cards", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    currency: import("drizzle-orm/relations").One<"currencies", true>;
    rateCardItems: import("drizzle-orm/relations").Many<"rate_card_items">;
    quoteLineItemVersions: import("drizzle-orm/relations").Many<"quote_line_item_versions">;
}>;
export declare const currenciesRelations: import("drizzle-orm/relations").Relations<"currencies", {
    rateCards: import("drizzle-orm/relations").Many<"rate_cards">;
    rateCardItems: import("drizzle-orm/relations").Many<"rate_card_items">;
}>;
export declare const rateCardItemsRelations: import("drizzle-orm/relations").Relations<"rate_card_items", {
    rateCard: import("drizzle-orm/relations").One<"rate_cards", true>;
    serviceCategory: import("drizzle-orm/relations").One<"service_categories", true>;
    role: import("drizzle-orm/relations").One<"roles", false>;
    currency: import("drizzle-orm/relations").One<"currencies", true>;
}>;
export declare const serviceCategoriesRelations: import("drizzle-orm/relations").Relations<"service_categories", {
    rateCardItems: import("drizzle-orm/relations").Many<"rate_card_items">;
    quoteLineItemVersions: import("drizzle-orm/relations").Many<"quote_line_item_versions">;
}>;
export declare const idempotencyKeysRelations: import("drizzle-orm/relations").Relations<"idempotency_keys", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
    user: import("drizzle-orm/relations").One<"users", true>;
}>;
export declare const quoteVersionsRelations: import("drizzle-orm/relations").Relations<string, {
    quote: import("drizzle-orm/relations").One<any, false>;
    organization: import("drizzle-orm/relations").One<"organizations", false>;
    customer: import("drizzle-orm/relations").One<"customers", false>;
    project: import("drizzle-orm/relations").One<"projects", false>;
    user_createdBy: import("drizzle-orm/relations").One<"users", false>;
    user_approvedBy: import("drizzle-orm/relations").One<"users", false>;
    quoteLineItemVersions: import("drizzle-orm/relations").Many<"quote_line_item_versions">;
    quotes: import("drizzle-orm/relations").Many<any>;
}>;
export declare const quotesRelations: import("drizzle-orm/relations").Relations<string, {
    quoteVersions: import("drizzle-orm/relations").Many<any>;
    quoteVersion: import("drizzle-orm/relations").One<any, false>;
}>;
export declare const quoteLineItemVersionsRelations: import("drizzle-orm/relations").Relations<"quote_line_item_versions", {
    quoteVersion: import("drizzle-orm/relations").One<any, true>;
    serviceCategory: import("drizzle-orm/relations").One<"service_categories", false>;
    rateCard: import("drizzle-orm/relations").One<"rate_cards", false>;
}>;
export declare const orgSettingsRelations: import("drizzle-orm/relations").Relations<"org_settings", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
}>;
export declare const orgFeatureFlagsRelations: import("drizzle-orm/relations").Relations<"org_feature_flags", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
}>;
export declare const orgNotificationPrefsRelations: import("drizzle-orm/relations").Relations<"org_notification_prefs", {
    organization: import("drizzle-orm/relations").One<"organizations", true>;
}>;
//# sourceMappingURL=relations.d.ts.map