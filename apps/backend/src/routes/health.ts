import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthStatusSchema } from '@pivotal-flow/shared';
import { logger } from '../lib/logger.js';
import { checkDatabaseHealth } from '../lib/health/database.js';
import { checkRedisHealth } from '../lib/health/redis.js';
import { checkMetricsHealth } from '../lib/health/metrics.js';

// Health check response schema
const healthResponseSchema = {
  200: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ok', 'error'] },
      timestamp: { type: 'string', format: 'date-time' },
      uptime: { type: 'number' },
      version: { type: 'string' },
      checks: {
        type: 'object',
        properties: {
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok', 'error'] },
              message: { type: 'string' },
              latency: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          redis: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok', 'error'] },
              message: { type: 'string' },
              latency: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          metrics: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok', 'error'] },
              message: { type: 'string' },
              latency: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
};

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic health check
  fastify.get('/', {
    schema: {
      response: healthResponseSchema,
      tags: ['Health'],
      summary: 'Basic health check',
      description: 'Returns basic application health status',
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      const requestId = (request as any).requestId || 'unknown';
      const requestLogger = logger.child({ requestId, route: '/health' });
      
      requestLogger.info('Health check requested');
      
      try {
        // Check all services in parallel
        const [dbHealth, redisHealth, metricsHealth] = await Promise.allSettled([
          checkDatabaseHealth(fastify),
          checkRedisHealth(),
          checkMetricsHealth(),
        ]);
        
        // Determine overall status
        const checks = {
          database: dbHealth.status === 'fulfilled' ? dbHealth.value : {
            status: 'error' as const,
            message: dbHealth.reason?.message || 'Database check failed',
            timestamp: new Date().toISOString(),
          },
          redis: redisHealth.status === 'fulfilled' ? redisHealth.value : {
            status: 'error' as const,
            message: redisHealth.reason?.message || 'Redis check failed',
            timestamp: new Date().toISOString(),
          },
          metrics: metricsHealth.status === 'fulfilled' ? metricsHealth.value : {
            status: 'error' as const,
            message: metricsHealth.reason?.message || 'Metrics check failed',
            timestamp: new Date().toISOString(),
          },
        };
        
        const overallStatus = Object.values(checks).every(check => check.status === 'ok') ? 'ok' : 'error';
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        
        const response = {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          uptime,
          version: '0.1.0',
          checks,
        };
        
        // Validate response
        const validatedResponse = healthStatusSchema.parse(response);
        
        requestLogger.info({
          message: 'Health check completed',
          status: overallStatus,
          duration: Date.now() - startTime,
        });
        
        return reply.status(200).send(validatedResponse);
      } catch (error) {
        requestLogger.error({
          message: 'Health check failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        return reply.status(500).send({
          status: 'error',
          timestamp: new Date().toISOString(),
          uptime: 0,
          version: '0.1.0',
          checks: {
            database: { status: 'error', message: 'Health check failed', timestamp: new Date().toISOString() },
            redis: { status: 'error', message: 'Health check failed', timestamp: new Date().toISOString() },
            metrics: { status: 'error', message: 'Health check failed', timestamp: new Date().toISOString() },
          },
        });
      }
    },
  });
  
  // Simple health check for load balancers
  fastify.get('/ping', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
      tags: ['Health'],
      summary: 'Simple ping',
      description: 'Simple health check for load balancers',
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const requestId = (request as any).requestId || 'unknown';
      const requestLogger = logger.child({ requestId, route: '/health/ping' });
      
      requestLogger.debug('Ping requested');
      
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    },
  });
}
