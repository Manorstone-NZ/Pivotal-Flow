/**
 * Portal Module
 *
 * Customer portal API module for read-only access to quotes, invoices, and time entries
 */
import { portalRoutes } from './routes.js';
/**
 * Register portal module with Fastify
 */
export async function portalModule(fastify) {
    await fastify.register(portalRoutes);
}
// Export all module components
export * from './service.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
export * from './rate-limiter.js';
//# sourceMappingURL=index.js.map