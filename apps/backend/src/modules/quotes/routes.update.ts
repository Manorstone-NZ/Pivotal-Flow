import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';
import { UpdateQuoteSchema } from './schemas.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';
import { z } from 'zod';

interface UpdateQuoteRequest {
  Params: {
    id: string;
  };
  Body: z.infer<typeof UpdateQuoteSchema>;
}

/**
 * Register the update quote route
 */
export function registerUpdateQuoteRoute(fastify: FastifyInstance) {
  fastify.patch('/v1/quotes/:id', async (request: FastifyRequest<UpdateQuoteRequest>, reply: FastifyReply) => {
    try {
      // Validate request body
      const validatedData = UpdateQuoteSchema.parse(request.body);

      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { id } = request.params;

      // Create quote service
      const quoteService = new QuoteService((fastify as any).db, {
        organizationId: user.organizationId,
        userId: user.userId
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
      logger.error('Unexpected error in updateQuoteRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
