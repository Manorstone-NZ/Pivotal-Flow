import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register } from 'prom-client';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

// Default metrics are already collected in main index.ts

export async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
  // Metrics endpoint
  fastify.get('/', {
    schema: {
      tags: ['Metrics'],
      summary: 'Prometheus metrics',
      description: 'Exposes Prometheus metrics for monitoring',
      response: {
        200: {
          type: 'string',
          description: 'Prometheus metrics in text format',
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestId = (request as any).requestId || 'unknown';
      const requestLogger = logger.child({ requestId, route: '/metrics' });
      
      try {
        // Check if metrics are enabled
        if (!config.metrics.enabled) {
          requestLogger.warn('Metrics endpoint accessed but metrics are disabled');
          return reply.status(404).send('Metrics endpoint disabled');
        }
        
        requestLogger.debug('Metrics requested');
        
        // Get metrics in Prometheus format
        const metrics = await register.metrics();
        
        // Set appropriate headers for Prometheus
        reply.header('Content-Type', register.contentType);
        
        void requestLogger.info({
          message: 'Metrics served successfully',
          contentType: register.contentType,
        });
        
        return reply.status(200).send(metrics);
      } catch (error) {
        requestLogger.error({
          message: 'Failed to serve metrics',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        return reply.status(500).send('Failed to generate metrics');
      }
    },
  });
  
  // Metrics info endpoint
  fastify.get('/info', {
    schema: {
      tags: ['Metrics'],
      summary: 'Metrics information',
      description: 'Returns information about available metrics',
      response: {
        200: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            path: { type: 'string' },
            defaultMetrics: { type: 'boolean' },
            customMetrics: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestId = (request as any).requestId || 'unknown';
      const requestLogger = logger.child({ requestId, route: '/metrics/info' });
      
      try {
        requestLogger.debug('Metrics info requested');
        
        const info = {
          enabled: config.metrics.enabled,
          path: config.metrics.path,
          defaultMetrics: true,
          customMetrics: [
          'pivotal_cache_hits_total',
          'pivotal_cache_miss_total',
          'pivotal_cache_hit_rate_percentage',
          'pivotal_repo_operation_duration_histogram'
        ],
        };
        
        requestLogger.info({
          message: 'Metrics info served successfully',
          info,
        });
        
        return reply.status(200).send(info);
      } catch (error) {
        requestLogger.error({
          message: 'Failed to serve metrics info',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        return reply.status(500).send('Failed to get metrics info');
      }
    },
  });

  // Performance summary endpoint
  fastify.get('/perf/summary', {
    schema: {
      tags: ['Metrics'],
      summary: 'Performance summary',
      description: 'Returns current cache hit rate and top repository timings',
      response: {
        200: {
          type: 'object',
          properties: {
            cache: {
              type: 'object',
              properties: {
                hitRate: { type: 'number' },
                totalRequests: { type: 'number' },
                metrics: {
                  type: 'object',
                  properties: {
                    hits: { type: 'number' },
                    misses: { type: 'number' },
                    sets: { type: 'number' },
                    busts: { type: 'number' },
                    errors: { type: 'number' }
                  }
                }
              }
            },
            repositories: {
              type: 'object',
              properties: {
                topOperations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      operation: { type: 'string' },
                      avgDuration: { type: 'number' },
                      p50: { type: 'number' },
                      p95: { type: 'number' },
                      p99: { type: 'number' },
                      totalCalls: { type: 'number' }
                    }
                  }
                },
                totalOperations: { type: 'number' }
              }
            },
            timestamp: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestId = (request as any).requestId || 'unknown';
      const requestLogger = logger.child({ requestId, route: '/metrics/perf/summary' });
      
      try {
        requestLogger.debug('Performance summary requested');
        
        // Import metrics dynamically to avoid circular dependencies
        const { globalMetrics } = await import('@pivotal-flow/shared/metrics');
        const summary = globalMetrics.getPerformanceSummary();
        
        requestLogger.info({
          message: 'Performance summary served successfully',
          hitRate: summary.cache.hitRate,
          totalOperations: summary.repositories.totalOperations
        });
        
        return reply.status(200).send(summary);
      } catch (error) {
        requestLogger.error({
          message: 'Failed to serve performance summary',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        return reply.status(500).send('Failed to get performance summary');
      }
    },
  });
}
