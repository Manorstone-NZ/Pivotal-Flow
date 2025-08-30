import type { FastifyRequest, FastifyReply } from 'fastify';
import type { RequestLogger } from './logger.js';

export interface LogContext {
  userId?: string;
  organizationId?: string;
  route?: string | undefined;
  status?: number;
  duration?: number;
  userAgent?: string | undefined;
  ip?: string;
}

export class LogEnricher {
  /**
   * Enriches a request logger with authentication context
   */
  static enrichRequestLogger(
    request: FastifyRequest,
    logger: RequestLogger,
    context: LogContext = {}
  ): RequestLogger {
    const enrichedContext: LogContext = {
      ...context,
      route: request.routeOptions.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    // Extract user and organization from JWT token if available
    if (request.user && typeof request.user === 'object' && 'id' in request.user) {
      enrichedContext.userId = (request.user as any).id;
      enrichedContext.organizationId = (request.user as any).organizationId;
    }

    // Extract from headers if available (for API keys, etc.)
    if (!enrichedContext.userId && request.headers['x-user-id']) {
      enrichedContext.userId = request.headers['x-user-id'] as string;
    }

    if (!enrichedContext.organizationId && request.headers['x-organization-id']) {
      enrichedContext.organizationId = request.headers['x-organization-id'] as string;
    }

    return logger.child(enrichedContext);
  }

  /**
   * Enriches response logging with status and duration
   */
  static enrichResponseLogger(
    _request: FastifyRequest,
    reply: FastifyReply,
    logger: RequestLogger,
    startTime: number
  ): RequestLogger {
    const duration = Date.now() - startTime;
    const status = reply.statusCode;

    return logger.child({
      status,
      duration,
      type: 'response',
    });
  }

  /**
   * Creates a structured log entry for cloud destinations
   */
  static createCloudLogEntry(
    level: string,
    message: string,
    context: LogContext,
    additionalData: Record<string, unknown> = {}
  ): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'pivotal-flow-backend',
      version: '0.1.0',
      ...context,
      ...additionalData,
    };
  }

  /**
   * Formats logs for cloud shipping (JSON without pretty formatting)
   */
  static isCloudShippingEnabled(): boolean {
    return process.env['LOG_CLOUD_SHIPPING'] === 'true';
  }
}
