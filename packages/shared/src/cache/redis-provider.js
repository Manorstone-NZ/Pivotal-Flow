import { getRedisClient } from '../redis.js';
/**
 * Redis-based cache provider implementation
 * Connects to Redis and provides caching operations with metrics
 */
export class RedisProvider {
    metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        busts: 0,
        errors: 0
    };
    /**
     * Get value from Redis cache
     */
    async get(key) {
        try {
            const client = getRedisClient();
            const value = await client.get(key);
            if (value === null) {
                this.metrics.misses++;
                return null;
            }
            this.metrics.hits++;
            return JSON.parse(value);
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis get error:', {
                key,
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }
    /**
     * Set value in Redis cache with optional TTL
     */
    async set(key, value, ttl) {
        try {
            const client = getRedisClient();
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await client.setex(key, ttl, serializedValue);
            }
            else {
                await client.set(key, serializedValue);
            }
            this.metrics.sets++;
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis set error:', {
                key,
                ttl,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Delete key from Redis cache
     */
    async delete(key) {
        try {
            const client = getRedisClient();
            await client.del(key);
            this.metrics.busts++;
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis delete error:', {
                key,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Check if key exists in Redis cache
     */
    async exists(key) {
        try {
            const client = getRedisClient();
            const result = await client.exists(key);
            return result === 1;
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis exists error:', {
                key,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
    /**
     * Get TTL for a key in seconds
     */
    async getTtl(key) {
        try {
            const client = getRedisClient();
            const ttl = await client.ttl(key);
            return ttl;
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis TTL error:', {
                key,
                error: error instanceof Error ? error.message : String(error)
            });
            return -1;
        }
    }
    /**
     * Get current cache metrics
     */
    async getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset cache metrics
     */
    async resetMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            busts: 0,
            errors: 0
        };
    }
    /**
     * Delete multiple keys by pattern
     */
    async deletePattern(pattern) {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            const deleted = await client.del(...keys);
            this.metrics.busts += deleted;
            return deleted;
        }
        catch (error) {
            this.metrics.errors++;
            console.warn('Redis delete pattern error:', {
                pattern,
                error: error instanceof Error ? error.message : String(error)
            });
            return 0;
        }
    }
    /**
     * Health check for Redis connection
     */
    async healthCheck() {
        try {
            const testKey = 'health:check';
            const testValue = { timestamp: Date.now() };
            await this.set(testKey, testValue, 10);
            const retrieved = await this.get(testKey);
            await this.delete(testKey);
            return retrieved !== null && JSON.stringify(retrieved) === JSON.stringify(testValue);
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=redis-provider.js.map