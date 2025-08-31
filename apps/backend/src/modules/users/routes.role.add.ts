// Assign role to user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { 
  roleAssignmentSchema
} from './schemas.js';
import { addRoleToUser } from './service.sql.js';
import { canModifyUser, extractUserContext } from './rbac.js';
import { logger } from '../../lib/logger.js';

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
        await fastify.db.query(`
          INSERT INTO audit_logs (
            id, organization_id, user_id, action, entity_type, entity_id,
            new_values, metadata, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
          )
        `, [
          userContext.organizationId,
          userContext.userId,
          'users.role_added',
          'User',
          targetUserId,
          JSON.stringify({ roleId, action: 'role_assigned' }),
          JSON.stringify({
            actorUserId: userContext.userId,
            targetUserId,
            organizationId: userContext.organizationId,
            roleId
          })
        ]);
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
