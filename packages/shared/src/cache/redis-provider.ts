import { getRedisClient } from '../redis.js';

import type { CacheProvider, CacheMetrics } from './index.js';

/**
 * Redis-based cache provider implementation
 * Connects to Redis and provides caching operations with metrics
 */
export class RedisProvider implements CacheProvider {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    busts: 0,
    errors: 0
  };

  /**
   * Get value from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      
      if (value === null) {
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
      return null;
    }
  }

  /**
   * Set value in Redis cache with optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const client = getRedisClient();
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await client.setex(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
      
      this.metrics.sets++;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
    }
  }

  /**
   * Delete key from Redis cache
   */
  async delete(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
      this.metrics.busts++;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
    }
  }

  /**
   * Check if key exists in Redis cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
      return false;
    }
  }

  /**
   * Get TTL for a key in seconds
   */
  async getTtl(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      const ttl = await client.ttl(key);
      return ttl;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
      return -1;
    }
  }

  /**
   * Get current cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    return { ...this.metrics };
  }

  /**
   * Reset cache metrics
   */
  async resetMetrics(): Promise<void> {
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
  async deletePattern(pattern: string): Promise<number> {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const deleted = await client.del(...keys);
      this.metrics.busts += deleted;
      return deleted;
    } catch (error) {
      this.metrics.errors++;
      // Note: Using console.warn for Redis errors as this is infrastructure logging
      return 0;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      await this.delete(testKey);
      
      return retrieved !== null && JSON.stringify(retrieved) === JSON.stringify(testValue);
    } catch (error) {
      return false;
    }
  }
}
