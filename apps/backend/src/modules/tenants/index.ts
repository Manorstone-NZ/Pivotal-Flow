/**
 * F1 Tenant Administration Module
 * Exports for tenant CRUD and membership management functionality
 */

import type { FastifyInstance } from 'fastify';

import {
  registerTenantListRoute,
  registerTenantCreateRoute,
  registerTenantDetailRoute,
  registerTenantUpdateRoute,
  registerTenantMembershipsListRoute,
  registerTenantMembershipCreateRoute,
  registerTenantMembershipUpdateRoute,
  registerTenantMembershipDeleteRoute,
  registerTenantFeaturesGetRoute,
  registerTenantFeaturesUpdateRoute,
} from './routes.js';

import { registerTenantSwitchRoute } from './routes.switch.js';

export { TenantService } from './service.js';
export * from './typeboxSchemas.js';

/**
 * Register all tenant administration routes
 */
export function registerTenantRoutes(fastify: FastifyInstance): void {
  // Core tenant CRUD operations
  registerTenantListRoute(fastify);
  registerTenantCreateRoute(fastify);
  registerTenantDetailRoute(fastify);
  registerTenantUpdateRoute(fastify);
  
  // Membership management
  registerTenantMembershipsListRoute(fastify);
  registerTenantMembershipCreateRoute(fastify);
  registerTenantMembershipUpdateRoute(fastify);
  registerTenantMembershipDeleteRoute(fastify);
  
  // Feature management
  registerTenantFeaturesGetRoute(fastify);
  registerTenantFeaturesUpdateRoute(fastify);
  
  // Tenant switching
  registerTenantSwitchRoute(fastify);
}
