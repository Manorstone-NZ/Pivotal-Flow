import type { AuthContext } from '../security/jwt-types.js';
export interface TenantContext {
    organizationId: string;
    userId: string;
}
export interface TenantGuardOptions {
    requireAuth: boolean;
    requireOrganization: boolean;
}
export declare const defaultTenantGuardOptions: TenantGuardOptions;
/**
 * Extracts tenant context from request
 */
export declare function extractTenantContext(authContext: AuthContext | null): TenantContext | null;
/**
 * Validates tenant context
 */
export declare function validateTenantContext(context: TenantContext | null, options?: TenantGuardOptions): {
    isValid: boolean;
    error?: string;
};
/**
 * Enforces tenant guard for database queries
 */
export declare function requireOrganizationId<T extends Record<string, any>>(data: T, organizationId: string): T & {
    organizationId: string;
};
/**
 * Creates a tenant-aware query filter
 */
export declare function createTenantFilter(organizationId: string): {
    organizationId: string;
};
/**
 * Validates that a resource belongs to the specified organization
 */
export declare function validateResourceOwnership(resource: {
    organizationId: string;
} | null, expectedOrganizationId: string): boolean;
/**
 * Creates a tenant guard decorator for Fastify routes
 */
export declare function createTenantGuard(options?: TenantGuardOptions): (request: any, reply: any, done: () => void) => void;
//# sourceMappingURL=guard.d.ts.map