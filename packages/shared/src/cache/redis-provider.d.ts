import type { CacheProvider, CacheMetrics } from './index.js';
/**
 * Redis-based cache provider implementation
 * Connects to Redis and provides caching operations with metrics
 */
export declare class RedisProvider implements CacheProvider {
    private metrics;
    /**
     * Get value from Redis cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in Redis cache with optional TTL
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete key from Redis cache
     */
    delete(key: string): Promise<void>;
    /**
     * Check if key exists in Redis cache
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get TTL for a key in seconds
     */
    getTtl(key: string): Promise<number>;
    /**
     * Get current cache metrics
     */
    getMetrics(): Promise<CacheMetrics>;
    /**
     * Reset cache metrics
     */
    resetMetrics(): Promise<void>;
    /**
     * Delete multiple keys by pattern
     */
    deletePattern(pattern: string): Promise<number>;
    /**
     * Health check for Redis connection
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=redis-provider.d.ts.map