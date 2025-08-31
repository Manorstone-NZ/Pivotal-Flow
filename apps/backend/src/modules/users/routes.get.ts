// Get user by ID route with RBAC and organization guard

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from "./service.drizzle.js";
import { canAccessUser, extractUserContext } from "./rbac.js";
import { logger } from "../../lib/logger.js";

export const getUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/users/:id", {
    schema: {
      tags: ["Users"],
      summary: "Get user by ID",
      description: "Retrieve a specific user by ID within the current organization",
      security: [{ bearerAuth: [] }],

      // Params must declare required as an array and block extra fields
      params: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" }
        },
        required: ["id"],
        additionalProperties: false
      },

      response: {
        200: {
          // Use anyOf for nullable fields
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            displayName: { anyOf: [{ type: "string" }, { type: "null" }] },
            isActive: { type: "boolean" },
            mfaEnabled: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            roles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { anyOf: [{ type: "string" }, { type: "null" }] },
                  isSystem: { type: "boolean" },
                  isActive: { type: "boolean" }
                },
                required: ["id", "name", "isSystem", "isActive"],
                additionalProperties: false
              }
            }
          },
          required: ["id", "email", "isActive", "mfaEnabled", "createdAt", "roles"],
          additionalProperties: false
        },

        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            code: { type: "string" }
          },
          required: ["error", "message", "code"],
          additionalProperties: false
        },

        403: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            code: { type: "string" }
          },
          required: ["error", "message", "code"],
          additionalProperties: false
        },

        404: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            code: { type: "string" }
          },
          required: ["error", "message", "code"],
          additionalProperties: false
        },

        429: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            code: { type: "string" }
          },
          required: ["error", "message", "code"],
          additionalProperties: false
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userContext = extractUserContext(request);
      const { id: targetUserId } = request.params;

      const permissionCheck = await canAccessUser(userContext, targetUserId, fastify);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: "users.get",
          targetUserId,
          reason: permissionCheck.reason,
          message: "Permission denied for accessing user"
        });

        return reply.status(403).send({
          error: "Forbidden",
          message: "Insufficient permissions to access this user",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      const user = await getUserById(targetUserId, userContext.organizationId, fastify);
      if (!user) {
        logger.warn({
          userId: userContext.userId,
          action: "users.get",
          targetUserId,
          organizationId: userContext.organizationId,
          message: "User not found"
        });

        return reply.status(404).send({
          error: "Not Found",
          message: "User not found in this organization",
          code: "USER_NOT_FOUND"
        });
      }

      logger.info({
        userId: userContext.userId,
        action: "users.get",
        targetUserId,
        organizationId: userContext.organizationId,
        message: "User retrieved successfully"
      });

      return reply.status(200).send(user);
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        action: "users.get",
        targetUserId: request.params.id,
        message: "Error retrieving user"
      });

      return reply.status(500).send({
        error: "Internal Server Error",
        message: "An error occurred while retrieving the user",
        code: "INTERNAL_ERROR"
      });
    }
  });
};
