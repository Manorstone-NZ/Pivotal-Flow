import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';
import { CreateQuoteSchema } from './schemas.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';
import { z } from 'zod';

interface CreateQuoteRequest {
  Body: z.infer<typeof CreateQuoteSchema>;
}

/**
 * Register the create quote route
 */
export function registerCreateQuoteRoute(fastify: FastifyInstance) {
  fastify.post('/v1/quotes', async (request: FastifyRequest<CreateQuoteRequest>, reply: FastifyReply) => {
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
      logger.error('Unexpected error in createQuoteRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
