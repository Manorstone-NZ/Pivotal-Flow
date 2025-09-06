import type { FastifyRequest, FastifyInstance } from 'fastify';
export interface UserContext {
    userId: string;
    organizationId: string;
    roles: string[];
}
export interface PermissionCheck {
    hasPermission: boolean;
    reason?: string;
}
/**
 * Check if user has users.view permission
 */
export declare function canViewUsers(user: UserContext, _fastify: FastifyInstance): Promise<PermissionCheck>;
/**
 * Check if user has users.manage permission
 */
export declare function canManageUsers(user: UserContext, _fastify: FastifyInstance): Promise<PermissionCheck>;
/**
 * Check if user can access a specific user (same organization)
 */
export declare function canAccessUser(user: UserContext, targetUserId: string, fastify: FastifyInstance): Promise<PermissionCheck>;
/**
 * Check if user can modify a specific user
 */
export declare function canModifyUser(user: UserContext, targetUserId: string, fastify: FastifyInstance): Promise<PermissionCheck>;
/**
 * Extract user context from Fastify request
 */
export declare function extractUserContext(request: FastifyRequest): UserContext;
//# sourceMappingURL=rbac.d.ts.map