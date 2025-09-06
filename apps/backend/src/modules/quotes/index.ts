import type { FastifyInstance } from 'fastify';

import { registerCreateQuoteRoute } from './routes.create.js';
import { registerGetQuoteRoute } from './routes.get.js';
import { registerListQuotesRoute } from './routes.list.js';
import { registerStatusTransitionRoute } from './routes.status.js';
import { registerUpdateQuoteRoute } from './routes.update.js';
import { registerGetQuoteVersionsRoute, registerGetQuoteVersionRoute } from './routes.versions.js';

/**
 * Register all quote routes with Fastify
 */
export function registerQuoteRoutes(fastify: FastifyInstance) {
  // Register individual routes directly
  registerCreateQuoteRoute(fastify);
  registerListQuotesRoute(fastify);
  registerGetQuoteRoute(fastify);
  registerUpdateQuoteRoute(fastify);
  registerStatusTransitionRoute(fastify);
  registerGetQuoteVersionsRoute(fastify);
  registerGetQuoteVersionRoute(fastify);
}

// Export types and schemas for use in other modules
export * from './schemas.js';
export * from './service.js';
export * from './quote-number.js';
