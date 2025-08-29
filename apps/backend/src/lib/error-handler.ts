import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from './logger.js';
import { config } from './config.js';
import { HTTP_STATUS } from '@pivotal-flow/shared';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = (request as any).requestId || 'unknown';
  const requestLogger = logger.child({ requestId, route: request.routerPath });
  
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let details: unknown = undefined;
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }
      // Handle Prisma errors
    else if (error.name === 'PrismaClientKnownRequestError') {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = 'Database Error';
      details = {
        code: (error as any).code,
        meta: (error as any).meta,
      };
    }
  // Handle Prisma validation errors
  else if (error.name === 'PrismaClientValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
    details = error.message;
  }
  // Handle Fastify validation errors
  else if (error.validation) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
    details = error.validation;
  }
      // Handle rate limit errors
    else if (error.statusCode === 429) {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = 'Too Many Requests';
      details = {
        retryAfter: (error as any).headers?.['retry-after'],
      };
    }
  // Handle other known HTTP errors
  else if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    statusCode = error.statusCode;
    message = error.message || 'Client Error';
  }
  // Handle server errors
  else if (error.statusCode && error.statusCode >= 500) {
    statusCode = error.statusCode;
    message = error.message || 'Server Error';
  }
  
  // Log the error
  void requestLogger.error({
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
  
  reply.status(statusCode).send(response);
}
