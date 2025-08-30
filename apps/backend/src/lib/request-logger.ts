import type { FastifyRequest, FastifyReply } from 'fastify';
import { generateRequestId } from '@pivotal-flow/shared';
import { createRequestLogger } from './logger.js';

export async function requestLogger(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  (request as any).requestId = requestId;
  
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
  (request as any).startTime = startTime;
  (request as any).requestLogger = requestLogger;
}
