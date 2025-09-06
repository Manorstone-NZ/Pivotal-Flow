import { Redis } from 'ioredis';
/**
 * Redis connection configuration
 */
export interface RedisConfig {
    host: string;
    port: number;
    password?: string | undefined;
    db: number;
    keyPrefix?: string | undefined;
    maxRetriesPerRequest?: number | undefined;
    lazyConnect?: boolean | undefined;
}
/**
 * Default Redis configuration
 */
export declare const defaultRedisConfig: RedisConfig;
/**
 * Get or create the Redis client instance
 * Ensures only one instance exists across the application
 */
export declare function getRedisClient(config?: Partial<RedisConfig>): Redis;
/**
 * Close the Redis client connection
 * Should be called during application shutdown
 */
export declare function closeRedisClient(): Promise<void>;
/**
 * Test Redis connectivity
 * Returns true if connection is successful, false otherwise
 */
export declare function testRedisConnection(): Promise<boolean>;
/**
 * Get Redis connection info for health checks
 */
export declare function getRedisHealth(): Promise<{
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    latency: number;
}>;
/**
 * Cache utility functions
 */
export declare const cache: {
    /**
     * Set a key with TTL
     */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /**
     * Get a key value
     */
    get(key: string): Promise<string | null>;
    /**
     * Delete a key
     */
    del(key: string): Promise<number>;
    /**
     * Check if a key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Set key expiration
     */
    expire(key: string, seconds: number): Promise<boolean>;
};
export { Redis };
//# sourceMappingURL=redis.d.ts.map