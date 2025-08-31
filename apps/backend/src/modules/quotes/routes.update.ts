import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QuoteService } from './service.js';
import { UpdateQuoteSchema } from './schemas.js';
import { createTenantGuard } from '@pivotal-flow/shared/tenancy/guard.js';
import { z } from 'zod';

// Params schema for OpenAPI documentation
const UpdateQuoteParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Quote ID' }
  }
};

// Request body schema for OpenAPI documentation
const UpdateQuoteRequestSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 255, description: 'Quote title' },
    description: { type: 'string', maxLength: 2000, description: 'Quote description' },
    type: { 
      type: 'string', 
      enum: ['project', 'service', 'product', 'recurring', 'one_time'],
      description: 'Quote type'
    },
    validFrom: { type: 'string', format: 'date-time', description: 'Valid from date' },
    validUntil: { type: 'string', format: 'date-time', description: 'Valid until date' },
    currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' },
    exchangeRate: { type: 'number', minimum: 0, description: 'Exchange rate' },
    taxRate: { type: 'number', minimum: 0, maximum: 1, description: 'Tax rate' },
    discountType: { 
      type: 'string', 
      enum: ['percentage', 'fixed_amount', 'per_unit'],
      description: 'Quote-level discount type'
    },
    discountValue: { type: 'number', minimum: 0, description: 'Discount value' },
    termsConditions: { type: 'string', maxLength: 5000, description: 'Terms and conditions' },
    notes: { type: 'string', maxLength: 2000, description: 'Notes' },
    internalNotes: { type: 'string', maxLength: 2000, description: 'Internal notes' },
    lineItems: {
      type: 'array',
      minItems: 1,
      maxItems: 1000,
      items: {
        type: 'object',
        required: ['lineNumber', 'description', 'quantity', 'unitPrice'],
        properties: {
          lineNumber: { type: 'integer', minimum: 1, description: 'Line number' },
          type: { 
            type: 'string', 
            enum: ['service', 'product', 'material', 'travel', 'expense', 'discount', 'tax'],
            description: 'Line item type'
          },
          description: { type: 'string', minLength: 1, maxLength: 1000, description: 'Item description' },
          quantity: { type: 'number', minimum: 0, description: 'Quantity' },
          unitPrice: {
            type: 'object',
            required: ['amount', 'currency'],
            properties: {
              amount: { type: 'number', description: 'Unit price amount' },
              currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' }
            }
          },
          unitCost: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Unit cost amount' },
              currency: { type: 'string', minLength: 3, maxLength: 3, description: 'Currency code' }
            }
          },
          taxRate: { type: 'number', minimum: 0, maximum: 1, description: 'Tax rate' },
          discountType: { 
            type: 'string', 
            enum: ['percentage', 'fixed_amount', 'per_unit'],
            description: 'Line item discount type'
          },
          discountValue: { type: 'number', minimum: 0, description: 'Discount value' },
          serviceCategoryId: { type: 'string', format: 'uuid', description: 'Service category ID' },
          rateCardId: { type: 'string', format: 'uuid', description: 'Rate card ID' },
          metadata: { type: 'object', description: 'Additional metadata' }
        }
      }
    }
  }
};

// Response schema for OpenAPI documentation
const UpdateQuoteResponseSchema = {
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

interface UpdateQuoteRequest {
  Params: {
    id: string;
  };
  Body: z.infer<typeof UpdateQuoteSchema>;
}

/**
 * PATCH /v1/quotes/:id
 * Update quote header fields and/or replace line items with recalculation
 */
export async function updateQuoteRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<UpdateQuoteRequest>,
  reply: FastifyReply
) {
  try {
    // Validate request body
    const validatedData = UpdateQuoteSchema.parse(request.body);

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

    // Update quote
    const quote = await quoteService.updateQuote(id, validatedData);

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

      if (error.message.includes('cannot be updated')) {
        return reply.status(409).send({
          error: 'Conflict',
          message: error.message,
          code: 'QUOTE_UPDATE_CONFLICT'
        });
      }

      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        code: 'QUOTE_UPDATE_FAILED'
      });
    }

    // Log unexpected errors
    fastify.log.error('Unexpected error in updateQuoteRoute:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Register the update quote route
 */
export function registerUpdateQuoteRoute(fastify: FastifyInstance) {
  fastify.patch('/v1/quotes/:id', {
    schema: {
      description: 'Update quote header fields and/or replace line items with recalculation',
      tags: ['quotes'],
      security: [{ bearerAuth: [] }],
      params: UpdateQuoteParamsSchema,
      body: UpdateQuoteRequestSchema,
      response: {
        200: UpdateQuoteResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    preHandler: createTenantGuard(),
    handler: updateQuoteRoute
  });
}
