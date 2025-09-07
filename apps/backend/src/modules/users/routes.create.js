// Create user route with RBAC and audit logging
import { generateId } from '@pivotal-flow/shared';
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../lib/logger.js";
import { users, auditLogs } from "../../lib/schema.js";
import { canManageUsers, extractUserContext } from "./rbac.js";
import { UserCreateSchema, UserResponseSchema, UserErrorSchema } from "./typeboxSchemas.js";
import { createUser } from "./service.drizzle.js";
export const createUserRoute = async (fastify) => {
    fastify.post("/v1/users", {
        schema: {
            body: UserCreateSchema,
            response: {
                201: UserResponseSchema,
                400: UserErrorSchema,
                401: UserErrorSchema,
                403: UserErrorSchema,
                409: UserErrorSchema,
                429: UserErrorSchema
            }
        }
    }, async (request, reply) => {
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
            const data = request.body; // TypeBox handles validation automatically
            const email = data.email.trim().toLowerCase();
            // Check if user already exists
            const existsResult = await fastify.db
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.email, email), eq(users.organizationId, userContext.organizationId), isNull(users.deletedAt)))
                .limit(1);
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
            const result = await createUser({
                email,
                password: 'temporary-password', // TODO: Implement proper password handling
                ...(data.displayName !== undefined && { displayName: data.displayName })
            }, userContext.organizationId, fastify);
            // Log audit event
            await fastify.db
                .insert(auditLogs)
                .values({
                id: generateId(),
                organizationId: userContext.organizationId,
                actorId: userContext.userId,
                action: 'users.create',
                entityType: 'User',
                entityId: result.id,
                newValues: JSON.stringify({
                    email: result.email,
                    displayName: data.displayName
                }),
                metadata: JSON.stringify({
                    actorUserId: userContext.userId,
                    targetUserId: result.id,
                    organizationId: userContext.organizationId
                }),
                createdAt: new Date()
            });
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
                roles: (result.roles ?? []).map((r) => ({
                    id: r.id,
                    name: r.name,
                    description: r.description ?? null,
                    isSystem: r.isSystem,
                    isActive: r.isActive
                }))
            };
            return reply.status(201).send(safe);
        }
        catch (err) {
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
//# sourceMappingURL=routes.create.js.map