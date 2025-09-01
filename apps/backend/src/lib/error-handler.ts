import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from './logger.js';
import { config } from './config.js';
import { HTTP_STATUS } from '@pivotal-flow/shared';

// Type definitions for request context
interface RequestWithId extends FastifyRequest {
  requestId?: string;
}

interface RateLimitError extends FastifyError {
  headers?: {
    'retry-after'?: string;
  };
}

// Error handling strategies
const errorStrategies = {
  zod: (error: ZodError) => ({
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Validation Error',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
  }),
  
  validation: (error: FastifyError) => ({
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Validation Error',
    details: error.validation
  }),
  
  rateLimit: (error: RateLimitError) => ({
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: 'Too Many Requests',
    details: {
      retryAfter: error.headers?.['retry-after'] ?? undefined,
    }
  }),
  
  clientError: (error: FastifyError) => ({
    statusCode: error.statusCode ?? HTTP_STATUS.BAD_REQUEST,
    message: error.message ?? 'Client Error',
    details: undefined
  }),
  
  serverError: (error: FastifyError) => ({
    statusCode: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: error.message ?? 'Server Error',
    details: undefined
  }),
  
  default: () => ({
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
    details: undefined
  })
};

// Determine error strategy
function determineErrorStrategy(error: FastifyError) {
  if (error instanceof ZodError) return errorStrategies.zod(error);
  if (error.validation) return errorStrategies.validation(error);
  if (error.statusCode === 429) return errorStrategies.rateLimit(error as RateLimitError);
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) return errorStrategies.clientError(error);
  if (error.statusCode && error.statusCode >= 500) return errorStrategies.serverError(error);
  return errorStrategies.default();
}

export async function errorHandler(
  error: FastifyError,
  request: RequestWithId,
  reply: FastifyReply
): Promise<void> {
  const requestId = request.requestId ?? 'unknown';
  const requestLogger = logger.child({ requestId, route: request.url });
  
  // Determine error response using strategy pattern
  const { statusCode, message, details } = determineErrorStrategy(error);
  
  // Log the error
  requestLogger.error({
    message: 'Request error',
    error: {
      name: error.name,
      message: error.message,
      stack: config.isDevelopment ? error.stack : undefined,
      statusCode,
    },
    details,
  });
  
  // Send error response
  const response = {
    success: false,
    error: message,
    message: message,
    timestamp: new Date().toISOString(),
    requestId,
    ...(config.isDevelopment && { details }),
  };
  
  await reply.status(statusCode).send(response);
}
