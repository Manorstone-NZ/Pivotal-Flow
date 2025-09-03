/**
 * Reports module entry point
 * Governed reporting exports and compliance views
 */

import type { FastifyInstance } from 'fastify';
import { reportsRoutes } from './routes.js';

/**
 * Register the reports module
 */
export async function reportsModule(fastify: FastifyInstance): Promise<void> {
  // Register routes under /v1/reports prefix
  await fastify.register(reportsRoutes, { prefix: '/v1/reports' });
}

// Export all components for external use
export * from './service.js';
export * from './export-job.service.js';
export * from './metrics.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
