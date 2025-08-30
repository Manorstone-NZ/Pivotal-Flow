// Remove role from user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { removeRole } from './service.js';
import { canModifyUser, extractUserContext } from './rbac.js';
import { logger } from '../../lib/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const removeRoleRoute: FastifyPluginAsync = async (fastify) => {
  fastify.delete('/v1/users/:id/roles/:roleId', {
    schema: {
      tags: ['Users'],
      summary: 'Remove role from user',
      description: 'Remove a role from a user in the current organization',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id', 'roleId'],
        properties: {
          id: { type: 'string', description: 'User ID' },
          roleId: { type: 'string', description: 'Role ID to remove' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          description: 'Role removed successfully',
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
  }, async (request: FastifyRequest<{ Params: { id: string; roleId: string } }>, reply: FastifyReply) => {
    try {
      // Extract user context
      const userContext = extractUserContext(request);
      const { id: targetUserId, roleId } = request.params;

      // Check permissions
      const permissionCheck = await canModifyUser(userContext, targetUserId);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: 'users.role.remove',
          targetUserId,
          roleId,
          reason: permissionCheck.reason,
          message: 'Permission denied for removing role from user'
        });
        
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to modify this user',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Remove role from user
      const result = await removeRole(targetUserId, roleId, userContext.organizationId);

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
          message: result.message || 'Failed to remove role',
          code: 'ROLE_REMOVAL_FAILED'
        });
      }

      // Log audit event
      await prisma.auditLog.create({
        data: {
          organizationId: userContext.organizationId,
          userId: userContext.userId,
          action: 'users.role_removed',
          entityType: 'User',
          entityId: targetUserId,
          oldValues: {
            roleId,
            action: 'role_removed'
          },
          metadata: {
            actorUserId: userContext.userId,
            targetUserId,
            organizationId: userContext.organizationId,
            roleId,
            wasRemoved: result.wasRemoved
          }
        }
      });

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.role.remove',
        targetUserId,
        roleId,
        organizationId: userContext.organizationId,
        wasRemoved: result.wasRemoved,
        message: 'Role removed successfully'
      });

      // Return response
      return reply.status(200).send({
        success: true,
        message: result.wasRemoved 
          ? 'Role removed successfully' 
          : 'Role was not assigned to user'
      });

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        action: 'users.role.remove',
        targetUserId: request.params.id,
        roleId: request.params.roleId,
        message: 'Error removing role from user'
      });

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while removing the role',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
