/**
 * Reports module entry point
 * Governed reporting exports and compliance views
 */
import type { FastifyInstance } from 'fastify';
/**
 * Register the reports module
 */
export declare function reportsModule(fastify: FastifyInstance): Promise<void>;
export * from './service.js';
export * from './export-job.service.js';
export * from './metrics.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
//# sourceMappingURL=index.d.ts.map