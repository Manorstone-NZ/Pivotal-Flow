import type { FastifyInstance } from 'fastify';

import {
  registerListInvoicesRoute,
  registerGetInvoiceRoute,
  registerCreateInvoiceRoute,
  registerUpdateInvoiceRoute,
  registerInvoiceStatusRoute,
  registerMarkInvoicePaidRoute,
  registerVoidInvoiceRoute,
} from './routes.js';

/**
 * Register all invoice routes with Fastify
 */
export function registerInvoiceRoutes(fastify: FastifyInstance) {
  // Register individual routes
  registerListInvoicesRoute(fastify);
  registerGetInvoiceRoute(fastify);
  registerCreateInvoiceRoute(fastify);
  registerUpdateInvoiceRoute(fastify);
  registerInvoiceStatusRoute(fastify);
  registerMarkInvoicePaidRoute(fastify);
  registerVoidInvoiceRoute(fastify);
}

// Export types and schemas for use in other modules
export * from './typeboxSchemas.js';
export * from './service.js';
