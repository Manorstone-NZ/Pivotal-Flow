import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

import { logger } from '../lib/logger.js';

// Health check response schema
const healthStatusSchema = Type.Object({
  status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
  timestamp: Type.String(),
  uptime: Type.Number(),
  version: Type.String(),
  checks: Type.Object({
    database: Type.Object({
      status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
      message: Type.String(),
      timestamp: Type.String(),
    }),
    redis: Type.Object({
      status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
      message: Type.String(),
      timestamp: Type.String(),
    }),
    metrics: Type.Object({
      status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
      message: Type.String(),
      timestamp: Type.String(),
    }),
  }),
});

// Ping response schema
const pingResponseSchema = Type.Object({
  status: Type.Literal('ok'),
  timestamp: Type.String(),
});

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
  fastify.get('/', {
    schema: {
      summary: 'Health Check',
      description: 'Comprehensive health check for all services',
      response: {
        200: healthStatusSchema,
        500: healthStatusSchema,
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
      
      // Return response directly (TypeBox validation is handled by Fastify)
      requestLogger.info({
        message: 'Health check completed',
        status: overallStatus,
        duration: Date.now() - startTime,
      });
      
      return reply.status(200).send(response);
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
  fastify.get('/ping', {
    schema: {
      summary: 'Ping Health Check',
      description: 'Simple health check for load balancers',
      response: {
        200: pingResponseSchema,
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = (request as any).requestId ?? 'unknown';
    const requestLogger = logger.child({ requestId, route: '/health/ping' });
    
    requestLogger.debug('Ping requested');
    
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
}
