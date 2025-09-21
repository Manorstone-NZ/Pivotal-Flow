import { Type } from '@sinclair/typebox';
import { CacheService } from '../lib/cache.service.js';
import { logger } from '../lib/logger.js';
// TypeBox schemas for cache responses
const CacheStatsResponseSchema = Type.Object({
    status: Type.String(),
    connected: Type.Boolean(),
    keyCount: Type.Number(),
    memoryUsage: Type.String(),
    hitRate: Type.Number(),
});
const CacheClearResponseSchema = Type.Object({
    message: Type.String(),
});
const CacheUnavailableResponseSchema = Type.Object({
    status: Type.String(),
    connected: Type.Boolean(),
    keyCount: Type.Number(),
    memoryUsage: Type.String(),
    hitRate: Type.Number(),
    error: Type.String(),
});
/**
 * Cache Plugin for Fastify
 *
 * Integrates Redis caching service with Fastify application
 */
export const cachePlugin = async (fastify, options) => {
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
        fastify.decorate('cache', cacheService); // TODO: Fix Fastify decorator type compatibility
        // Add cache health check route
        fastify.get('/health/cache', {
            schema: {
                summary: 'Cache health check',
                description: 'Check Redis cache connection and status',
                response: {
                    200: CacheStatsResponseSchema,
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
        fastify.get('/admin/cache/stats', {
            schema: {
                summary: 'Get cache statistics',
                description: 'Get detailed cache statistics (admin only)',
                response: {
                    200: CacheStatsResponseSchema,
                }
            }
        }, async () => {
            return await cacheService.getStats();
        });
        fastify.post('/admin/cache/clear', {
            schema: {
                summary: 'Clear cache',
                description: 'Clear all cache entries (admin only)',
                response: {
                    200: CacheClearResponseSchema,
                }
            }
        }, async () => {
            await cacheService.clear();
            return { message: 'Cache cleared successfully' };
        });
        // Graceful shutdown
        fastify.addHook('onClose', async () => {
            logger.info('Disconnecting from Redis...');
            await cacheService.disconnect();
        });
        logger.info('Cache plugin registered successfully');
    }
    catch (error) {
        logger.error('Failed to initialize cache plugin:', error);
        // Create a proper fallback cache service that handles all operations
        const fallbackCache = {
            async get(key) {
                logger.warn(`Cache get operation called but Redis is not available: ${key}`);
                return null;
            },
            async set(key, _value, _ttl) {
                logger.warn(`Cache set operation called but Redis is not available: ${key}`);
            },
            async delete(key) {
                logger.warn(`Cache delete operation called but Redis is not available: ${key}`);
            },
            async healthCheck() {
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
            async clear() {
                logger.warn('Cache clear operation called but Redis is not available');
            }
        };
        fastify.decorate('cache', fallbackCache); // TODO: Fix Fastify decorator type compatibility
        // Add health check route that shows cache is unavailable
        fastify.get('/health/cache', {
            schema: {
                summary: 'Cache health check (fallback)',
                description: 'Check Redis cache connection and status (fallback when Redis unavailable)',
                response: {
                    200: CacheUnavailableResponseSchema,
                }
            }
        }, async () => {
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
//# sourceMappingURL=cache.plugin.js.map