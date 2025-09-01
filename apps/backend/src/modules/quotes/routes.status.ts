import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QuoteService } from './service.js';
import { QuoteStatusTransitionSchema } from './schemas.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';
import { z } from 'zod';

// Params schema for OpenAPI documentation
const StatusTransitionParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Quote ID' }
  }
};

// Request body schema for OpenAPI documentation
const StatusTransitionRequestSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { 
      type: 'string', 
      enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled'],
      description: 'New status'
    },
    notes: { type: 'string', maxLength: 2000, description: 'Optional notes for the transition' }
  }
};

// Response schema for OpenAPI documentation
const StatusTransitionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    quoteNumber: { type: 'string' },
    customerId: { type: 'string', format: 'uuid' },
    projectId: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled'] },
    type: { type: 'string' },
    validFrom: { type: 'string', format: 'date-time' },
    validUntil: { type: 'string', format: 'date-time' },
    currency: { type: 'string' },
    exchangeRate: { type: 'number' },
    subtotal: { type: 'number' },
    taxRate: { type: 'number' },
    taxAmount: { type: 'number' },
    discountType: { type: 'string' },
    discountValue: { type: 'number' },
    discountAmount: { type: 'number' },
    totalAmount: { type: 'number' },
    termsConditions: { type: 'string' },
    notes: { type: 'string' },
    internalNotes: { type: 'string' },
    createdBy: { type: 'string', format: 'uuid' },
    approvedBy: { type: 'string', format: 'uuid' },
    approvedAt: { type: 'string', format: 'date-time' },
    sentAt: { type: 'string', format: 'date-time' },
    acceptedAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    metadata: { type: 'object' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    lineItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          lineNumber: { type: 'integer' },
          type: { type: 'string' },
          description: { type: 'string' },
          quantity: { type: 'number' },
          unitPrice: { type: 'number' },
          unitCost: { type: 'number' },
          taxRate: { type: 'number' },
          taxAmount: { type: 'number' },
          discountType: { type: 'string' },
          discountValue: { type: 'number' },
          discountAmount: { type: 'number' },
          subtotal: { type: 'number' },
          totalAmount: { type: 'number' },
          serviceCategoryId: { type: 'string', format: 'uuid' },
          rateCardId: { type: 'string', format: 'uuid' },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

// Error response schema
const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' }
  }
};

interface StatusTransitionRequest {
  Params: {
    id: string;
  };
  Body: z.infer<typeof QuoteStatusTransitionSchema>;
}

/**
 * Register the status transition route
 */
export function registerStatusTransitionRoute(fastify: FastifyInstance) {
  fastify.post('/v1/quotes/:id/status', {
    schema: {
      tags: ['quotes'],
      summary: 'Transition quote status',
      description: 'Transition a quote to a new status. Valid transitions: draft→pending→approved→sent→accepted. Invalid transitions return 409.',
      params: StatusTransitionParamsSchema,
      body: StatusTransitionRequestSchema,
      response: {
        200: StatusTransitionResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    // preHandler: createTenantGuard(),
    handler: async (request: FastifyRequest<StatusTransitionRequest>, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedData = QuoteStatusTransitionSchema.parse(request.body);

        // Get tenant context
        const tenantContext = (request as any).tenantContext;
        if (!tenantContext) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Tenant context required',
            code: 'TENANT_ACCESS_DENIED'
          });
        }

        const { id } = request.params;

        // Create quote service
        const quoteService = new QuoteService((fastify as any).db, {
          organizationId: tenantContext.organizationId,
          userId: tenantContext.userId
        });

        // Transition status
        const quote = await quoteService.transitionStatus(id, validatedData);

        return reply.status(200).send(quote);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors
          });
        }

        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            return reply.status(404).send({
              error: 'Not Found',
              message: error.message,
              code: 'QUOTE_NOT_FOUND'
            });
          }

          if (error.message.includes('Invalid status transition')) {
            return reply.status(409).send({
              error: 'Conflict',
              message: error.message,
              code: 'INVALID_STATUS_TRANSITION'
            });
          }

          return reply.status(400).send({
            error: 'Bad Request',
            message: error.message,
            code: 'STATUS_TRANSITION_FAILED'
          });
        }

        // Log unexpected errors
        console.error('Unexpected error in statusTransitionRoute:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  });
}
