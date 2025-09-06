// Cache layer with Redis getOrSet, key ttl, fn, and bust helpers
import { required } from '../utils/strict.js';
export class CacheError extends Error {
    code;
    originalError;
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'CacheError';
    }
}
export class CacheProvider {
}
/**
 * Cache key builder using pivotal:org:resource scheme
 */
export class CacheKeyBuilder {
    static KEY_SEPARATOR = ':';
    static DEFAULT_PREFIX = 'pivotal';
    static build(options, prefix) {
        const parts = [
            prefix || this.DEFAULT_PREFIX,
            options.organizationId,
            options.resource
        ];
        if (options.identifier) {
            parts.push(options.identifier);
        }
        if (options.action) {
            parts.push(options.action);
        }
        return parts.join(this.KEY_SEPARATOR);
    }
    static buildUserKey(organizationId, userId, action) {
        return this.build({
            organizationId,
            resource: 'user',
            identifier: userId,
            action
        });
    }
    static buildRoleKey(organizationId, roleId, action) {
        return this.build({
            organizationId,
            resource: 'role',
            identifier: roleId,
            action
        });
    }
    static buildUserListKey(organizationId, filters) {
        const filterHash = filters ? this.hashFilters(filters) : 'default';
        return this.build({
            organizationId,
            resource: 'users',
            action: `list_${filterHash}`
        });
    }
    static buildAuditKey(organizationId, entityType, entityId) {
        return this.build({
            organizationId,
            resource: 'audit',
            identifier: entityType,
            action: entityId
        });
    }
    static buildOrgSettingsKey(organizationId) {
        return this.build({
            organizationId,
            resource: 'org',
            action: 'settings'
        });
    }
    static buildOrgRolesKey(organizationId) {
        return this.build({
            organizationId,
            resource: 'org',
            action: 'roles'
        });
    }
    static buildRolePermissionsKey(organizationId, roleId) {
        return this.build({
            organizationId,
            resource: 'org',
            identifier: 'role',
            action: `${roleId}:perms`
        });
    }
    static hashFilters(filters) {
        const sorted = Object.keys(filters)
            .sort()
            .map(key => `${key}=${JSON.stringify(filters[key])}`)
            .join('|');
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < sorted.length; i++) {
            const char = sorted.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
/**
 * Cache wrapper with getOrSet, ttl, and bust helpers
 */
export class CacheWrapper {
    provider;
    options;
    inFlightRequests = new Map();
    constructor(provider, options = {}) {
        this.provider = provider;
        this.options = options;
    }
    /**
     * Get value from cache, or set it using the provided function
     * Implements single flight pattern to prevent stampede
     */
    async getOrSet(key, fn, ttl) {
        // Check if request is already in flight
        if (this.inFlightRequests.has(key)) {
            return required(this.inFlightRequests.get(key), `In-flight request for key ${key} should exist`);
        }
        // Create new request promise
        const requestPromise = this._getOrSetInternal(key, fn, ttl);
        this.inFlightRequests.set(key, requestPromise);
        try {
            const result = await requestPromise;
            return result;
        }
        finally {
            // Clean up in-flight request
            this.inFlightRequests.delete(key);
        }
    }
    /**
     * Internal implementation of getOrSet
     */
    async _getOrSetInternal(key, fn, ttl) {
        try {
            // Try to get from cache first
            const cached = await this.provider.get(key);
            if (cached !== null) {
                // Record cache hit
                this.recordCacheHit();
                return cached;
            }
            // Record cache miss
            this.recordCacheMiss();
            // Cache miss, execute function
            const value = await fn();
            // Calculate TTL with optional jitter
            const finalTtl = this.calculateJitteredTtl(ttl || this.options.ttl);
            // Store in cache
            await this.provider.set(key, value, finalTtl);
            // Record cache set
            this.recordCacheSet();
            return value;
        }
        catch (error) {
            // Record cache error
            this.recordCacheError();
            // Log error but don't fail the operation
            console.warn('Cache operation failed:', {
                operation: 'getOrSet',
                key,
                error: error instanceof Error ? error.message : String(error)
            });
            // Fallback to direct function execution
            return await fn();
        }
    }
    /**
     * Calculate TTL with optional jitter to prevent stampede
     */
    calculateJitteredTtl(baseTtl) {
        if (!baseTtl || !this.options.jitter) {
            return baseTtl;
        }
        const jitterRange = this.options.jitterRange || Math.max(1, Math.floor(baseTtl * 0.1));
        const jitter = Math.floor(Math.random() * jitterRange);
        return baseTtl + jitter;
    }
    /**
     * Get value from cache with TTL check
     */
    async getWithTtl(key) {
        try {
            const [value, ttl] = await Promise.all([
                this.provider.get(key),
                this.provider.getTtl(key)
            ]);
            return { value, ttl };
        }
        catch (error) {
            console.warn('Cache TTL check failed:', {
                operation: 'getWithTtl',
                key,
                error: error instanceof Error ? error.message : String(error)
            });
            return { value: null, ttl: -1 };
        }
    }
    /**
     * Bust cache for specific keys or patterns
     */
    async bust(options) {
        try {
            if (typeof options === 'string') {
                // Single key
                await this.provider.delete(options);
            }
            else if (Array.isArray(options)) {
                // Multiple keys
                await Promise.all(options.map(key => this.provider.delete(key)));
            }
            else {
                // Pattern-based busting
                const pattern = CacheKeyBuilder.build(options);
                await this.bustPattern(pattern);
            }
        }
        catch (error) {
            console.warn('Cache bust failed:', {
                operation: 'bust',
                options,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Bust cache for organization (clears all org-related cache)
     */
    async bustOrganization(organizationId) {
        const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:*`;
        await this.bustPattern(pattern);
    }
    /**
     * Bust cache for specific resource type
     */
    async bustResource(organizationId, resource) {
        const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:${resource}:*`;
        await this.bustPattern(pattern);
    }
    /**
     * Bust cache for specific entity
     */
    async bustEntity(organizationId, resource, identifier) {
        const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:${resource}:${identifier}:*`;
        await this.bustPattern(pattern);
    }
    /**
     * Bust cache by pattern (implementation depends on cache provider)
     */
    async bustPattern(_pattern) {
        // This is a simplified implementation
        // In practice, you'd need to implement pattern-based deletion
        // or use cache provider-specific methods
        // Cache bust pattern: ${pattern}
    }
    /**
     * Get cache metrics
     */
    async getMetrics() {
        return await this.provider.getMetrics();
    }
    /**
     * Reset cache metrics
     */
    async resetMetrics() {
        await this.provider.resetMetrics();
    }
    /**
     * Bust organization-level cache (settings, roles, permissions)
     */
    async bustOrgCache(organizationId) {
        const keys = [
            CacheKeyBuilder.buildOrgSettingsKey(organizationId),
            CacheKeyBuilder.buildOrgRolesKey(organizationId)
        ];
        await this.bust(keys);
    }
    /**
     * Bust role-specific cache
     */
    async bustRoleCache(organizationId, roleId) {
        const keys = [
            CacheKeyBuilder.buildRolePermissionsKey(organizationId, roleId),
            CacheKeyBuilder.buildOrgRolesKey(organizationId)
        ];
        await this.bust(keys);
    }
    /**
     * Bust user cache with explicit invalidation
     */
    async bustUserCache(organizationId, userId) {
        const keys = [
            CacheKeyBuilder.buildUserKey(organizationId, userId),
            CacheKeyBuilder.buildUserKey(organizationId, userId, 'profile'),
            CacheKeyBuilder.buildUserKey(organizationId, userId, 'roles')
        ];
        await this.bust(keys);
    }
    /**
     * Record cache hit for metrics
     */
    async recordCacheHit() {
        try {
            // Import metrics dynamically to avoid circular dependencies
            const { globalMetrics } = await import('../metrics/index.js');
            globalMetrics.recordCacheHit();
        }
        catch (error) {
            // Silently fail if metrics not available
        }
    }
    /**
     * Record cache miss for metrics
     */
    async recordCacheMiss() {
        try {
            const { globalMetrics } = await import('../metrics/index.js');
            globalMetrics.recordCacheMiss();
        }
        catch (error) {
            // Silently fail if metrics not available
        }
    }
    /**
     * Record cache set for metrics
     */
    async recordCacheSet() {
        try {
            const { globalMetrics } = await import('../metrics/index.js');
            globalMetrics.recordCacheSet();
        }
        catch (error) {
            // Silently fail if metrics not available
        }
    }
    /**
     * Record cache error for metrics
     */
    async recordCacheError() {
        try {
            const { globalMetrics } = await import('../metrics/index.js');
            globalMetrics.recordCacheError();
        }
        catch (error) {
            // Silently fail if metrics not available
        }
    }
    /**
     * Check if cache is healthy
     */
    async healthCheck() {
        try {
            const testKey = 'health:check';
            const testValue = { timestamp: Date.now() };
            await this.provider.set(testKey, testValue, 10);
            const retrieved = await this.provider.get(testKey);
            await this.provider.delete(testKey);
            return retrieved !== null && JSON.stringify(retrieved) === JSON.stringify(testValue);
        }
        catch (error) {
            return false;
        }
    }
}
/**
 * Memory-based cache provider for testing and development
 */
export class MemoryCacheProvider {
    cache = new Map();
    metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        busts: 0,
        errors: 0
    };
    async get(key) {
        try {
            const item = this.cache.get(key);
            if (!item) {
                this.metrics.misses++;
                return null;
            }
            if (Date.now() > item.expires) {
                this.cache.delete(key);
                this.metrics.misses++;
                return null;
            }
            this.metrics.hits++;
            return item.value;
        }
        catch (error) {
            this.metrics.errors++;
            throw new CacheError('Failed to get from cache', 'GET_ERROR', error);
        }
    }
    async set(key, value, ttl = 60) {
        try {
            const expires = Date.now() + (ttl * 1000);
            this.cache.set(key, { value, expires });
            this.metrics.sets++;
        }
        catch (error) {
            this.metrics.errors++;
            throw new CacheError('Failed to set cache', 'SET_ERROR', error);
        }
    }
    async delete(key) {
        try {
            this.cache.delete(key);
            this.metrics.busts++;
        }
        catch (error) {
            this.metrics.errors++;
            throw new CacheError('Failed to delete from cache', 'DELETE_ERROR', error);
        }
    }
    async exists(key) {
        const item = this.cache.get(key);
        if (!item)
            return false;
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    async getTtl(key) {
        const item = this.cache.get(key);
        if (!item)
            return -1;
        const remaining = Math.ceil((item.expires - Date.now()) / 1000);
        return Math.max(0, remaining);
    }
    async getMetrics() {
        return { ...this.metrics };
    }
    async resetMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            busts: 0,
            errors: 0
        };
    }
}
export { RedisProvider } from './redis-provider.js';
//# sourceMappingURL=index.js.map