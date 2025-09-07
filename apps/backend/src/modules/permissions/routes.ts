import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

import { 
  PermissionResponseSchema,
  PermissionErrorSchema,
  type PermissionResponse,
  type PermissionError
} from './typeboxSchemas.js';

// Type definition for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
};

export async function permissionRoutes(fastify: FastifyInstance) {
  // Get all permissions
  fastify.get<{
    Reply: PermissionResponse[] | PermissionError;
  }>('/permissions', {
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
      const authenticatedRequest = request as AuthenticatedRequest;
      
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
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get permissions',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}