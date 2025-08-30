// Update user status route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { 
  userStatusSchema
} from './schemas.js';
import { getUserById, updateUser } from './service.js';
import { canModifyUser, extractUserContext } from './rbac.js';
import { logger } from '../../lib/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateUserStatusRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/users/:id/status', {
    schema: {
      tags: ['Users'],
      summary: 'Update user status',
      description: 'Activate or deactivate a user in the current organization',
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
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', description: 'User active status' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          description: 'User status updated successfully',
          type: 'object',
          required: ['id', 'email', 'isActive', 'mfaEnabled', 'createdAt', 'roles'],
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            displayName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            isActive: { type: 'boolean' },
            mfaEnabled: { type: 'boolean' },
            createdAt: { type: 'string' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'name', 'isSystem', 'isActive'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  isSystem: { type: 'boolean' },
                  isActive: { type: 'boolean' }
                },
                additionalProperties: false
              }
            }
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
          action: 'users.status',
          targetUserId,
          reason: permissionCheck.reason,
          message: 'Permission denied for updating user status'
        });
        
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to modify this user',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Validate request body
      const { isActive } = userStatusSchema.parse(request.body);

      // Get current user data for audit logging
      const currentUser = await getUserById(targetUserId, userContext.organizationId);
      if (!currentUser) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found in this organization',
          code: 'USER_NOT_FOUND'
        });
      }

      // Prevent deactivating the last admin user
      if (!isActive && currentUser.roles.some(role => role.name === 'admin' && role.isActive)) {
        const adminCount = await prisma.userRole.count({
          where: {
            userId: { not: targetUserId },
            role: {
              name: 'admin',
              isActive: true
            },
            user: {
              organizationId: userContext.organizationId,
              status: 'active',
              deletedAt: null
            }
          }
        });

        if (adminCount === 0) {
          logger.warn({
            userId: userContext.userId,
            action: 'users.status',
            targetUserId,
            organizationId: userContext.organizationId,
            message: 'Attempted to deactivate last admin user'
          });

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Cannot deactivate the last admin user in the organization',
            code: 'LAST_ADMIN_DEACTIVATION'
          });
        }
      }

      // Update user status
      const updatedUser = await updateUser(targetUserId, userContext.organizationId, { isActive });

      if (!updatedUser) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found in this organization',
          code: 'USER_NOT_FOUND'
        });
      }

      // Log audit event for status change
      await prisma.auditLog.create({
        data: {
          organizationId: userContext.organizationId,
          userId: userContext.userId,
          action: 'users.status_changed',
          entityType: 'User',
          entityId: targetUserId,
          oldValues: { isActive: currentUser.isActive },
          newValues: { isActive },
          metadata: {
            actorUserId: userContext.userId,
            targetUserId,
            organizationId: userContext.organizationId,
            previousStatus: currentUser.isActive ? 'active' : 'inactive',
            newStatus: isActive ? 'active' : 'inactive'
          }
        }
      });

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.status',
        targetUserId,
        organizationId: userContext.organizationId,
        previousStatus: currentUser.isActive ? 'active' : 'inactive',
        newStatus: isActive ? 'active' : 'inactive',
        message: 'User status updated successfully'
      });

      // Return response
      return reply.status(200).send(updatedUser);

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
        action: 'users.status',
        targetUserId: request.params.id,
        message: 'Error updating user status'
      });

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while updating the user status',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
