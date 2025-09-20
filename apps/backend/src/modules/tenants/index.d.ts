/**
 * F1 Tenant Administration Module
 * Exports for tenant CRUD and membership management functionality
 */
import type { FastifyInstance } from 'fastify';
export { TenantService } from './service.js';
export * from './typeboxSchemas.js';
/**
 * Register all tenant administration routes
 */
export declare function registerTenantRoutes(fastify: FastifyInstance): void;
//# sourceMappingURL=index.d.ts.map