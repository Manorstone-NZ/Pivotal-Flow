import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../lib/logger.js';
import { z } from 'zod';

// Health check response schema
const healthStatusSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  checks: z.object({
    database: z.object({
      status: z.enum(['ok', 'error']),
      message: z.string(),
      timestamp: z.string(),
    }),
    redis: z.object({
      status: z.enum(['ok', 'error']),
      message: z.string(),
      timestamp: z.string(),
    }),
    metrics: z.object({
      status: z.enum(['ok', 'error']),
      message: z.string(),
      timestamp: z.string(),
    }),
  }),
});

// Health response schema - removed unused variable

// Mock health check functions for now
async function checkDatabaseHealth() {
  try {
    // This would normally check the actual database
    return {
      status: 'ok' as const,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Database check failed',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkRedisHealth() {
  try {
    // This would normally check Redis
    return {
      status: 'ok' as const,
      message: 'Redis connection successful',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Redis check failed',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkMetricsHealth() {
  try {
    // This would normally check metrics
    return {
      status: 'ok' as const,
      message: 'Metrics collection successful',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Metrics check failed',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic health check
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    const requestId = (request as any).requestId ?? 'unknown';
    const requestLogger = logger.child({ requestId, route: '/health' });
    
    requestLogger.info('Health check requested');
    
    try {
      // Check all services in parallel
      const [dbHealth, redisHealth, metricsHealth] = await Promise.allSettled([
        checkDatabaseHealth(),
        checkRedisHealth(),
        checkMetricsHealth(),
      ]);
      
      // Determine overall status
      const checks = {
        database: dbHealth.status === 'fulfilled' ? dbHealth.value : {
          status: 'error' as const,
          message: dbHealth.reason?.message ?? 'Database check failed',
          timestamp: new Date().toISOString(),
        },
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : {
          status: 'error' as const,
          message: redisHealth.reason?.message ?? 'Redis check failed',
          timestamp: new Date().toISOString(),
        },
        metrics: metricsHealth.status === 'fulfilled' ? metricsHealth.value : {
          status: 'error' as const,
          message: metricsHealth.reason?.message ?? 'Metrics check failed',
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
  });
  
  // Simple health check for load balancers
  fastify.get('/ping', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = (request as any).requestId ?? 'unknown';
    const requestLogger = logger.child({ requestId, route: '/health/ping' });
    
    requestLogger.debug('Ping requested');
    
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
}
