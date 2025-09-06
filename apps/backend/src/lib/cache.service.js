import { createClient } from 'redis';
import { logger } from './logger.js';
/**
 * Redis Cache Service
 *
 * Provides caching functionality for:
 * - Rate cards and pricing data
 * - User permissions and roles
 * - Organization settings and feature flags
 * - Frequently accessed business data
 */
export class CacheService {
    client; // Redis client instance
    isConnected = false;
    keyPrefix;
    defaultTTL;
    constructor(options = {}) {
        const { host = 'localhost', port = 6379, password, db = 0, keyPrefix = 'pivotal-flow:', ttl = 300 // 5 minutes default
         } = options;
        this.keyPrefix = keyPrefix;
        this.defaultTTL = ttl;
        const clientOptions = {
            socket: {
                host,
                port
            },
            database: db
        };
        if (password) {
            clientOptions.password = password;
        }
        this.client = createClient(clientOptions);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.client.on('connect', () => {
            logger.info('Redis client connected');
            this.isConnected = true;
        });
        this.client.on('ready', () => {
            logger.info('Redis client ready');
            this.isConnected = true;
        });
        this.client.on('error', (error) => {
            logger.error('Redis client error:', error);
            this.isConnected = false;
        });
        this.client.on('end', () => {
            logger.info('Redis client disconnected');
            this.isConnected = false;
        });
        this.client.on('reconnecting', () => {
            logger.info('Redis client reconnecting...');
        });
    }
    /**
     * Connect to Redis
     */
    async connect() {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            }
            catch (error) {
                logger.error('Failed to connect to Redis:', error);
                throw error;
            }
        }
    }
    /**
     * Disconnect from Redis
     */
    async disconnect() {
        if (this.isConnected) {
            try {
                await this.client.quit();
                this.isConnected = false;
            }
            catch (error) {
                logger.error('Failed to disconnect from Redis:', error);
            }
        }
    }
    /**
     * Generate cache key with prefix
     */
    generateKey(key) {
        return `${this.keyPrefix}${key}`;
    }
    /**
     * Set cache item with TTL
     */
    async set(key, data, ttl) {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache set');
            return;
        }
        try {
            const cacheItem = {
                data,
                timestamp: Date.now(),
                ttl: ttl ?? this.defaultTTL
            };
            const serialized = JSON.stringify(cacheItem);
            const fullKey = this.generateKey(key);
            await this.client.setEx(fullKey, ttl ?? this.defaultTTL, serialized);
            logger.debug(`Cache set: ${fullKey} (TTL: ${ttl ?? this.defaultTTL}s)`);
        }
        catch (error) {
            logger.error('Failed to set cache item:', error);
        }
    }
    /**
     * Get cache item
     */
    async get(key) {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache get');
            return null;
        }
        try {
            const fullKey = this.generateKey(key);
            const value = await this.client.get(fullKey);
            if (!value) {
                return null;
            }
            const cacheItem = JSON.parse(value);
            // Check if item has expired
            const now = Date.now();
            const age = (now - cacheItem.timestamp) / 1000; // Age in seconds
            if (age > cacheItem.ttl) {
                // Item has expired, remove it
                await this.delete(key);
                return null;
            }
            logger.debug(`Cache hit: ${fullKey}`);
            return cacheItem.data;
        }
        catch (error) {
            logger.error('Failed to get cache item:', error);
            return null;
        }
    }
    /**
     * Delete cache item
     */
    async delete(key) {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache delete');
            return;
        }
        try {
            const fullKey = this.generateKey(key);
            await this.client.del(fullKey);
            logger.debug(`Cache deleted: ${fullKey}`);
        }
        catch (error) {
            logger.error('Failed to delete cache item:', error);
        }
    }
    /**
     * Delete multiple cache items by pattern
     */
    async deletePattern(pattern) {
        if (!this.isConnected) {
            logger.warn('Redis not connected, skipping cache pattern delete');
            return;
        }
        try {
            const fullPattern = this.generateKey(pattern);
            const keys = await this.client.keys(fullPattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                logger.debug(`Cache pattern deleted: ${fullPattern} (${keys.length} keys)`);
            }
        }
        catch (error) {
            logger.error('Failed to delete cache pattern:', error);
        }
    }
    /**
     * Check if cache item exists
     */
    async exists(key) {
        if (!this.isConnected) {
            return false;
        }
        try {
            const fullKey = this.generateKey(key);
            const result = await this.client.exists(fullKey);
            return result === 1;
        }
        catch (error) {
            logger.error('Failed to check cache existence:', error);
            return false;
        }
    }
    /**
     * Get cache item TTL
     */
    async getTTL(key) {
        if (!this.isConnected) {
            return -1;
        }
        try {
            const fullKey = this.generateKey(key);
            const ttl = await this.client.ttl(fullKey);
            return typeof ttl === 'number' ? ttl : -1;
        }
        catch (error) {
            logger.error('Failed to get cache TTL:', error);
            return -1;
        }
    }
    /**
     * Set cache item TTL
     */
    async setTTL(key, ttl) {
        if (!this.isConnected) {
            return;
        }
        try {
            const fullKey = this.generateKey(key);
            await this.client.expire(fullKey, ttl);
            logger.debug(`Cache TTL updated: ${fullKey} (TTL: ${ttl}s)`);
        }
        catch (error) {
            logger.error('Failed to set cache TTL:', error);
        }
    }
    /**
     * Get cache statistics
     */
    async getStats() {
        if (!this.isConnected) {
            return {
                connected: false,
                keyCount: 0,
                memoryUsage: '0B',
                hitRate: 0
            };
        }
        try {
            const info = await this.client.info('memory');
            const keys = await this.client.dbSize();
            // Parse memory info (simplified)
            const memoryMatch = (info).match(/used_memory_human:(\S+)/);
            const memoryUsage = memoryMatch?.[1] ?? '0B';
            return {
                connected: true,
                keyCount: typeof keys === 'number' ? keys : 0,
                memoryUsage: memoryUsage || '0B',
                hitRate: 0 // Would need to implement hit tracking
            };
        }
        catch (error) {
            logger.error('Failed to get cache stats:', error);
            return {
                connected: false,
                keyCount: 0,
                memoryUsage: '0B',
                hitRate: 0
            };
        }
    }
    /**
     * Clear all cache data
     */
    async clear() {
        if (!this.isConnected) {
            return;
        }
        try {
            await this.client.flushDb();
            logger.info('Cache cleared');
        }
        catch (error) {
            logger.error('Failed to clear cache:', error);
        }
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            await this.client.ping();
            return true;
        }
        catch (error) {
            logger.error('Cache health check failed:', error);
            return false;
        }
    }
}
// Cache key generators for common use cases
export const CacheKeys = {
    // Rate card keys
    rateCard: (orgId, rateCardId) => `rate-card:${orgId}:${rateCardId}`,
    rateCardItems: (orgId, rateCardId) => `rate-card-items:${orgId}:${rateCardId}`,
    activeRateCard: (orgId, date) => `active-rate-card:${orgId}:${date}`,
    // User permission keys
    userPermissions: (orgId, userId) => `user-permissions:${orgId}:${userId}`,
    userRoles: (orgId, userId) => `user-roles:${orgId}:${userId}`,
    // Organization settings keys
    orgSettings: (orgId, key) => `org-settings:${orgId}:${key}`,
    orgFeatureFlags: (orgId) => `org-feature-flags:${orgId}`,
    orgSecurityPolicies: (orgId) => `org-security-policies:${orgId}`,
    // Currency keys
    currencies: () => 'currencies:all',
    popularCurrencies: () => 'currencies:popular',
    currencyByCode: (code) => `currency:${code}`,
    // General cache invalidation patterns
    rateCardPattern: (orgId) => `rate-card:${orgId}:*`,
    userPermissionsPattern: (orgId) => `user-permissions:${orgId}:*`,
    orgSettingsPattern: (orgId) => `org-settings:${orgId}:*`
};
//# sourceMappingURL=cache.service.js.map