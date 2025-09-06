import { z } from 'zod';
import { PERMISSIONS } from './constants.js';
import { PermissionService } from './service.js';
// Request schemas
const CheckPermissionRequestSchema = z.object({
    body: z.object({
        userId: z.string().uuid('User ID must be a valid UUID').optional(),
        permission: z.string().min(1, 'Permission is required')
    })
});
export async function permissionRoutes(fastify) {
    // Check if user has a specific permission
    fastify.post('/permissions/check', {
        schema: {
            body: {
                type: 'object',
                required: ['permission'],
                properties: {
                    userId: { type: 'string', format: 'uuid' },
                    permission: { type: 'string', minLength: 1 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        hasPermission: { type: 'boolean' },
                        reason: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { body } = CheckPermissionRequestSchema.parse(request);
            const authenticatedRequest = request;
            const permissionService = new PermissionService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const userId = body.userId || authenticatedRequest.user.userId;
            const permissionCheck = await permissionService.hasPermission(userId, body.permission);
            reply.send(permissionCheck);
        }
        catch (error) {
            fastify.log.error(error, 'Error checking permission');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Check if current user can override quote prices
    fastify.get('/permissions/can-override-quote-price', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        hasPermission: { type: 'boolean' },
                        reason: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const permissionService = new PermissionService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const permissionCheck = await permissionService.canCurrentUserOverrideQuotePrice();
            reply.send(permissionCheck);
        }
        catch (error) {
            fastify.log.error(error, 'Error checking quote price override permission');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get current user's permissions
    fastify.get('/permissions/current-user', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        permissions: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const permissionService = new PermissionService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const permissions = await permissionService.getCurrentUserPermissions();
            reply.send({ permissions });
        }
        catch (error) {
            fastify.log.error(error, 'Error getting current user permissions');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get user permissions by user ID
    fastify.get('/permissions/user/:userId', {
        schema: {
            params: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string', format: 'uuid' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        permissions: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { userId: targetUserId } = request.params;
            const authenticatedRequest = request;
            const permissionService = new PermissionService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const permissions = await permissionService.getUserPermissions(targetUserId);
            reply.send({ permissions });
        }
        catch (error) {
            fastify.log.error(error, 'Error getting user permissions');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get all available permissions
    fastify.get('/permissions/available', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        permissions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    category: { type: 'string' },
                                    resource: { type: 'string' },
                                    action: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            // Return all available permissions
            reply.send({ permissions: PERMISSIONS });
        }
        catch (error) {
            fastify.log.error(error, 'Error getting available permissions');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map