import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QuoteService } from './service.js';
import { QuoteListFiltersSchema, QuoteListPaginationSchema } from './schemas.js';
import { createTenantGuard } from '@pivotal-flow/shared/tenancy/guard.js';
import { z } from 'zod';

// Query parameters schema for OpenAPI documentation
const ListQuotesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Page size' },
    sortBy: { 
      type: 'string', 
      enum: ['createdAt', 'updatedAt', 'title', 'status', 'totalAmount', 'validUntil'],
      default: 'createdAt',
      description: 'Sort field'
    },
    sortOrder: { 
      type: 'string', 
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort order'
    },
    status: { 
      type: 'string', 
      enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled'],
      description: 'Filter by status'
    },
    customerId: { type: 'string', format: 'uuid', description: 'Filter by customer ID' },
    projectId: { type: 'string', format: 'uuid', description: 'Filter by project ID' },
    type: { 
      type: 'string', 
      enum: ['project', 'service', 'product', 'recurring', 'one_time'],
      description: 'Filter by quote type'
    },
    q: { type: 'string', maxLength: 100, description: 'Search query' },
    validFrom: { type: 'string', format: 'date-time', description: 'Filter by valid from date' },
    validUntil: { type: 'string', format: 'date-time', description: 'Filter by valid until date' },
    createdBy: { type: 'string', format: 'uuid', description: 'Filter by creator' }
  }
};

// Response schema for OpenAPI documentation
const ListQuotesResponseSchema = {
  type: 'object',
  properties: {
    quotes: {
      type: 'array',
      items: {
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
      }
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
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

interface ListQuotesRequest {
  Querystring: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    customerId?: string;
    projectId?: string;
    type?: string;
    q?: string;
    validFrom?: string;
    validUntil?: string;
    createdBy?: string;
  };
}

/**
 * GET /v1/quotes
 * List quotes with pagination and filters
 */
export async function listQuotesRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<ListQuotesRequest>,
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

    // Parse and validate query parameters
    const pagination = QuoteListPaginationSchema.parse({
      page: request.query.page || 1,
      pageSize: request.query.pageSize || 20,
      sortBy: request.query.sortBy || 'createdAt',
      sortOrder: request.query.sortOrder || 'desc'
    });

    const filters = QuoteListFiltersSchema.parse({
      status: request.query.status,
      customerId: request.query.customerId,
      projectId: request.query.projectId,
      type: request.query.type,
      q: request.query.q,
      validFrom: request.query.validFrom,
      validUntil: request.query.validUntil,
      createdBy: request.query.createdBy
    });

    // Create quote service
    const quoteService = new QuoteService(fastify.hybridDb, {
      organizationId: tenantContext.organizationId,
      userId: tenantContext.userId
    });

    // List quotes
    const result = await quoteService.listQuotes(pagination, filters);

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid query parameters',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        code: 'QUOTE_LIST_FAILED'
      });
    }

    // Log unexpected errors
    fastify.log.error('Unexpected error in listQuotesRoute:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Register the list quotes route
 */
export function registerListQuotesRoute(fastify: FastifyInstance) {
  fastify.get('/v1/quotes', {
    schema: {
      description: 'List quotes with pagination and filters',
      tags: ['quotes'],
      security: [{ bearerAuth: [] }],
      querystring: ListQuotesQuerySchema,
      response: {
        200: ListQuotesResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    preHandler: createTenantGuard(),
    handler: listQuotesRoute
  });
}
