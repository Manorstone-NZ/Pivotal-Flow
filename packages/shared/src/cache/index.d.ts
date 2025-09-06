import type { CacheMetrics } from '../metrics/index.js';
export type { CacheApi } from './types.js';
export type { CacheMetrics } from '../metrics/index.js';
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    jitter?: boolean;
    jitterRange?: number;
}
export interface CacheKeyOptions {
    organizationId: string;
    resource: string;
    identifier?: string | undefined;
    action?: string | undefined;
}
export declare class CacheError extends Error {
    readonly code: string;
    readonly originalError?: unknown | undefined;
    constructor(message: string, code: string, originalError?: unknown | undefined);
}
export declare abstract class CacheProvider {
    abstract get<T>(key: string): Promise<T | null>;
    abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
    abstract delete(key: string): Promise<void>;
    abstract exists(key: string): Promise<boolean>;
    abstract getTtl(key: string): Promise<number>;
    abstract getMetrics(): Promise<CacheMetrics>;
    abstract resetMetrics(): Promise<void>;
}
/**
 * Cache key builder using pivotal:org:resource scheme
 */
export declare class CacheKeyBuilder {
    private static readonly KEY_SEPARATOR;
    private static readonly DEFAULT_PREFIX;
    static build(options: CacheKeyOptions, prefix?: string): string;
    static buildUserKey(organizationId: string, userId?: string, action?: string): string;
    static buildRoleKey(organizationId: string, roleId?: string, action?: string): string;
    static buildUserListKey(organizationId: string, filters?: Record<string, unknown>): string;
    static buildAuditKey(organizationId: string, entityType?: string, entityId?: string): string;
    static buildOrgSettingsKey(organizationId: string): string;
    static buildOrgRolesKey(organizationId: string): string;
    static buildRolePermissionsKey(organizationId: string, roleId: string): string;
    private static hashFilters;
}
/**
 * Cache wrapper with getOrSet, ttl, and bust helpers
 */
export declare class CacheWrapper {
    private readonly provider;
    private readonly options;
    private readonly inFlightRequests;
    constructor(provider: CacheProvider, options?: CacheOptions);
    /**
     * Get value from cache, or set it using the provided function
     * Implements single flight pattern to prevent stampede
     */
    getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
    /**
     * Internal implementation of getOrSet
     */
    private _getOrSetInternal;
    /**
     * Calculate TTL with optional jitter to prevent stampede
     */
    private calculateJitteredTtl;
    /**
     * Get value from cache with TTL check
     */
    getWithTtl<T>(key: string): Promise<{
        value: T | null;
        ttl: number;
    }>;
    /**
     * Bust cache for specific keys or patterns
     */
    bust(options: CacheKeyOptions | string | string[]): Promise<void>;
    /**
     * Bust cache for organization (clears all org-related cache)
     */
    bustOrganization(organizationId: string): Promise<void>;
    /**
     * Bust cache for specific resource type
     */
    bustResource(organizationId: string, resource: string): Promise<void>;
    /**
     * Bust cache for specific entity
     */
    bustEntity(organizationId: string, resource: string, identifier: string): Promise<void>;
    /**
     * Bust cache by pattern (implementation depends on cache provider)
     */
    private bustPattern;
    /**
     * Get cache metrics
     */
    getMetrics(): Promise<CacheMetrics>;
    /**
     * Reset cache metrics
     */
    resetMetrics(): Promise<void>;
    /**
     * Bust organization-level cache (settings, roles, permissions)
     */
    bustOrgCache(organizationId: string): Promise<void>;
    /**
     * Bust role-specific cache
     */
    bustRoleCache(organizationId: string, roleId: string): Promise<void>;
    /**
     * Bust user cache with explicit invalidation
     */
    bustUserCache(organizationId: string, userId: string): Promise<void>;
    /**
     * Record cache hit for metrics
     */
    private recordCacheHit;
    /**
     * Record cache miss for metrics
     */
    private recordCacheMiss;
    /**
     * Record cache set for metrics
     */
    private recordCacheSet;
    /**
     * Record cache error for metrics
     */
    private recordCacheError;
    /**
     * Check if cache is healthy
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Memory-based cache provider for testing and development
 */
export declare class MemoryCacheProvider implements CacheProvider {
    private cache;
    private metrics;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getTtl(key: string): Promise<number>;
    getMetrics(): Promise<CacheMetrics>;
    resetMetrics(): Promise<void>;
}
export { RedisProvider } from './redis-provider.js';
//# sourceMappingURL=index.d.ts.map