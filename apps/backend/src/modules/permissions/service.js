/**
 * Permission Management Service
 * Handles CRUD operations for permissions, roles, and role assignments
 */
import { eq, and, desc, inArray } from 'drizzle-orm';
import { permissions, roles, rolePermissions, userRoles, users
// organizations // TODO: Use when needed
 } from '../../lib/schema.js';
export class PermissionService {
    fastify;
    userId;
    organizationId;
    constructor(fastify, userId, organizationId) {
        this.fastify = fastify;
        this.userId = userId;
        this.organizationId = organizationId;
    }
    // Permission Management
    async listPermissions() {
        const result = await this.fastify.db
            .select()
            .from(permissions)
            .orderBy(desc(permissions.category), desc(permissions.name));
        return result;
    }
    async createPermission(data) {
        const permissionData = {
            id: `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            description: data.description || null,
            category: data.category,
            resource: data.resource,
            action: data.action,
            createdAt: new Date(),
        };
        await this.fastify.db.insert(permissions).values(permissionData);
        return permissionData;
    }
    // Role Management
    async listRoles(orgId) {
        const targetOrgId = orgId || this.organizationId;
        const result = await this.fastify.db
            .select({
            id: roles.id,
            organizationId: roles.organizationId,
            name: roles.name,
            description: roles.description,
            isSystem: roles.isSystem,
            isActive: roles.isActive,
            createdAt: roles.createdAt,
            updatedAt: roles.updatedAt,
        })
            .from(roles)
            .where(eq(roles.organizationId, targetOrgId))
            .orderBy(desc(roles.isSystem), desc(roles.name));
        // Get permissions for each role
        const rolesWithPermissions = await Promise.all(result.map(async (role) => {
            const rolePerms = await this.fastify.db
                .select({
                id: permissions.id,
                name: permissions.name,
                description: permissions.description,
                category: permissions.category,
                resource: permissions.resource,
                action: permissions.action,
                createdAt: permissions.createdAt,
            })
                .from(rolePermissions)
                .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(eq(rolePermissions.roleId, role.id));
            return {
                ...role,
                permissions: rolePerms,
            };
        }));
        return rolesWithPermissions;
    }
    async createRole(data) {
        const targetOrgId = data.organizationId || this.organizationId;
        const roleData = {
            id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            organizationId: targetOrgId,
            name: data.name,
            description: data.description || null,
            isSystem: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.fastify.db.insert(roles).values(roleData);
        // Assign permissions to role if provided
        if (data.permissionIds && data.permissionIds.length > 0) {
            const rolePermissionData = data.permissionIds.map((permId, index) => ({
                id: `rp-${roleData.id}-${index + 1}`,
                roleId: roleData.id,
                permissionId: permId,
                createdAt: new Date(),
            }));
            await this.fastify.db.insert(rolePermissions).values(rolePermissionData);
        }
        return { ...roleData, permissions: [] };
    }
    async updateRolePermissions(roleId, permissionIds) {
        // Remove existing permissions
        await this.fastify.db
            .delete(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId));
        // Add new permissions
        if (permissionIds.length > 0) {
            const rolePermissionData = permissionIds.map((permId, index) => ({
                id: `rp-${roleId}-${Date.now()}-${index + 1}`,
                roleId,
                permissionId: permId,
                createdAt: new Date(),
            }));
            await this.fastify.db.insert(rolePermissions).values(rolePermissionData);
        }
    }
    // User Role Management
    async listUserRoles(orgId) {
        const targetOrgId = orgId || this.organizationId;
        const result = await this.fastify.db
            .select({
            id: userRoles.id,
            userId: userRoles.userId,
            roleId: userRoles.roleId,
            organizationId: userRoles.organizationId,
            assignedAt: userRoles.assignedAt,
            isActive: userRoles.isActive,
            userEmail: users.email,
            userDisplayName: users.displayName,
            roleName: roles.name,
            roleDescription: roles.description,
        })
            .from(userRoles)
            .innerJoin(users, eq(userRoles.userId, users.id))
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(and(eq(userRoles.organizationId, targetOrgId), eq(userRoles.isActive, true)))
            .orderBy(desc(users.email));
        return result.map((row) => ({
            id: row.id,
            userId: row.userId,
            roleId: row.roleId,
            organizationId: row.organizationId,
            assignedAt: row.assignedAt,
            isActive: row.isActive,
            user: {
                id: row.userId,
                email: row.userEmail,
                displayName: row.userDisplayName,
            },
            role: {
                id: row.roleId,
                name: row.roleName,
                description: row.roleDescription,
            },
        }));
    }
    async assignRoleToUser(userId, roleId, orgId) {
        const targetOrgId = orgId || this.organizationId;
        const userRoleData = {
            id: `ur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            roleId,
            organizationId: targetOrgId,
            assignedBy: this.userId,
            assignedAt: new Date(),
            isActive: true,
        };
        await this.fastify.db.insert(userRoles).values(userRoleData);
        // Get user and role details
        const userDetails = await this.fastify.db
            .select({
            email: users.email,
            displayName: users.displayName,
        })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        const roleDetails = await this.fastify.db
            .select({
            name: roles.name,
            description: roles.description,
        })
            .from(roles)
            .where(eq(roles.id, roleId))
            .limit(1);
        return {
            id: userRoleData.id,
            userId,
            roleId,
            organizationId: targetOrgId,
            assignedAt: userRoleData.assignedAt,
            isActive: true,
            user: {
                id: userId,
                email: userDetails[0]?.email || '',
                displayName: userDetails[0]?.displayName || null,
            },
            role: {
                id: roleId,
                name: roleDetails[0]?.name || '',
                description: roleDetails[0]?.description || null,
            },
        };
    }
    async revokeRoleFromUser(userRoleId) {
        await this.fastify.db
            .update(userRoles)
            .set({ isActive: false })
            .where(eq(userRoles.id, userRoleId));
    }
    // Organization Users (for role assignment)
    async listOrganizationUsers(orgId) {
        const targetOrgId = orgId || this.organizationId;
        const result = await this.fastify.db
            .select({
            id: users.id,
            email: users.email,
            displayName: users.displayName,
            status: users.status,
        })
            .from(users)
            .where(and(eq(users.organizationId, targetOrgId), eq(users.status, 'active')))
            .orderBy(desc(users.email));
        return result;
    }
    /**
     * Check if the current user has a specific permission
     */
    async hasPermission(permissionName) {
        try {
            // Get user's active roles
            const userRolesResult = await this.fastify.db
                .select({
                roleId: userRoles.roleId,
            })
                .from(userRoles)
                .where(and(eq(userRoles.userId, this.userId), eq(userRoles.organizationId, this.organizationId), eq(userRoles.isActive, true)));
            if (userRolesResult.length === 0) {
                return { hasPermission: false, reason: 'User has no active roles' };
            }
            const roleIds = userRolesResult.map((ur) => ur.roleId);
            // Check if any of the user's roles has the required permission
            const permissionCheck = await this.fastify.db
                .select({
                permissionId: permissions.id,
            })
                .from(rolePermissions)
                .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(and(eq(permissions.name, permissionName), inArray(rolePermissions.roleId, roleIds)))
                .limit(1);
            if (permissionCheck.length === 0) {
                return { hasPermission: false, reason: `Permission '${permissionName}' not granted to user roles` };
            }
            return { hasPermission: true };
        }
        catch (error) {
            return { hasPermission: false, reason: `Error checking permission: ${error}` };
        }
    }
    /**
     * Check if the current user has any of the specified permissions
     */
    async hasAnyPermission(permissionNames) {
        for (const permissionName of permissionNames) {
            const check = await this.hasPermission(permissionName);
            if (check.hasPermission) {
                return check;
            }
        }
        return { hasPermission: false, reason: `User has none of the required permissions: ${permissionNames.join(', ')}` };
    }
    /**
     * Check if the current user has all of the specified permissions
     */
    async hasAllPermissions(permissionNames) {
        const missingPermissions = [];
        for (const permissionName of permissionNames) {
            const check = await this.hasPermission(permissionName);
            if (!check.hasPermission) {
                missingPermissions.push(permissionName);
            }
        }
        if (missingPermissions.length === 0) {
            return { hasPermission: true };
        }
        return { hasPermission: false, reason: `User missing permissions: ${missingPermissions.join(', ')}` };
    }
    /**
     * Check if the current user can override quote prices
     */
    async canOverrideQuotePrice(_userId) {
        return await this.hasPermission('quotes.override_price');
    }
    /**
     * Get all permissions for the current user
     */
    async getUserPermissions(_userId) {
        try {
            // Get user's active roles
            const userRolesResult = await this.fastify.db
                .select({
                roleId: userRoles.roleId,
            })
                .from(userRoles)
                .where(and(eq(userRoles.userId, this.userId), eq(userRoles.organizationId, this.organizationId), eq(userRoles.isActive, true)));
            if (userRolesResult.length === 0) {
                return [];
            }
            const roleIds = userRolesResult.map((ur) => ur.roleId);
            // Get all permissions for the user's roles
            const userPermissions = await this.fastify.db
                .select({
                permissionName: permissions.name,
            })
                .from(rolePermissions)
                .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
                .where(inArray(rolePermissions.roleId, roleIds));
            return userPermissions.map((p) => p.permissionName);
        }
        catch (error) {
            return [];
        }
    }
}
//# sourceMappingURL=service.js.map