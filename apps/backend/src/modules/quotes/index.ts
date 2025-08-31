import { FastifyInstance } from 'fastify';
import { registerCreateQuoteRoute } from './routes.create.js';
import { registerListQuotesRoute } from './routes.list.js';
import { registerGetQuoteRoute } from './routes.get.js';
import { registerUpdateQuoteRoute } from './routes.update.js';
import { registerStatusTransitionRoute } from './routes.status.js';

/**
 * Register all quote routes with Fastify
 */
export function registerQuoteRoutes(fastify: FastifyInstance) {
  // Register individual routes
  registerCreateQuoteRoute(fastify);
  registerListQuotesRoute(fastify);
  registerGetQuoteRoute(fastify);
  registerUpdateQuoteRoute(fastify);
  registerStatusTransitionRoute(fastify);

  fastify.log.info('Quote routes registered');
}

// Export types and schemas for use in other modules
export * from './schemas.js';
export * from './service.js';
export * from './quote-number.js';
