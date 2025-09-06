import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { logger } from '../../lib/logger.js';

import { QuoteStatusTransitionSchema } from './schemas.js';
import { QuoteService } from './service.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';

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
  fastify.post('/v1/quotes/:id/status', async (request: FastifyRequest<StatusTransitionRequest>, reply: FastifyReply) => {
    try {
      // Validate request body
      const validatedData = QuoteStatusTransitionSchema.parse(request.body);

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
          return reply.status(400).send({
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
      logger.error('Unexpected error in statusTransitionRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
