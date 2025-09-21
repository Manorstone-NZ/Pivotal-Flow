/**
 * Auth Repository with Drizzle
 * Replaces raw SQL in auth paths with tenant-safe Drizzle queries
 */
import type { FastifyInstance } from 'fastify';
export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    permissions: string[];
    organizationId: string;
    tenantId: string;
    memberships: Array<{
        tenantId: string;
        role: string;
    }>;
}
export declare class AuthRepository {
    private fastify;
    constructor(fastify: FastifyInstance);
    private get db();
    /**
     * Find user by email with tenant context
     */
    findUserByEmail(tenantId: string, email: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        status: string;
        passwordHash: string;
        organizationId: string;
    } | null>;
    /**
     * Get user with full auth context (roles, permissions, memberships)
     */
    getUserAuthContext(userId: string, tenantId: string): Promise<AuthUser | null>;
    /**
     * Check if user has membership in tenant
     */
    hasUserMembership(userId: string, tenantId: string): Promise<boolean>;
    /**
     * Get user role in specific tenant
     */
    getUserTenantRole(userId: string, tenantId: string): Promise<string | null>;
    /**
     * Validate tenant exists and is active
     */
    validateTenant(tenantId: string): Promise<boolean>;
    /**
     * Get user's active memberships
     */
    getUserMemberships(userId: string): Promise<Array<{
        tenantId: string;
        tenantName: string;
        role: string;
        status: string;
    }>>;
    /**
     * Update user last login timestamp
     */
    updateUserLastLogin(userId: string): Promise<void>;
    /**
     * Record failed login attempt
     */
    recordFailedLogin(email: string, ipAddress?: string): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map