import type { CacheApi } from '@pivotal-flow/shared';
import { createClient } from 'redis';
export interface CacheOptions {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    ttl?: number;
}
export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
/**
 * Redis Cache Service
 *
 * Provides caching functionality for:
 * - Rate cards and pricing data
 * - User permissions and roles
 * - Organization settings and feature flags
 * - Frequently accessed business data
 */
export declare class CacheService implements CacheApi {
    protected client: ReturnType<typeof createClient>;
    private isConnected;
    private readonly keyPrefix;
    private readonly defaultTTL;
    constructor(options?: CacheOptions);
    private setupEventHandlers;
    /**
     * Connect to Redis
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Redis
     */
    disconnect(): Promise<void>;
    /**
     * Generate cache key with prefix
     */
    private generateKey;
    /**
     * Set cache item with TTL
     */
    set<T>(key: string, data: T, ttl?: number): Promise<void>;
    /**
     * Get cache item
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Delete cache item
     */
    delete(key: string): Promise<void>;
    /**
     * Delete multiple cache items by pattern
     */
    deletePattern(pattern: string): Promise<void>;
    /**
     * Check if cache item exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get cache item TTL
     */
    getTTL(key: string): Promise<number>;
    /**
     * Set cache item TTL
     */
    setTTL(key: string, ttl: number): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<{
        connected: boolean;
        keyCount: number;
        memoryUsage: string;
        hitRate: number;
    }>;
    /**
     * Clear all cache data
     */
    clear(): Promise<void>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
export declare const CacheKeys: {
    rateCard: (orgId: string, rateCardId: string) => string;
    rateCardItems: (orgId: string, rateCardId: string) => string;
    activeRateCard: (orgId: string, date: string) => string;
    userPermissions: (orgId: string, userId: string) => string;
    userRoles: (orgId: string, userId: string) => string;
    orgSettings: (orgId: string, key: string) => string;
    orgFeatureFlags: (orgId: string) => string;
    orgSecurityPolicies: (orgId: string) => string;
    currencies: () => string;
    popularCurrencies: () => string;
    currencyByCode: (code: string) => string;
    rateCardPattern: (orgId: string) => string;
    userPermissionsPattern: (orgId: string) => string;
    orgSettingsPattern: (orgId: string) => string;
};
//# sourceMappingURL=cache.service.d.ts.map