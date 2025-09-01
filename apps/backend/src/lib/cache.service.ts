import { createClient } from 'redis';
import { logger } from './logger.js';

export interface CacheOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  ttl?: number; // Default TTL in seconds
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
export class CacheService {
  private client: ReturnType<typeof createClient>; // Redis client instance
  private isConnected: boolean = false;
  private readonly keyPrefix: string;
  private readonly defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    const {
      host = 'localhost',
      port = 6379,
      password,
      db = 0,
      keyPrefix = 'pivotal-flow:',
      ttl = 300 // 5 minutes default
    } = options;

    this.keyPrefix = keyPrefix;
    this.defaultTTL = ttl;

    const clientOptions: {
      socket: { host: string; port: number };
      database: number;
      password?: string;
    } = {
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

  private setupEventHandlers(): void {
    this.client.on('connect', (): void => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', (): void => {
      logger.info('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (error): void => {
      logger.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', (): void => {
      logger.info('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (): void => {
      logger.info('Redis client reconnecting...');
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error) {
        logger.error('Failed to disconnect from Redis:', error);
      }
    }
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Set cache item with TTL
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL
      };

      const serialized = JSON.stringify(cacheItem);
      const fullKey = this.generateKey(key);
      
      await this.client.setEx(fullKey, ttl ?? this.defaultTTL, serialized);
      logger.debug(`Cache set: ${fullKey} (TTL: ${ttl ?? this.defaultTTL}s)`);
    } catch (error) {
      logger.error('Failed to set cache item:', error);
    }
  }

  /**
   * Get cache item
   */
  async get<T>(key: string): Promise<T | null> {
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

      const cacheItem: CacheItem<T> = JSON.parse(value as string);
      
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
    } catch (error) {
      logger.error('Failed to get cache item:', error);
      return null;
    }
  }

  /**
   * Delete cache item
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache delete');
      return;
    }

    try {
      const fullKey = this.generateKey(key);
      await this.client.del(fullKey);
      logger.debug(`Cache deleted: ${fullKey}`);
    } catch (error) {
      logger.error('Failed to delete cache item:', error);
    }
  }

  /**
   * Delete multiple cache items by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
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
    } catch (error) {
      logger.error('Failed to delete cache pattern:', error);
    }
  }

  /**
   * Check if cache item exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check cache existence:', error);
      return false;
    }
  }

  /**
   * Get cache item TTL
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isConnected) {
      return -1;
    }

    try {
      const fullKey = this.generateKey(key);
      const ttl = await this.client.ttl(fullKey);
      return typeof ttl === 'number' ? ttl : -1;
    } catch (error) {
      logger.error('Failed to get cache TTL:', error);
      return -1;
    }
  }

  /**
   * Set cache item TTL
   */
  async setTTL(key: string, ttl: number): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const fullKey = this.generateKey(key);
      await this.client.expire(fullKey, ttl);
      logger.debug(`Cache TTL updated: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Failed to set cache TTL:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage: string;
    hitRate: number;
  }> {
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
      const memoryMatch = (info as string).match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch?.[1] ?? '0B';
      
      return {
        connected: true,
        keyCount: typeof keys === 'number' ? keys : 0,
        memoryUsage: memoryUsage || '0B',
        hitRate: 0 // Would need to implement hit tracking
      };
    } catch (error) {
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
  async clear(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.flushDb();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }
}

// Cache key generators for common use cases
export const CacheKeys = {
  // Rate card keys
  rateCard: (orgId: string, rateCardId: string): string => `rate-card:${orgId}:${rateCardId}`,
  rateCardItems: (orgId: string, rateCardId: string): string => `rate-card-items:${orgId}:${rateCardId}`,
  activeRateCard: (orgId: string, date: string): string => `active-rate-card:${orgId}:${date}`,
  
  // User permission keys
  userPermissions: (orgId: string, userId: string): string => `user-permissions:${orgId}:${userId}`,
  userRoles: (orgId: string, userId: string): string => `user-roles:${orgId}:${userId}`,
  
  // Organization settings keys
  orgSettings: (orgId: string, key: string): string => `org-settings:${orgId}:${key}`,
  orgFeatureFlags: (orgId: string): string => `org-feature-flags:${orgId}`,
  orgSecurityPolicies: (orgId: string): string => `org-security-policies:${orgId}`,
  
  // Currency keys
  currencies: (): string => 'currencies:all',
  popularCurrencies: (): string => 'currencies:popular',
  currencyByCode: (code: string): string => `currency:${code}`,
  
  // General cache invalidation patterns
  rateCardPattern: (orgId: string): string => `rate-card:${orgId}:*`,
  userPermissionsPattern: (orgId: string): string => `user-permissions:${orgId}:*`,
  orgSettingsPattern: (orgId: string): string => `org-settings:${orgId}:*`
};
