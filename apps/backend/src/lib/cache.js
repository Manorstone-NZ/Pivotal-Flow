/**
 * Cache compatibility shim
 * Re-exports Redis client wrapper from shared or provides minimal adapter
 */
class MinimalCacheAdapter {
    cache = new Map();
    async get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (item.expires && Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttl) {
        const expires = ttl ? Date.now() + (ttl * 1000) : undefined;
        this.cache.set(key, { value, expires });
    }
    async del(key) {
        this.cache.delete(key);
    }
    async health() {
        return true;
    }
}
// Check if shared cache exists
let sharedCache = null;
try {
    // Try to import from shared, but don't await at module level
    sharedCache = require('@pivotal-flow/shared/redis');
}
catch {
    // Shared cache doesn't exist yet, we'll create a minimal implementation
}
// Export the cache instance
export function getCache() {
    if (sharedCache?.getCache) {
        return sharedCache.getCache();
    }
    return new MinimalCacheAdapter();
}
//# sourceMappingURL=cache.js.map