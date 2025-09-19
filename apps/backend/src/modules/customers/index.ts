/**
 * Customer Module Index
 * Main module exports and registration
 */

import type { FastifyInstance } from 'fastify';
import { registerCustomerListRoute, registerCustomerCreateRoute, registerCustomerGetRoute, registerCustomerUpdateRoute, registerCustomerDeleteRoute } from './routes.js';
import { registerContactListRoute, registerContactCreateRoute, registerContactGetRoute, registerContactUpdateRoute, registerContactDeleteRoute } from './routes.js';

/**
 * Register customer module routes (following quotes pattern)
 */
export function registerCustomerRoutes(fastify: FastifyInstance): void {
  // Register customer routes
  registerCustomerListRoute(fastify);
  registerCustomerCreateRoute(fastify);
  registerCustomerGetRoute(fastify);
  registerCustomerUpdateRoute(fastify);
  registerCustomerDeleteRoute(fastify);
  
  // Register contact routes
  registerContactListRoute(fastify);
  registerContactCreateRoute(fastify);
  registerContactGetRoute(fastify);
  registerContactUpdateRoute(fastify);
  registerContactDeleteRoute(fastify);
}

// Export all module components
export { CustomerService } from './service.js';
export * from './types.js';
export * from './schemas.js';
