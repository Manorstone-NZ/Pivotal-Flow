/**
 * Portal Module
 *
 * Customer portal API module for read-only access to quotes, invoices, and time entries
 */
import type { FastifyInstance } from 'fastify';
/**
 * Register portal module with Fastify
 */
export declare function portalModule(fastify: FastifyInstance): Promise<void>;
export * from './service.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
export * from './rate-limiter.js';
//# sourceMappingURL=index.d.ts.map