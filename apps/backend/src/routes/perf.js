import { z } from 'zod';
import { logger } from '../lib/logger.js';
// Performance summary schemas
const operationMetricsSchema = z.object({
    operation: z.string(),
    avgDuration: z.number(),
    p50: z.number(),
    p95: z.number(),
    p99: z.number(),
    totalCalls: z.number(),
});
const performanceSummarySchema = z.object({
    cache: z.object({
        hitRate: z.number(),
        totalRequests: z.number(),
        metrics: z.object({
            hits: z.number(),
            misses: z.number(),
            sets: z.number(),
            busts: z.number(),
            errors: z.number(),
        }),
    }),
    repositories: z.object({
        topOperations: z.array(operationMetricsSchema),
        totalOperations: z.number(),
    }),
    timestamp: z.string(),
});
const cacheMetricsSchema = z.object({
    message: z.string(),
    metrics: z.object({
        hits: z.number(),
        misses: z.number(),
        sets: z.number(),
        busts: z.number(),
        errors: z.number(),
    }),
});
export async function performanceRoutes(fastify) {
    // Performance summary endpoint
    fastify.get('/summary', {
        schema: {
            summary: 'Performance Summary',
            description: 'Get comprehensive performance metrics and statistics',
            response: {
                200: performanceSummarySchema,
                500: z.object({ error: z.string() }),
            }
        }
    }, async (request, reply) => {
        const requestId = request.requestId ?? 'unknown';
        const requestLogger = logger.child({ requestId, route: '/perf/summary' });
        try {
            requestLogger.debug('Performance summary requested');
            // Mock metrics for now - replace with actual Prometheus metrics
            const cacheHits = 100;
            const cacheMisses = 20;
            const totalRequests = cacheHits + cacheMisses;
            const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
            // Get repository metrics (simplified for now)
            const summary = {
                cache: {
                    hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
                    totalRequests,
                    metrics: {
                        hits: cacheHits,
                        misses: cacheMisses,
                        sets: 50,
                        busts: 10,
                        errors: 2
                    }
                },
                repositories: {
                    topOperations: [
                        {
                            operation: 'getUserById',
                            avgDuration: 0.3,
                            p50: 0.2,
                            p95: 0.8,
                            p99: 1.2,
                            totalCalls: 456
                        },
                        {
                            operation: 'listUsers',
                            avgDuration: 1.2,
                            p50: 0.8,
                            p95: 2.4,
                            p99: 3.8,
                            totalCalls: 234
                        },
                        {
                            operation: 'getOrganizationSettings',
                            avgDuration: 0.2,
                            p50: 0.1,
                            p95: 0.5,
                            p99: 0.8,
                            totalCalls: 123
                        }
                    ],
                    totalOperations: 813
                },
                timestamp: new Date().toISOString()
            };
            requestLogger.info({
                message: 'Performance summary served successfully',
                hitRate: summary.cache.hitRate,
                totalRequests: summary.cache.totalRequests
            });
            return reply.status(200).send(summary);
        }
        catch (error) {
            requestLogger.error({
                message: 'Failed to serve performance summary',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return reply.status(500).send('Failed to get performance summary');
        }
    });
    // Cache metrics endpoint
    fastify.get('/cache', {
        schema: {
            summary: 'Cache Metrics',
            description: 'Get detailed cache performance metrics',
            response: {
                200: cacheMetricsSchema,
                500: z.object({ error: z.string() }),
            }
        }
    }, async (request, reply) => {
        const requestId = request.requestId ?? 'unknown';
        const requestLogger = logger.child({ requestId, route: '/perf/cache' });
        try {
            requestLogger.debug('Cache metrics requested');
            const metrics = {
                message: 'Cache metrics retrieved successfully',
                metrics: {
                    hits: 100,
                    misses: 20,
                    sets: 50,
                    busts: 10,
                    errors: 2
                }
            };
            requestLogger.info({
                message: 'Cache metrics served successfully',
                hitRate: metrics.metrics.hits / (metrics.metrics.hits + metrics.metrics.misses) * 100
            });
            return reply.status(200).send(metrics);
        }
        catch (error) {
            requestLogger.error({
                message: 'Failed to serve cache metrics',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return reply.status(500).send('Failed to get cache metrics');
        }
    });
}
//# sourceMappingURL=perf.js.map