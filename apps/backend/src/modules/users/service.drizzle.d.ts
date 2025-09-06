import type { FastifyInstance } from 'fastify';
export interface UserPublic {
    id: string;
    email: string;
    displayName: string | null;
    status: string;
    isActive: boolean;
    mfaEnabled: boolean;
    createdAt: Date;
    organizationId: string;
    roles: Array<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        isActive: boolean;
    }>;
}
export interface UserListSort {
    field: 'email' | 'createdAt';
    direction: 'asc' | 'desc';
}
export interface UserCreateRequest {
    email: string;
    displayName?: string;
    password: string;
}
export interface UserUpdateRequest {
    displayName?: string;
    status?: string;
    mfaEnabled?: boolean;
}
export interface UserListFilters {
    isActive?: boolean;
    q?: string;
}
export interface UserListOptions {
    organizationId: string;
    filters?: Partial<UserListFilters>;
    sort: UserListSort;
    page: number;
    pageSize: number;
}
export interface UserListResult {
    items: UserPublic[];
    total: number;
    totalPages: number;
}
export interface UserWithRoles {
    id: string;
    email: string;
    displayName: string | null;
    status: string;
    mfaEnabled: boolean;
    createdAt: Date;
    organizationId: string;
    roles: Array<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        isActive: boolean;
    }>;
}
/**
 * List users with pagination and filters using Drizzle ORM
 */
export declare function listUsers(options: UserListOptions, fastify: FastifyInstance): Promise<UserListResult>;
/**
 * Get user by ID using Drizzle ORM
 */
export declare function getUserById(userId: string, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles | null>;
/**
 * Create new user using Drizzle ORM
 */
export declare function createUser(userData: UserCreateRequest, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles>;
/**
 * Update user using Drizzle ORM
 */
export declare function updateUser(userId: string, updateData: UserUpdateRequest, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles>;
/**
 * Add role to user using Drizzle ORM
 */
export declare function addRoleToUser(userId: string, roleId: string, organizationId: string, fastify: FastifyInstance): Promise<void>;
/**
 * Remove role from user using Drizzle ORM
 */
export declare function removeRoleFromUser(userId: string, roleId: string, organizationId: string, fastify: FastifyInstance): Promise<void>;
/**
 * Get user roles using Drizzle ORM
 */
export declare function getUserRoles(userId: string, fastify: FastifyInstance): Promise<Array<{
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
}>>;
/**
 * Check if user has role using Drizzle ORM
 */
export declare function userHasRole(userId: string, roleName: string, fastify: FastifyInstance): Promise<boolean>;
/**
 * UserService class for backward compatibility with tests
 */
export declare class UserService {
    private options;
    constructor(options: {
        organizationId: string;
        userId: string;
    });
    createUser(userData: UserCreateRequest): Promise<UserWithRoles>;
    getUser(userId: string): Promise<UserWithRoles | null>;
    getUsers(options: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<UserListResult>;
    updateUser(userId: string, updateData: UserUpdateRequest): Promise<UserWithRoles | null>;
    addUserRole(userId: string, roleName: string): Promise<{
        userId: string;
        roleId: string;
        organizationId: string;
        isActive: boolean;
    }>;
    removeUserRole(userId: string, roleName: string): Promise<{
        userId: string;
        roleId: string;
        organizationId: string;
        isActive: boolean;
    }>;
}
//# sourceMappingURL=service.drizzle.d.ts.map