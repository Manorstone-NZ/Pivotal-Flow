/**
 * Global Error Handler for C0 Backend Readiness
 * Standardized error responses with request tracking
 */

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { config } from '../config/index.js';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    request_id: string;
  };
  meta: {
    api_version: string;
    documentation_url: string;
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  _statusCode: number,
  requestId: string,
  details?: unknown
): ErrorResponse {
  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    },
    meta: {
      api_version: '1.0.0',
      documentation_url: 'https://api.pivotalflow.com/docs',
    },
  };
}

/**
 * Send standardized error response
 */
export function sendErrorResponse(
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode: number,
  requestId: string,
  details?: unknown
): void {
  const errorResponse = createErrorResponse(code, message, statusCode, requestId, details);
  reply.status(statusCode).send(errorResponse);
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND_ERROR', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super('CONFLICT_ERROR', message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_ERROR', message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Global error handler middleware
 */
export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = request.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Set request ID in response headers
  reply.header('X-Request-ID', requestId);
  
  let errorResponse: ErrorResponse;
  
  // Handle different error types
  if (error instanceof AppError) {
    errorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        request_id: requestId
      },
      meta: {
        api_version: '1.0.0',
        documentation_url: 'https://api.pivotalflow.com/docs'
      }
    };
  } else if (error instanceof ZodError) {
    // Handle Zod validation errors
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      value: (err as unknown as { input: unknown }).input
    }));
    
    errorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details,
        timestamp: new Date().toISOString(),
        request_id: requestId
      },
      meta: {
        api_version: '1.0.0',
        documentation_url: 'https://api.pivotalflow.com/docs'
      }
    };
  } else if (error.statusCode === 429) {
    // Handle rate limiting errors
    errorResponse = {
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Rate limit exceeded',
        details: {
          retry_after: reply.getHeader('Retry-After')
        },
        timestamp: new Date().toISOString(),
        request_id: requestId
      },
      meta: {
        api_version: '1.0.0',
        documentation_url: 'https://api.pivotalflow.com/docs'
      }
    };
  } else {
    // Handle unknown errors
    errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: config.server.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message,
        details: config.server.NODE_ENV === 'production' ? undefined : {
          stack: error.stack,
          name: error.name
        },
        timestamp: new Date().toISOString(),
        request_id: requestId
      },
      meta: {
        api_version: '1.0.0',
        documentation_url: 'https://api.pivotalflow.com/docs'
      }
    };
  }
  
  // Log error with request context
  request.log.error({
    error: {
      code: errorResponse.error.code,
      message: errorResponse.error.message,
      stack: error.stack
    },
    request: {
      id: requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    },
    user: (request as unknown as { user?: { sub?: string } }).user?.sub,
    organization: (request as unknown as { user?: { org?: string } }).user?.org
  });
  
  // Send error response
  reply.status(errorResponse.error.code === 'VALIDATION_ERROR' ? 400 : 
               errorResponse.error.code === 'AUTHENTICATION_ERROR' ? 401 :
               errorResponse.error.code === 'AUTHORIZATION_ERROR' ? 403 :
               errorResponse.error.code === 'NOT_FOUND_ERROR' ? 404 :
               errorResponse.error.code === 'CONFLICT_ERROR' ? 409 :
               errorResponse.error.code === 'RATE_LIMIT_ERROR' ? 429 : 500)
    .send(errorResponse);
}

/**
 * Request ID middleware
 */
export function requestIdMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  const requestId = (request.headers['x-request-id'] as string) || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  (request as unknown as { id: string }).id = requestId;
  reply.header('X-Request-ID', requestId);
  
  done();
}

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(_request: FastifyRequest, _reply: FastifyReply, done: () => void): void {
  // This middleware is deprecated - use observability.requestLoggingMiddleware instead
  // Keeping for backward compatibility but it does nothing
  done();
}
