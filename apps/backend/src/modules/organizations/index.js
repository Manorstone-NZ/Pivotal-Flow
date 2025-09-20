/**
 * Organizations module
 * Exports for organization management functionality
 */
import { registerOrganizationListRoute, registerOrganizationCreateRoute, registerOrganizationDetailRoute, registerOrganizationUpdateRoute, registerOrganizationDeleteRoute, registerOrganizationSettingsGetRoute, registerOrganizationSettingsUpdateRoute, registerOrganizationInviteUserRoute, } from './routes.js';
export { OrganizationService } from './service.js';
export * from './schemas.js';
/**
 * Register all organization routes
 */
export function registerOrganizationRoutes(fastify) {
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
//# sourceMappingURL=index.js.map