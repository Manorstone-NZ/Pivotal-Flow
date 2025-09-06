/**
 * Cache compatibility shim
 * Re-exports Redis client wrapper from shared or provides minimal adapter
 */

export interface CacheAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  health(): Promise<boolean>;
}

class MinimalCacheAdapter implements CacheAdapter {
  private cache = new Map<string, { value: string; expires?: number | undefined }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async health(): Promise<boolean> {
    return true;
  }
}

// Check if shared cache exists
let sharedCache: { getCache: () => CacheAdapter } | null = null;
try {
  // Try to import from shared, but don't await at module level
  sharedCache = require('@pivotal-flow/shared/redis');
} catch {
  // Shared cache doesn't exist yet, we'll create a minimal implementation
}

// Export the cache instance
export function getCache(): CacheAdapter {
  if (sharedCache?.getCache) {
    return sharedCache.getCache();
  }
  
  return new MinimalCacheAdapter();
}
