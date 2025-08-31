import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QuoteService } from './service.js';
import { createTenantGuard } from '@pivotal-flow/shared/tenancy/guard.js';

// Params schema for OpenAPI documentation
const GetQuoteParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Quote ID' }
  }
};

// Response schema for OpenAPI documentation
const GetQuoteResponseSchema = {
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

interface GetQuoteRequest {
  Params: {
    id: string;
  };
}

/**
 * GET /v1/quotes/:id
 * Get quote by ID with line items
 */
export async function getQuoteRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<GetQuoteRequest>,
  reply: FastifyReply
) {
  try {
    // Get tenant context
    const tenantContext = request.tenantContext;
    if (!tenantContext) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Tenant context required',
        code: 'TENANT_ACCESS_DENIED'
      });
    }

    const { id } = request.params;

    // Create quote service
    const quoteService = new QuoteService(fastify.hybridDb, {
      organizationId: tenantContext.organizationId,
      userId: tenantContext.userId
    });

    // Get quote
    const quote = await quoteService.getQuoteById(id);

    if (!quote) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Quote not found',
        code: 'QUOTE_NOT_FOUND'
      });
    }

    return reply.status(200).send(quote);
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        code: 'QUOTE_GET_FAILED'
      });
    }

    // Log unexpected errors
    fastify.log.error('Unexpected error in getQuoteRoute:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Register the get quote route
 */
export function registerGetQuoteRoute(fastify: FastifyInstance) {
  fastify.get('/v1/quotes/:id', {
    schema: {
      description: 'Get quote by ID with line items',
      tags: ['quotes'],
      security: [{ bearerAuth: [] }],
      params: GetQuoteParamsSchema,
      response: {
        200: GetQuoteResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    preHandler: createTenantGuard(),
    handler: getQuoteRoute
  });
}
