// Assign role to user route with RBAC and audit logging

import { generateId } from '@pivotal-flow/shared';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '../../lib/logger.js';
import { auditLogs } from '../../lib/schema.js';

import { canModifyUser, extractUserContext } from './rbac.js';
import { 
  roleAssignmentSchema
} from './schemas.js';
import { addRoleToUser } from './service.drizzle.js';

export const assignRoleRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/users/:id/roles', {
    schema: {
      
      
      
      
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'User ID' }
        },
        additionalProperties: false
      },
      body: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'string', description: 'Role ID to assign' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          },
          additionalProperties: false
        },
        400: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        401: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        403: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        404: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        429: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Extract user context
      const userContext = extractUserContext(request);
      const { id: targetUserId } = request.params;

      // Check permissions
      const permissionCheck = await canModifyUser(userContext, targetUserId, fastify);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: 'users.role.add',
          targetUserId,
          reason: permissionCheck.reason,
          message: 'Permission denied for assigning role to user'
        });
        
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to modify this user',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Validate request body
      const { roleId } = roleAssignmentSchema.parse(request.body);

      // Assign role to user
      await addRoleToUser(targetUserId, roleId, userContext.organizationId, fastify);

      // Log audit event (simplified for now)
      try {
        await (fastify as any).db
          .insert(auditLogs)
          .values({
            id: generateId(),
            organizationId: userContext.organizationId,
            actorId: userContext.userId,
            action: 'users.role_added',
            entityType: 'User',
            entityId: targetUserId,
            newValues: JSON.stringify({ roleId, action: 'role_assigned' }),
            metadata: JSON.stringify({
              actorUserId: userContext.userId,
              targetUserId,
              organizationId: userContext.organizationId,
              roleId
            }),
            createdAt: new Date()
          });
      } catch (auditError) {
        logger.warn({ err: auditError }, 'Audit log write failed for role assignment');
      }

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.role.add',
        targetUserId,
        roleId,
        organizationId: userContext.organizationId,
        message: 'Role assigned successfully'
      });

      // Return response
      return reply.status(200).send({
        success: true,
        message: 'Role assigned successfully'
      });

    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation Error')) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR',
          details: error.message
        });
      }

      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        action: 'users.role.add',
        targetUserId: request.params.id,
        message: 'Error assigning role to user'
      });

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while assigning the role',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
