// Cache layer with Redis getOrSet, key ttl, fn, and bust helpers

import type { CacheMetrics } from '../metrics/index.js';
import { required } from '../utils/strict.js';

// Re-export types from types module
export type { CacheApi } from './types.js';

// Re-export CacheMetrics from metrics module to maintain compatibility
export type { CacheMetrics } from '../metrics/index.js';

export interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
  jitter?: boolean; // Enable jittered TTL to prevent stampede
  jitterRange?: number; // Jitter range in seconds (default: 10% of TTL)
}

export interface CacheKeyOptions {
  organizationId: string;
  resource: string;
  identifier?: string | undefined;
  action?: string | undefined;
}

export class CacheError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'CacheError';
  }
}

export abstract class CacheProvider {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract getTtl(key: string): Promise<number>;
  
  // Metrics
  abstract getMetrics(): Promise<CacheMetrics>;
  abstract resetMetrics(): Promise<void>;
}

/**
 * Cache key builder using pivotal:org:resource scheme
 */
export class CacheKeyBuilder {
  private static readonly KEY_SEPARATOR = ':';
  private static readonly DEFAULT_PREFIX = 'pivotal';

  static build(options: CacheKeyOptions, prefix?: string): string {
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

  static buildUserKey(organizationId: string, userId?: string, action?: string): string {
    return this.build({
      organizationId,
      resource: 'user',
      identifier: userId,
      action
    });
  }

  static buildRoleKey(organizationId: string, roleId?: string, action?: string): string {
    return this.build({
      organizationId,
      resource: 'role',
      identifier: roleId,
      action
    });
  }

  static buildUserListKey(organizationId: string, filters?: Record<string, unknown>): string {
    const filterHash = filters ? this.hashFilters(filters) : 'default';
    return this.build({
      organizationId,
      resource: 'users',
      action: `list_${filterHash}`
    });
  }

  static buildAuditKey(organizationId: string, entityType?: string, entityId?: string): string {
    return this.build({
      organizationId,
      resource: 'audit',
      identifier: entityType,
      action: entityId
    });
  }

  static buildOrgSettingsKey(organizationId: string): string {
    return this.build({
      organizationId,
      resource: 'org',
      action: 'settings'
    });
  }

  static buildOrgRolesKey(organizationId: string): string {
    return this.build({
      organizationId,
      resource: 'org',
      action: 'roles'
    });
  }

  static buildRolePermissionsKey(organizationId: string, roleId: string): string {
    return this.build({
      organizationId,
      resource: 'org',
      identifier: 'role',
      action: `${roleId}:perms`
    });
  }

  private static hashFilters(filters: Record<string, unknown>): string {
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
  private readonly inFlightRequests = new Map<string, Promise<any>>();
  
  constructor(
    private readonly provider: CacheProvider,
    private readonly options: CacheOptions = {}
  ) {}

  /**
   * Get value from cache, or set it using the provided function
   * Implements single flight pattern to prevent stampede
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
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
    } finally {
      // Clean up in-flight request
      this.inFlightRequests.delete(key);
    }
  }

  /**
   * Internal implementation of getOrSet
   */
  private async _getOrSetInternal<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.provider.get<T>(key);
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
    } catch (error) {
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
  private calculateJitteredTtl(baseTtl?: number): number | undefined {
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
  async getWithTtl<T>(key: string): Promise<{ value: T | null; ttl: number }> {
    try {
      const [value, ttl] = await Promise.all([
        this.provider.get<T>(key),
        this.provider.getTtl(key)
      ]);

      return { value, ttl };
    } catch (error) {
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
  async bust(options: CacheKeyOptions | string | string[]): Promise<void> {
    try {
      if (typeof options === 'string') {
        // Single key
        await this.provider.delete(options);
      } else if (Array.isArray(options)) {
        // Multiple keys
        await Promise.all(options.map(key => this.provider.delete(key)));
      } else {
        // Pattern-based busting
        const pattern = CacheKeyBuilder.build(options);
        await this.bustPattern(pattern);
      }
    } catch (error) {
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
  async bustOrganization(organizationId: string): Promise<void> {
    const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:*`;
    await this.bustPattern(pattern);
  }

  /**
   * Bust cache for specific resource type
   */
  async bustResource(organizationId: string, resource: string): Promise<void> {
    const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:${resource}:*`;
    await this.bustPattern(pattern);
  }

  /**
   * Bust cache for specific entity
   */
  async bustEntity(organizationId: string, resource: string, identifier: string): Promise<void> {
    const pattern = `${this.options.prefix || 'pivotal'}:${organizationId}:${resource}:${identifier}:*`;
    await this.bustPattern(pattern);
  }

  /**
   * Bust cache by pattern (implementation depends on cache provider)
   */
  private async bustPattern(_pattern: string): Promise<void> {
    // This is a simplified implementation
    // In practice, you'd need to implement pattern-based deletion
    // or use cache provider-specific methods
    // Cache bust pattern: ${pattern}
  }

  /**
   * Get cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    return await this.provider.getMetrics();
  }

  /**
   * Reset cache metrics
   */
  async resetMetrics(): Promise<void> {
    await this.provider.resetMetrics();
  }

  /**
   * Bust organization-level cache (settings, roles, permissions)
   */
  async bustOrgCache(organizationId: string): Promise<void> {
    const keys = [
      CacheKeyBuilder.buildOrgSettingsKey(organizationId),
      CacheKeyBuilder.buildOrgRolesKey(organizationId)
    ];
    
    await this.bust(keys);
  }

  /**
   * Bust role-specific cache
   */
  async bustRoleCache(organizationId: string, roleId: string): Promise<void> {
    const keys = [
      CacheKeyBuilder.buildRolePermissionsKey(organizationId, roleId),
      CacheKeyBuilder.buildOrgRolesKey(organizationId)
    ];
    
    await this.bust(keys);
  }

  /**
   * Bust user cache with explicit invalidation
   */
  async bustUserCache(organizationId: string, userId: string): Promise<void> {
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
  private async recordCacheHit(): Promise<void> {
    try {
      // Import metrics dynamically to avoid circular dependencies
      const { globalMetrics } = await import('../metrics/index.js');
      globalMetrics.recordCacheHit();
    } catch (error) {
      // Silently fail if metrics not available
    }
  }

  /**
   * Record cache miss for metrics
   */
  private async recordCacheMiss(): Promise<void> {
    try {
      const { globalMetrics } = await import('../metrics/index.js');
      globalMetrics.recordCacheMiss();
    } catch (error) {
      // Silently fail if metrics not available
    }
  }

  /**
   * Record cache set for metrics
   */
  private async recordCacheSet(): Promise<void> {
    try {
      const { globalMetrics } = await import('../metrics/index.js');
      globalMetrics.recordCacheSet();
    } catch (error) {
      // Silently fail if metrics not available
    }
  }

  /**
   * Record cache error for metrics
   */
  private async recordCacheError(): Promise<void> {
    try {
      const { globalMetrics } = await import('../metrics/index.js');
      globalMetrics.recordCacheError();
    } catch (error) {
      // Silently fail if metrics not available
    }
  }

  /**
   * Check if cache is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      await this.provider.set(testKey, testValue, 10);
      const retrieved = await this.provider.get(testKey);
      await this.provider.delete(testKey);
      
      return retrieved !== null && JSON.stringify(retrieved) === JSON.stringify(testValue);
    } catch (error) {
      return false;
    }
  }
}

/**
 * Memory-based cache provider for testing and development
 */
export class MemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, { value: unknown; expires: number }>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    busts: 0,
    errors: 0
  };

  async get<T>(key: string): Promise<T | null> {
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
      return item.value as T;
    } catch (error) {
      this.metrics.errors++;
      throw new CacheError('Failed to get from cache', 'GET_ERROR', error);
    }
  }

  async set<T>(key: string, value: T, ttl: number = 60): Promise<void> {
    try {
      const expires = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expires });
      this.metrics.sets++;
    } catch (error) {
      this.metrics.errors++;
      throw new CacheError('Failed to set cache', 'SET_ERROR', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.metrics.busts++;
    } catch (error) {
      this.metrics.errors++;
      throw new CacheError('Failed to delete from cache', 'DELETE_ERROR', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async getTtl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return -1;
    
    const remaining = Math.ceil((item.expires - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  async getMetrics(): Promise<CacheMetrics> {
    return { ...this.metrics };
  }

  async resetMetrics(): Promise<void> {
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
