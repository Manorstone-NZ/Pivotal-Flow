import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '../../lib/logger.js';

import { QuoteService } from './service.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';

interface GetQuoteRequest {
  Params: {
    id: string;
  };
}

/**
 * Register the get quote route
 */
export function registerGetQuoteRoute(fastify: FastifyInstance) {
  fastify.get('/v1/quotes/:id', async (request: FastifyRequest<GetQuoteRequest>, reply: FastifyReply) => {
    try {
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
      logger.error('Unexpected error in getQuoteRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
