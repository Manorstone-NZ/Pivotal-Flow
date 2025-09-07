import { Type } from '@sinclair/typebox';
import { PermissionResponseSchema, PermissionErrorSchema } from './typeboxSchemas.js';
export async function permissionRoutes(fastify) {
    // Get all permissions
    fastify.get('/permissions', {
        schema: {
            response: {
                200: Type.Array(PermissionResponseSchema),
                401: PermissionErrorSchema,
                403: PermissionErrorSchema,
                500: PermissionErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            // Mock permissions for now
            const permissions = [
                {
                    id: '1',
                    name: 'users.view',
                    description: 'View users',
                    resource: 'users',
                    action: 'view',
                    organizationId: authenticatedRequest.user.organizationId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'users.create',
                    description: 'Create users',
                    resource: 'users',
                    action: 'create',
                    organizationId: authenticatedRequest.user.organizationId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            return reply.status(200).send(permissions);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get permissions',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map