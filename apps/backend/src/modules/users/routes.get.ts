// Get user by ID route with RBAC and organization guard

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";

import { logger } from "../../lib/logger.js";

import { canAccessUser, extractUserContext } from "./rbac.js";
import { userIdParamSchema, userResponseSchema, errorResponseSchema } from "./schemas.js";
import { getUserById } from "./service.drizzle.js";

export const getUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/users/:id", {
    schema: {
      params: userIdParamSchema,
      response: {
        200: userResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        429: errorResponseSchema
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
