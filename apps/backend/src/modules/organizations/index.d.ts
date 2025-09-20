/**
 * Organizations module
 * Exports for organization management functionality
 */
import type { FastifyInstance } from 'fastify';
export { OrganizationService } from './service.js';
export type * from './types.js';
export * from './schemas.js';
/**
 * Register all organization routes
 */
export declare function registerOrganizationRoutes(fastify: FastifyInstance): void;
//# sourceMappingURL=index.d.ts.map