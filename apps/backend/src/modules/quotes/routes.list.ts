import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { logger } from '../../lib/logger.js';
import type { PaginationOptions } from '../../lib/repo.base.js';

import { QuoteListFiltersSchema } from './schemas.js';
import { QuoteService } from './service.js';
// import { createTenantGuard } from '@pivotal-flow/shared/dist/tenancy/guard.js';

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
 * Register the list quotes route
 */
export function registerListQuotesRoute(fastify: FastifyInstance) {
  fastify.get('/v1/quotes', async (request: FastifyRequest<ListQuotesRequest>, reply: FastifyReply) => {
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

      // Parse and validate query parameters
      const pagination: PaginationOptions = {
        page: request.query.page || 1,
        pageSize: request.query.pageSize || 20
      };

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
      const quoteService = new QuoteService((fastify as any).db, {
        organizationId: user.organizationId,
        userId: user.userId
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
      logger.error('Unexpected error in listQuotesRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
