/**
 * F1 Tenant Administration Routes
 * API endpoints for tenant CRUD and membership management
 */
import type { FastifyInstance } from 'fastify';
/**
 * GET /v1/admin/tenants - List all tenants
 */
export declare function registerTenantListRoute(fastify: FastifyInstance): void;
/**
 * POST /v1/admin/tenants - Create new tenant
 */
export declare function registerTenantCreateRoute(fastify: FastifyInstance): void;
/**
 * GET /v1/admin/tenants/:id - Get tenant details
 */
export declare function registerTenantDetailRoute(fastify: FastifyInstance): void;
/**
 * PATCH /v1/admin/tenants/:id - Update tenant
 */
export declare function registerTenantUpdateRoute(fastify: FastifyInstance): void;
/**
 * GET /v1/admin/tenants/:id/memberships - List tenant memberships
 */
export declare function registerTenantMembershipsListRoute(fastify: FastifyInstance): void;
/**
 * POST /v1/admin/tenants/:id/memberships - Add user to tenant
 */
export declare function registerTenantMembershipCreateRoute(fastify: FastifyInstance): void;
/**
 * PATCH /v1/admin/tenants/:id/memberships/:userId - Update membership role
 */
export declare function registerTenantMembershipUpdateRoute(fastify: FastifyInstance): void;
/**
 * DELETE /v1/admin/tenants/:id/memberships/:userId - Remove user from tenant
 */
export declare function registerTenantMembershipDeleteRoute(fastify: FastifyInstance): void;
/**
 * GET /v1/admin/tenants/:id/features - Get tenant features
 */
export declare function registerTenantFeaturesGetRoute(fastify: FastifyInstance): void;
/**
 * PUT /v1/admin/tenants/:id/features - Update tenant features
 */
export declare function registerTenantFeaturesUpdateRoute(fastify: FastifyInstance): void;
//# sourceMappingURL=routes.d.ts.map