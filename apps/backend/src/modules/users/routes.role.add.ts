// Assign role to user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { 
  roleAssignmentSchema
} from './schemas.js';
import { assignRole } from './service.js';
import { canModifyUser, extractUserContext } from './rbac.js';
import { logger } from '../../lib/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const assignRoleRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/users/:id/roles', {
    schema: {
      tags: ['Users'],
      summary: 'Assign role to user',
      description: 'Assign a role to a user in the current organization',
      security: [{ bearerAuth: [] }],
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
          description: 'Role assigned successfully',
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
      const permissionCheck = await canModifyUser(userContext, targetUserId);
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
      const result = await assignRole(targetUserId, roleId, userContext.organizationId, userContext.userId);

      if (!result.success) {
        if (result.error === 'USER_NOT_FOUND') {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User not found in this organization',
            code: 'USER_NOT_FOUND'
          });
        }
        
        if (result.error === 'ROLE_NOT_FOUND') {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Role not found in this organization',
            code: 'ROLE_NOT_FOUND'
          });
        }

        return reply.status(400).send({
          error: 'Bad Request',
          message: result.message || 'Failed to assign role',
          code: 'ROLE_ASSIGNMENT_FAILED'
        });
      }

      // Log audit event
      await prisma.auditLog.create({
        data: {
          organizationId: userContext.organizationId,
          userId: userContext.userId,
          action: 'users.role_added',
          entityType: 'User',
          entityId: targetUserId,
          newValues: {
            roleId,
            action: 'role_assigned'
          },
          metadata: {
            actorUserId: userContext.userId,
            targetUserId,
            organizationId: userContext.organizationId,
            roleId,
            wasNewAssignment: result.wasNewAssignment
          }
        }
      });

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.role.add',
        targetUserId,
        roleId,
        organizationId: userContext.organizationId,
        wasNewAssignment: result.wasNewAssignment,
        message: 'Role assigned successfully'
      });

      // Return response
      return reply.status(200).send({
        success: true,
        message: result.wasNewAssignment 
          ? 'Role assigned successfully' 
          : 'Role was already assigned to user'
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
