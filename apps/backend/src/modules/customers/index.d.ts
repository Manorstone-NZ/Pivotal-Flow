/**
 * Customer Module Index
 * Main module exports and registration
 */
import type { FastifyInstance } from 'fastify';
/**
 * Register customer module routes
 */
export declare function registerCustomerRoutes(fastify: FastifyInstance): Promise<void>;
export { CustomerService } from './service.js';
export { customerRoutes } from './routes.js';
export * from './types.js';
export * from './schemas.js';
//# sourceMappingURL=index.d.ts.map