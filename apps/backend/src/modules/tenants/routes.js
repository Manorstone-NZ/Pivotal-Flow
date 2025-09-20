/**
 * F1 Tenant Administration Routes
 * API endpoints for tenant CRUD and membership management
 */
import { TenantService } from './service.js';
import { TenantSchema, CreateTenantSchema, UpdateTenantSchema, TenantListResponseSchema, MembershipSchema, CreateMembershipSchema, UpdateMembershipSchema, MembershipListResponseSchema, TenantFeatureListResponseSchema, UpdateTenantFeaturesSchema, TenantSwitchSchema, TenantSwitchResponseSchema, TenantErrorSchema, } from './typeboxSchemas.js';
// ============================================================================
// TENANT CRUD ROUTES
// ============================================================================
/**
 * GET /v1/admin/tenants - List all tenants
 */
export function registerTenantListRoute(fastify) {
    fastify.get('/v1/admin/tenants', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
                    sortBy: { type: 'string', enum: ['name', 'createdAt'], default: 'name' },
                    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
                },
            },
            response: {
                200: TenantListResponseSchema,
                401: TenantErrorSchema,
                403: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { page, limit, sortBy, sortOrder } = request.query;
            const tenantService = new TenantService();
            const result = await tenantService.listTenants({
                page,
                limit,
                sortBy,
                sortOrder,
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to list tenants');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to list tenants',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * POST /v1/admin/tenants - Create new tenant
 */
export function registerTenantCreateRoute(fastify) {
    fastify.post('/v1/admin/tenants', {
        schema: {
            body: CreateTenantSchema,
            response: {
                201: TenantSchema,
                400: TenantErrorSchema,
                409: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const data = request.body;
            const user = request.user;
            const tenantService = new TenantService();
            const newTenant = await tenantService.createTenant(data, user?.userId);
            return reply.status(201).send(newTenant);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to create tenant');
            if (error.message === 'TENANT_SLUG_EXISTS') {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: 'Tenant with this slug already exists',
                    code: 'TENANT_SLUG_EXISTS',
                });
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create tenant',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * GET /v1/admin/tenants/:id - Get tenant details
 */
export function registerTenantDetailRoute(fastify) {
    fastify.get('/v1/admin/tenants/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            response: {
                200: TenantSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const tenantService = new TenantService();
            const tenant = await tenantService.getTenantById(id);
            if (!tenant) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            return reply.status(200).send(tenant);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to get tenant');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get tenant',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * PATCH /v1/admin/tenants/:id - Update tenant
 */
export function registerTenantUpdateRoute(fastify) {
    fastify.patch('/v1/admin/tenants/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            body: UpdateTenantSchema,
            response: {
                200: TenantSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const tenantService = new TenantService();
            const updatedTenant = await tenantService.updateTenant(id, data);
            return reply.status(200).send(updatedTenant);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to update tenant');
            if (error.message === 'TENANT_NOT_FOUND') {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update tenant',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
// ============================================================================
// MEMBERSHIP MANAGEMENT ROUTES
// ============================================================================
/**
 * GET /v1/admin/tenants/:id/memberships - List tenant memberships
 */
export function registerTenantMembershipsListRoute(fastify) {
    fastify.get('/v1/admin/tenants/:id/memberships', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
                    includeUser: { type: 'boolean', default: true },
                },
            },
            response: {
                200: MembershipListResponseSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { page, limit, includeUser } = request.query;
            const tenantService = new TenantService();
            // Verify tenant exists
            const tenant = await tenantService.getTenantById(id);
            if (!tenant) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            const result = await tenantService.listMemberships(id, {
                page,
                limit,
                includeUser,
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to list memberships');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to list memberships',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * POST /v1/admin/tenants/:id/memberships - Add user to tenant
 */
export function registerTenantMembershipCreateRoute(fastify) {
    fastify.post('/v1/admin/tenants/:id/memberships', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            body: CreateMembershipSchema,
            response: {
                201: MembershipSchema,
                404: TenantErrorSchema,
                409: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const tenantService = new TenantService();
            // Verify tenant exists
            const tenant = await tenantService.getTenantById(id);
            if (!tenant) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            const newMembership = await tenantService.createMembership(id, data);
            return reply.status(201).send(newMembership);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to create membership');
            if (error.message === 'MEMBERSHIP_EXISTS') {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: 'User is already a member of this tenant',
                    code: 'MEMBERSHIP_EXISTS',
                });
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create membership',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * PATCH /v1/admin/tenants/:id/memberships/:userId - Update membership role
 */
export function registerTenantMembershipUpdateRoute(fastify) {
    fastify.patch('/v1/admin/tenants/:id/memberships/:userId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    userId: { type: 'string', format: 'uuid' },
                },
                required: ['id', 'userId'],
            },
            body: UpdateMembershipSchema,
            response: {
                200: MembershipSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id, userId } = request.params;
            const data = request.body;
            const tenantService = new TenantService();
            const updatedMembership = await tenantService.updateMembership(userId, id, data);
            return reply.status(200).send(updatedMembership);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to update membership');
            if (error.message === 'MEMBERSHIP_NOT_FOUND') {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Membership not found',
                    code: 'MEMBERSHIP_NOT_FOUND',
                });
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update membership',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * DELETE /v1/admin/tenants/:id/memberships/:userId - Remove user from tenant
 */
export function registerTenantMembershipDeleteRoute(fastify) {
    fastify.delete('/v1/admin/tenants/:id/memberships/:userId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    userId: { type: 'string', format: 'uuid' },
                },
                required: ['id', 'userId'],
            },
            response: {
                200: MembershipSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id, userId } = request.params;
            const tenantService = new TenantService();
            const deletedMembership = await tenantService.deleteMembership(userId, id);
            return reply.status(200).send(deletedMembership);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to delete membership');
            if (error.message === 'MEMBERSHIP_NOT_FOUND') {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Membership not found',
                    code: 'MEMBERSHIP_NOT_FOUND',
                });
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to delete membership',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
// ============================================================================
// FEATURE MANAGEMENT ROUTES
// ============================================================================
/**
 * GET /v1/admin/tenants/:id/features - Get tenant features
 */
export function registerTenantFeaturesGetRoute(fastify) {
    fastify.get('/v1/admin/tenants/:id/features', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            response: {
                200: TenantFeatureListResponseSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const tenantService = new TenantService();
            // Verify tenant exists
            const tenant = await tenantService.getTenantById(id);
            if (!tenant) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            const result = await tenantService.getTenantFeatures(id);
            return reply.status(200).send(result);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to get tenant features');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get tenant features',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
/**
 * PUT /v1/admin/tenants/:id/features - Update tenant features
 */
export function registerTenantFeaturesUpdateRoute(fastify) {
    fastify.put('/v1/admin/tenants/:id/features', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            },
            body: UpdateTenantFeaturesSchema,
            response: {
                200: TenantFeatureListResponseSchema,
                404: TenantErrorSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const tenantService = new TenantService();
            // Verify tenant exists
            const tenant = await tenantService.getTenantById(id);
            if (!tenant) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Tenant not found',
                    code: 'TENANT_NOT_FOUND',
                });
            }
            const result = await tenantService.updateTenantFeatures(id, data);
            return reply.status(200).send(result);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to update tenant features');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update tenant features',
                code: 'INTERNAL_ERROR',
            });
        }
    });
}
//# sourceMappingURL=routes.js.map