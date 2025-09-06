import type { CacheApi } from '@pivotal-flow/shared';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

import { CacheService, type CacheOptions } from '../lib/cache.service.js';
import { logger } from '../lib/logger.js';

declare module 'fastify' {
  interface FastifyInstance {
    cache: CacheApi;
  }
}

export interface CachePluginOptions extends CacheOptions {
  enabled?: boolean;
}

/**
 * Cache Plugin for Fastify
 * 
 * Integrates Redis caching service with Fastify application
 */
export const cachePlugin: FastifyPluginCallback<CachePluginOptions> = async (
  fastify: FastifyInstance,
  options: CachePluginOptions
) => {
  const { enabled = true, ...cacheOptions } = options;

  if (!enabled) {
    logger.info('Cache plugin disabled');
    return;
  }

  try {
    // Create cache service instance
    const cacheService = new CacheService(cacheOptions);
    
    // Connect to Redis
    await cacheService.connect();
    
    // Decorate fastify with cache service
    fastify.decorate('cache', cacheService);
    
    // Add cache health check route
    fastify.get('/health/cache', {
      schema: {
        summary: 'Cache health check',
        description: 'Check Redis cache connection and status',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              connected: { type: 'boolean' },
              keyCount: { type: 'number' },
              memoryUsage: { type: 'string' },
              hitRate: { type: 'number' }
            }
          }
        }
      }
    }, async () => {
      const stats = await cacheService.getStats();
      return {
        status: stats.connected ? 'healthy' : 'unhealthy',
        ...stats
      };
    });

    // Add cache management routes (admin only)
    fastify.get('/admin/cache/stats', async () => {
      return await cacheService.getStats();
    });

    fastify.post('/admin/cache/clear', async () => {
      await cacheService.clear();
      return { message: 'Cache cleared successfully' };
    });

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      logger.info('Disconnecting from Redis...');
      await cacheService.disconnect();
    });

    logger.info('Cache plugin registered successfully');
  } catch (error) {
    logger.error('Failed to initialize cache plugin:', error);
    
    // Create a proper fallback cache service that handles all operations
    const fallbackCache: CacheApi = {
      async get<T>(key: string): Promise<T | null> {
        logger.warn(`Cache get operation called but Redis is not available: ${key}`);
        return null;
      },
      async set<T>(key: string, _value: T, _ttl?: number): Promise<void> {
        logger.warn(`Cache set operation called but Redis is not available: ${key}`);
      },
      async delete(key: string): Promise<void> {
        logger.warn(`Cache delete operation called but Redis is not available: ${key}`);
      },
      async healthCheck(): Promise<boolean> {
        return false;
      },
      async getStats() {
        return {
          connected: false,
          keyCount: 0,
          memoryUsage: '0B',
          hitRate: 0
        };
      },
      async clear(): Promise<void> {
        logger.warn('Cache clear operation called but Redis is not available');
      }
    };
    
    fastify.decorate('cache', fallbackCache);
    
    // Add health check route that shows cache is unavailable
    fastify.get('/health/cache', async () => {
      return {
        status: 'unavailable',
        connected: false,
        keyCount: 0,
        memoryUsage: '0B',
        hitRate: 0,
        error: 'Redis connection failed during startup'
      };
    });
  }
};
