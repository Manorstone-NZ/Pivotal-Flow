import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { BaseRepository } from '../../lib/repo.base.js';
import type { PermissionName, PermissionCheck } from './types.js';
/**
 * Permission Service
 *
 * Handles permission checking and management for users
 */
export declare class PermissionService extends BaseRepository {
    options: {
        organizationId: string;
        userId: string;
    };
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, options: {
        organizationId: string;
        userId: string;
    });
    /**
     * Check if a user has a specific permission
     */
    hasPermission(userId: string, permission: PermissionName): Promise<PermissionCheck>;
    /**
     * Check if the current user has a specific permission
     */
    hasCurrentUserPermission(permission: PermissionName): Promise<PermissionCheck>;
    /**
     * Check if user has quotes.override_price permission
     */
    canOverrideQuotePrice(userId: string): Promise<PermissionCheck>;
    /**
     * Check if current user can override quote prices
     */
    canCurrentUserOverrideQuotePrice(): Promise<PermissionCheck>;
    /**
     * Get all permissions for a user
     */
    getUserPermissions(userId: string): Promise<string[]>;
    /**
     * Get all permissions for the current user
     */
    getCurrentUserPermissions(): Promise<string[]>;
    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission(userId: string, permissions: PermissionName[]): Promise<PermissionCheck>;
    /**
     * Check if current user has any of the specified permissions
     */
    hasCurrentUserAnyPermission(permissions: PermissionName[]): Promise<PermissionCheck>;
    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions(userId: string, permissions: PermissionName[]): Promise<PermissionCheck>;
    /**
     * Check if current user has all of the specified permissions
     */
    hasCurrentUserAllPermissions(permissions: PermissionName[]): Promise<PermissionCheck>;
}
//# sourceMappingURL=service.d.ts.map