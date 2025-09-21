/**
 * Permission Management Service
 * Handles CRUD operations for permissions, roles, and role assignments
 */
import type { FastifyInstance } from 'fastify';
import type { PermissionCheck, PermissionName } from './types.js';
export interface PermissionData {
    id: string;
    name: string;
    description: string | null;
    category: string;
    resource: string;
    action: string;
    createdAt: Date;
}
export interface RoleData {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions?: PermissionData[];
}
export interface UserRoleData {
    id: string;
    userId: string;
    roleId: string;
    organizationId: string;
    assignedAt: Date;
    isActive: boolean;
    user?: {
        id: string;
        email: string;
        displayName: string | null;
    };
    role?: {
        id: string;
        name: string;
        description: string | null;
    };
}
export declare class PermissionService {
    private fastify;
    private userId;
    private organizationId;
    constructor(fastify: FastifyInstance, userId: string, organizationId: string);
    listPermissions(): Promise<PermissionData[]>;
    createPermission(data: {
        name: string;
        description?: string;
        category: string;
        resource: string;
        action: string;
    }): Promise<PermissionData>;
    listRoles(orgId?: string): Promise<RoleData[]>;
    createRole(data: {
        name: string;
        description?: string;
        organizationId?: string;
        permissionIds?: string[];
    }): Promise<RoleData>;
    updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void>;
    listUserRoles(orgId?: string): Promise<UserRoleData[]>;
    assignRoleToUser(userId: string, roleId: string, orgId?: string): Promise<UserRoleData>;
    revokeRoleFromUser(userRoleId: string): Promise<void>;
    listOrganizationUsers(orgId?: string): Promise<Array<{
        id: string;
        email: string;
        displayName: string | null;
        status: string;
    }>>;
    /**
     * Check if the current user has a specific permission
     */
    hasPermission(permissionName: PermissionName): Promise<PermissionCheck>;
    /**
     * Check if the current user has any of the specified permissions
     */
    hasAnyPermission(permissionNames: PermissionName[]): Promise<PermissionCheck>;
    /**
     * Check if the current user has all of the specified permissions
     */
    hasAllPermissions(permissionNames: PermissionName[]): Promise<PermissionCheck>;
    /**
     * Check if the current user can override quote prices
     */
    canOverrideQuotePrice(_userId?: string): Promise<PermissionCheck>;
    /**
     * Get all permissions for the current user
     */
    getUserPermissions(_userId?: string): Promise<string[]>;
}
//# sourceMappingURL=service.d.ts.map