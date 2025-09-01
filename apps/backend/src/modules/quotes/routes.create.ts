import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QuoteService } from './service.js';
import { CreateQuoteSchema } from './schemas.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';
import { z } from 'zod';

// Request body schema for OpenAPI documentation
const CreateQuoteRequestSchema = {
  type: 'object',
  required: ['customerId', 'title', 'validFrom', 'validUntil', 'lineItems'],
  properties: {
    customerId: { type: 'string', format: 'uuid', description: 'Customer ID' },
    projectId: { type: 'string', format: 'uuid', description: 'Project ID (optional)' },
    title: { type: 'string', minLength: 3, maxLength: 255, description: 'Quote title' },
    description: { type: 'string', maxLength: 2000, description: 'Quote description' },
    type: { 
      type: 'string', 
      enum: ['project', 'service', 'product', 'recurring', 'one_time'],
      default: 'project',
      description: 'Quote type'
    },
    validFrom: { type: 'string', format: 'date-time', description: 'Valid from date' },
    validUntil: { type: 'string', format: 'date-time', description: 'Valid until date' },
    currency: { type: 'string', minLength: 3, maxLength: 3, default: 'NZD', description: 'Currency code' },
    exchangeRate: { type: 'number', minimum: 0, default: 1.0, description: 'Exchange rate' },
    taxRate: { type: 'number', minimum: 0, maximum: 1, default: 0.15, description: 'Tax rate' },
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
            default: 'service',
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
          taxRate: { type: 'number', minimum: 0, maximum: 1, default: 0.15, description: 'Tax rate' },
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
const CreateQuoteResponseSchema = {
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
    taxAmount: { type: 'number' },
    discountAmount: { type: 'number' },
    totalAmount: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

interface CreateQuoteRequest {
  Body: z.infer<typeof CreateQuoteSchema>;
}

/**
 * Register the create quote route
 */
export function registerCreateQuoteRoute(fastify: FastifyInstance) {
  fastify.post('/v1/quotes', {
    schema: {
      tags: ['quotes'],
      summary: 'Create a new quote',
      description: 'Create a new quote with line items. The quote will be created with status "draft" and automatic calculations will be performed.',
      security: [{ bearerAuth: [] }],
      body: CreateQuoteRequestSchema,
      response: {
        201: CreateQuoteResponseSchema,
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'object' }
          }
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    // preHandler: createTenantGuard(),
    handler: async (request: FastifyRequest<CreateQuoteRequest>, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedData = CreateQuoteSchema.parse(request.body);

        // Get tenant context
        const tenantContext = (request as any).tenantContext;
        if (!tenantContext) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Tenant context required',
            code: 'TENANT_ACCESS_DENIED'
          });
        }

        // Create quote service
        const quoteService = new QuoteService((fastify as any).db, {
          organizationId: tenantContext.organizationId,
          userId: tenantContext.userId
        });

        // Create quote
        const quote = await quoteService.createQuote(validatedData);

        return reply.status(201).send(quote);
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
          return reply.status(400).send({
            error: 'Bad Request',
            message: error.message,
            code: 'QUOTE_CREATION_FAILED'
          });
        }

        // Log unexpected errors
        console.error('Unexpected error in createQuoteRoute:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  });
}
