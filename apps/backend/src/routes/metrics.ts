import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register, collectDefaultMetrics } from 'prom-client';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

// Enable default metrics collection
collectDefaultMetrics({ register });

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
          customMetrics: [], // Will be populated as we add custom metrics
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
}
