/**
 * Organizations module
 * Exports for organization management functionality
 */

import type { FastifyInstance } from 'fastify';

import {
  registerOrganizationListRoute,
  registerOrganizationCreateRoute,
  registerOrganizationDetailRoute,
  registerOrganizationUpdateRoute,
  registerOrganizationDeleteRoute,
  registerOrganizationSettingsGetRoute,
  registerOrganizationSettingsUpdateRoute,
  registerOrganizationInviteUserRoute,
} from './routes.js';

export { OrganizationService } from './service.js';
export type * from './types.js';
export * from './schemas.js';

/**
 * Register all organization routes
 */
export function registerOrganizationRoutes(fastify: FastifyInstance): void {
  // Core CRUD operations
  registerOrganizationListRoute(fastify);
  registerOrganizationCreateRoute(fastify);
  registerOrganizationDetailRoute(fastify);
  registerOrganizationUpdateRoute(fastify);
  registerOrganizationDeleteRoute(fastify);
  
  // Settings management
  registerOrganizationSettingsGetRoute(fastify);
  registerOrganizationSettingsUpdateRoute(fastify);
  
  // User management
  registerOrganizationInviteUserRoute(fastify);
}

