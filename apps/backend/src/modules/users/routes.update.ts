// Update user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { userUpdateSchema } from "./schemas.js";
import { getUserById, updateUser } from "./service.drizzle.js";
import { canModifyUser, extractUserContext } from "./rbac.js";
import { logger } from "../../lib/logger.js";
import { auditLogs } from "../../lib/schema.js";
import * as crypto from "crypto";

export const updateUserRoute: FastifyPluginAsync = async fastify => {
  fastify.patch("/v1/users/:id", {
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
        properties: {
          displayName: { type: 'string', maxLength: 200, description: 'User display name' },
          isActive: { type: 'boolean', description: 'User active status' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          
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
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userContext = extractUserContext(request);
      const { id: targetUserId } = request.params;

      const permissionCheck = await canModifyUser(userContext, targetUserId, fastify);
      if (!permissionCheck.hasPermission) {
        logger.warn({ 
          userId: userContext.userId, 
          action: "users.update", 
          targetUserId,
          reason: permissionCheck.reason, 
          message: "Permission denied for updating user" 
        });
        return reply.status(403).send({
          error: "Forbidden", 
          message: "Insufficient permissions to update this user",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      const updateData = userUpdateSchema.parse(request.body);
      const currentUser = await getUserById(targetUserId, userContext.organizationId, fastify);
      if (!currentUser) {
        return reply.status(404).send({
          error: "Not Found", 
          message: "User not found in this organization", 
          code: "USER_NOT_FOUND"
        });
      }

      const updatedUser = await updateUser(targetUserId, updateData as any, userContext.organizationId, fastify);
      if (!updatedUser) {
        return reply.status(404).send({
          error: "Not Found", 
          message: "User not found in this organization", 
          code: "USER_NOT_FOUND"
        });
      }

      const oldValues: Record<string, any> = {};
      const newValues: Record<string, any> = {};
      if (updateData.displayName !== undefined) {
        oldValues['displayName'] = currentUser.displayName;
        newValues['displayName'] = updateData.displayName;
      }
      if (updateData.isActive !== undefined) {
        oldValues['isActive'] = currentUser.status === 'active';
        newValues['isActive'] = updateData.isActive;
      }

      // write audits using SQL
      await (fastify as any).db
        .insert(auditLogs)
        .values({
          id: crypto.randomUUID(),
          organizationId: userContext.organizationId,
          actorId: userContext.userId,
          action: 'users.update',
          entityType: 'User',
          entityId: targetUserId,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
          metadata: JSON.stringify({
            actorUserId: userContext.userId,
            targetUserId,
            organizationId: userContext.organizationId
          }),
          createdAt: new Date()
        });

      if (updateData.isActive !== undefined && updateData.isActive !== (currentUser.status === 'active')) {
        await (fastify as any).db
          .insert(auditLogs)
          .values({
            id: crypto.randomUUID(),
            organizationId: userContext.organizationId,
            actorId: userContext.userId,
            action: 'users.status_changed',
            entityType: 'User',
            entityId: targetUserId,
            oldValues: JSON.stringify({ isActive: currentUser.status === 'active' }),
            newValues: JSON.stringify({ isActive: updateData.isActive }),
            metadata: JSON.stringify({
              actorUserId: userContext.userId,
              targetUserId,
              organizationId: userContext.organizationId,
              previousStatus: currentUser.status === 'active' ? "active" : "inactive",
              newStatus: updateData.isActive ? "active" : "inactive"
            }),
            createdAt: new Date()
          });
      }

      logger.info({
        userId: userContext.userId, 
        action: "users.update", 
        targetUserId,
        organizationId: userContext.organizationId, 
        updatedFields: Object.keys(newValues),
        message: "User updated successfully"
      });

      return reply.status(200).send(updatedUser);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Validation Error")) {
        return reply.status(400).send({
          error: "Validation Error", 
          message: "Invalid request body",
          code: "VALIDATION_ERROR", 
          details: error.message
        });
      }
      logger.error({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        action: "users.update", 
        targetUserId: request.params.id,
        message: "Error updating user"
      });
      return reply.status(500).send({
        error: "Internal Server Error", 
        message: "An error occurred while updating the user",
        code: "INTERNAL_ERROR"
      });
    }
  });
};
