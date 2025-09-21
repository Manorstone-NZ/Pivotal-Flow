/**
 * Standardized Error Envelope Schemas for F1.5
 * All API endpoints must use these error response formats
 */

import { Type } from '@sinclair/typebox';

// Base error envelope structure - matches existing error handler format
export const ErrorEnvelopeSchema = Type.Object({
  error: Type.Object({
    code: Type.String({ 
      description: 'Error code for programmatic handling',
      examples: ['VALIDATION_ERROR', 'NOT_FOUND', 'PERMISSION_DENIED']
    }),
    message: Type.String({ 
      description: 'Human-readable error message',
      examples: ['Invalid request data', 'Resource not found', 'Access denied']
    }),
    details: Type.Optional(Type.Any({ 
      description: 'Additional error context (validation errors, stack trace in dev, etc.)'
    })),
    timestamp: Type.Optional(Type.String({ format: 'date-time' })),
    request_id: Type.Optional(Type.String())
  }),
  meta: Type.Optional(Type.Object({
    api_version: Type.Optional(Type.String()),
    documentation_url: Type.Optional(Type.String())
  }))
});

// Standard HTTP error responses
export const BadRequestErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('VALIDATION_ERROR'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

export const UnauthorizedErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('AUTHENTICATION_ERROR'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

export const ForbiddenErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('AUTHORIZATION_ERROR'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

export const NotFoundErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('NOT_FOUND'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

export const ConflictErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('CONFLICT_ERROR'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

export const InternalServerErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.Literal('INTERNAL_ERROR'),
    message: Type.String(),
    details: Type.Optional(Type.Any())
  })
});

// Common response schemas for reuse
export const StandardErrorResponses = {
  400: BadRequestErrorSchema,
  401: UnauthorizedErrorSchema,
  403: ForbiddenErrorSchema,
  404: NotFoundErrorSchema,
  409: ConflictErrorSchema,
  500: InternalServerErrorSchema
};

// Success envelope for consistent structure
export const SuccessEnvelopeSchema = <T extends import('@sinclair/typebox').TSchema>(dataSchema: T) => Type.Object({
  data: dataSchema,
  meta: Type.Optional(Type.Object({
    requestId: Type.Optional(Type.String()),
    timestamp: Type.Optional(Type.String({ format: 'date-time' })),
    apiVersion: Type.Optional(Type.String())
  }))
});

// Pagination envelope
export const PaginatedResponseSchema = <T extends import('@sinclair/typebox').TSchema>(itemSchema: T) => Type.Object({
  data: Type.Array(itemSchema),
  pagination: Type.Object({
    page: Type.Number({ minimum: 1 }),
    pageSize: Type.Number({ minimum: 1, maximum: 100 }),
    total: Type.Number({ minimum: 0 }),
    totalPages: Type.Number({ minimum: 0 }),
    hasNext: Type.Boolean(),
    hasPrevious: Type.Boolean()
  }),
  meta: Type.Optional(Type.Object({
    requestId: Type.Optional(Type.String()),
    timestamp: Type.Optional(Type.String({ format: 'date-time' })),
    apiVersion: Type.Optional(Type.String())
  }))
});

// Type exports for use in services
export type ErrorEnvelope = typeof ErrorEnvelopeSchema.static;
export type BadRequestError = typeof BadRequestErrorSchema.static;
export type UnauthorizedError = typeof UnauthorizedErrorSchema.static;
export type ForbiddenError = typeof ForbiddenErrorSchema.static;
export type NotFoundError = typeof NotFoundErrorSchema.static;
export type ConflictError = typeof ConflictErrorSchema.static;
export type InternalServerError = typeof InternalServerErrorSchema.static;
