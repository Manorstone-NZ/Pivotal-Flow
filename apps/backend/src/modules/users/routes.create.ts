// Create user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { ZodError, type infer as ZodInfer } from "zod";
import { userCreateSchema } from "./schemas.js";
import { createUser } from "./service.sql.js";
import { canManageUsers, extractUserContext } from "./rbac.js";
import { logger } from "../../lib/logger.js";

type CreateBody = ZodInfer<typeof userCreateSchema>;

export const createUserRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: CreateBody }>("/v1/users", {
    schema: {
      tags: ["Users"],
      summary: "Create a new user",
      description: "Create a new user in the current organization",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["email", "firstName", "lastName"],
        additionalProperties: false,
        properties: {
          email: { type: "string", format: "email", description: "User email address" },
          firstName: { type: "string", minLength: 1, maxLength: 100 },
          lastName: { type: "string", minLength: 1, maxLength: 100 },
          displayName: { type: "string", maxLength: 200 },
          phone: { type: "string", maxLength: 20 },
          timezone: { type: "string", maxLength: 50 },
          locale: { type: "string", maxLength: 10 }
        }
      },
      response: {
        201: {
          description: "User created successfully",
          type: "object",
          additionalProperties: false,
          required: ["id", "email", "isActive", "mfaEnabled", "createdAt", "roles"],
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
                additionalProperties: false,
                required: ["id", "name", "isSystem", "isActive"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { anyOf: [{ type: "string" }, { type: "null" }] },
                  isSystem: { type: "boolean" },
                  isActive: { type: "boolean" }
                }
              }
            }
          }
        },
        400: {
          type: "object",
          additionalProperties: false,
          required: ["error", "message", "code"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            code: { type: "string" },
            details: { type: "string" } // now matches handler
          }
        },
        401: errorShape(),
        403: errorShape(),
        409: errorShape(),
        429: errorShape()
      }
    }
  }, async (request, reply: FastifyReply) => {
    try {
      const userContext = extractUserContext(request);

      const permissionCheck = await canManageUsers(userContext, fastify);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: "users.create",
          reason: permissionCheck.reason,
          message: "Permission denied for creating users"
        });
        return reply.status(403).send({
          error: "Forbidden",
          message: "Insufficient permissions to create users",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      const data = userCreateSchema.parse(request.body);
      const email = data.email.trim().toLowerCase();

      // Check if user already exists
      const existsResult = await fastify.db.query(
        `SELECT id FROM users WHERE email = $1 AND "organizationId" = $2 AND "deletedAt" IS NULL LIMIT 1`,
        [email, userContext.organizationId]
      );

      if (existsResult.length > 0) {
        logger.warn({
          userId: userContext.userId,
          action: "users.create",
          organizationId: userContext.organizationId,
          email,
          message: "User creation failed - email already exists"
        });
        return reply.status(409).send({
          error: "Conflict",
          message: "User with this email already exists in the organization",
          code: "EMAIL_ALREADY_EXISTS"
        });
      }

      // Create user using SQL service
      const result = await createUser(
        {
          email,
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.displayName !== undefined && { displayName: data.displayName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.timezone !== undefined && { timezone: data.timezone }),
          ...(data.locale !== undefined && { locale: data.locale })
        },
        userContext.organizationId,
        fastify
      );

      // Log audit event
      await fastify.db.query(
        `INSERT INTO audit_logs (
          id, "organizationId", "userId", "action", "entityType", "entityId", 
          "newValues", "metadata", "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
        )`,
        [
          userContext.organizationId,
          userContext.userId,
          'users.create',
          'User',
          result.id,
          JSON.stringify({
            email: result.email,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            phone: data.phone,
            timezone: data.timezone,
            locale: data.locale
          }),
          JSON.stringify({
            actorUserId: userContext.userId,
            targetUserId: result.id,
            organizationId: userContext.organizationId
          })
        ]
      );

      logger.info({
        userId: userContext.userId,
        action: "users.create",
        organizationId: userContext.organizationId,
        newUserId: result.id,
        email,
        message: "User created successfully"
      });

      // Map to safe shape that matches the 201 schema
      const safe = {
        id: result.id,
        email: result.email,
        displayName: result.displayName ?? null,
        isActive: result.status === 'active',
        mfaEnabled: result.mfaEnabled,
        createdAt: result.createdAt.toISOString?.() ?? String(result.createdAt),
        roles: (result.roles ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? null,
          isSystem: r.isSystem,
          isActive: r.isActive
        }))
      };

      return reply.status(201).send(safe);
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          error: "Validation Error",
          message: "Invalid request body",
          code: "VALIDATION_ERROR",
          details: err.issues.map(i => i.message).join("; ")
        });
      }

      logger.error({
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        action: "users.create",
        message: "Error creating user"
      });

      return reply.status(500).send({
        error: "Internal Server Error",
        message: "An error occurred while creating the user",
        code: "INTERNAL_ERROR"
      });
    }
  });
};

// small helper to keep response schemas tidy
function errorShape() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["error", "message", "code"],
    properties: {
      error: { type: "string" },
      message: { type: "string" },
      code: { type: "string" }
    }
  } as const;
}
