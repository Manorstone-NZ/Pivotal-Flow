/**
 * Permission Management Service
 * Handles CRUD operations for permissions, roles, and role assignments
 */
import type { FastifyInstance } from 'fastify';
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
}
//# sourceMappingURL=service.d.ts.map