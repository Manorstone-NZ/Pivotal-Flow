import { generateRequestId } from '@pivotal-flow/shared';
import type { FastifyRequest } from 'fastify';

import { createRequestLogger } from './logger.js';

// Type definitions for request context
interface RequestWithContext extends FastifyRequest {
  requestId?: string;
  startTime?: number;
  requestLogger?: ReturnType<typeof createRequestLogger>;
}

export async function requestLogger(
  request: RequestWithContext
): Promise<void> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  request.requestId = requestId;
  
  // Create request-specific logger
  const requestLogger = createRequestLogger(requestId, request.url);
  
  // Log request start
  requestLogger.info({
    message: 'Request started',
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    headers: {
      'content-type': request.headers['content-type'],
      'accept': request.headers['accept'],
      'authorization': request.headers.authorization ? '[REDACTED]' : undefined,
    },
  });
  
  // Store start time in request for later use
  request.startTime = startTime;
  request.requestLogger = requestLogger;
}
