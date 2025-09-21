import { createQuoteRoute } from './routes.create.js';
import { registerGetQuoteRoute } from './routes.get.js';
import { registerListQuotesRoute } from './routes.list.js';
import { registerStatusTransitionRoute } from './routes.status.js';
import { registerUpdateQuoteRoute } from './routes.update.js';
import { registerGetQuoteVersionsRoute, registerGetQuoteVersionRoute } from './routes.versions.js';
import { registerQuoteLineItemRoutes, registerSubmitQuoteRoute } from './routes.line-items.js';
import { registerQuoteDeliveryRoute } from './routes.delivery.js';
// import { registerPublicQuoteRoutes } from './routes.public.js'; // TODO: Use when needed
/**
 * Register all quote routes with Fastify
 */
export function registerQuoteRoutes(fastify) {
    // Register individual routes directly
    createQuoteRoute(fastify);
    registerListQuotesRoute(fastify);
    registerGetQuoteRoute(fastify);
    registerUpdateQuoteRoute(fastify);
    registerStatusTransitionRoute(fastify);
    registerGetQuoteVersionsRoute(fastify);
    registerGetQuoteVersionRoute(fastify);
    registerQuoteLineItemRoutes(fastify);
    registerSubmitQuoteRoute(fastify);
    // Register new delivery routes for E13
    registerQuoteDeliveryRoute(fastify);
    // Note: Public routes are registered separately in routes.ts to bypass authentication
}
// Export types and schemas for use in other modules
export * from './typeboxSchemas.js';
export * from './service.js';
export * from './quote-number.js';
//# sourceMappingURL=index.js.map