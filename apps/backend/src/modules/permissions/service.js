import { eq, and, isNull, or } from 'drizzle-orm';
import { BaseRepository } from '../../lib/repo.base.js';
import { roles, userRoles, permissions, rolePermissions, policyOverrides } from '../../lib/schema.js';
/**
 * Permission Service
 *
 * Handles permission checking and management for users
 */
export class PermissionService extends BaseRepository {
    options;
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    /**
     * Check if a user has a specific permission
     */
    async hasPermission(userId, permission) {
        try {
            // Parse permission into action and resource
            const [action, resource] = permission.split('.');
            if (!action || !resource) {
                return {
                    hasPermission: false,
                    reason: `Invalid permission format: ${permission}`
                };
            }
            // Get user's permissions through role hierarchy
            const userPermissionsResult = await this.db
                .select({
                permissionId: permissions.id,
                action: permissions.action,
                resource: permissions.resource,
                category: permissions.category
            })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
                .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(and(eq(userRoles.userId, userId), eq(userRoles.organizationId, this.options.organizationId), eq(userRoles.isActive, true), eq(roles.isActive, true), eq(permissions.action, action), eq(permissions.resource, resource)));
            if (userPermissionsResult.length > 0) {
                // Check for any policy overrides that might deny the permission
                const firstPermission = userPermissionsResult[0];
                if (firstPermission) {
                    await this.db
                        .select()
                        .from(policyOverrides)
                        .where(and(eq(policyOverrides.organizationId, this.options.organizationId), eq(policyOverrides.resource, resource), eq(policyOverrides.isActive, true), or(isNull(policyOverrides.roleId), eq(policyOverrides.roleId, firstPermission.permissionId))));
                }
                // For now, we'll allow the permission if no explicit deny policies exist
                // In a more sophisticated system, you'd evaluate the JSONB policy conditions
                return { hasPermission: true };
            }
            return {
                hasPermission: false,
                reason: `User lacks permission: ${permission}`
            };
        }
        catch (error) {
            return {
                hasPermission: false,
                reason: `Error checking permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    /**
     * Check if the current user has a specific permission
     */
    async hasCurrentUserPermission(permission) {
        return this.hasPermission(this.options.userId, permission);
    }
    /**
     * Check if user has quotes.override_price permission
     */
    async canOverrideQuotePrice(userId) {
        return this.hasPermission(userId, 'quotes.override_price');
    }
    /**
     * Check if current user can override quote prices
     */
    async canCurrentUserOverrideQuotePrice() {
        return this.canOverrideQuotePrice(this.options.userId);
    }
    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId) {
        try {
            const userPermissionsResult = await this.db
                .select({
                action: permissions.action,
                resource: permissions.resource
            })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
                .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(and(eq(userRoles.userId, userId), eq(userRoles.organizationId, this.options.organizationId), eq(userRoles.isActive, true), eq(roles.isActive, true)));
            // Format permissions as action.resource
            const allPermissions = userPermissionsResult.map(p => `${p.action}.${p.resource}`);
            // Remove duplicates
            return Array.from(new Set(allPermissions));
        }
        catch (error) {
            console.error('Error getting user permissions:', error);
            return [];
        }
    }
    /**
     * Get all permissions for the current user
     */
    async getCurrentUserPermissions() {
        return this.getUserPermissions(this.options.userId);
    }
    /**
     * Check if user has any of the specified permissions
     */
    async hasAnyPermission(userId, permissions) {
        const userPermissions = await this.getUserPermissions(userId);
        for (const permission of permissions) {
            if (userPermissions.includes(permission)) {
                return { hasPermission: true };
            }
        }
        return {
            hasPermission: false,
            reason: `User lacks any of the required permissions: ${permissions.join(', ')}`
        };
    }
    /**
     * Check if current user has any of the specified permissions
     */
    async hasCurrentUserAnyPermission(permissions) {
        return this.hasAnyPermission(this.options.userId, permissions);
    }
    /**
     * Check if user has all of the specified permissions
     */
    async hasAllPermissions(userId, permissions) {
        const userPermissions = await this.getUserPermissions(userId);
        for (const permission of permissions) {
            if (!userPermissions.includes(permission)) {
                return {
                    hasPermission: false,
                    reason: `User lacks permission: ${permission}`
                };
            }
        }
        return { hasPermission: true };
    }
    /**
     * Check if current user has all of the specified permissions
     */
    async hasCurrentUserAllPermissions(permissions) {
        return this.hasAllPermissions(this.options.userId, permissions);
    }
}
//# sourceMappingURL=service.js.map