import { Type } from '@sinclair/typebox';
import { createOpaquePakeService } from '../../services/opaque-pake.js';
import { argon2PasswordService } from '../../services/argon2-password.js';
import { logger } from '../../lib/logger.js';
// TypeBox schemas for OPAQUE endpoints
const OpaqueRegistrationStartSchema = Type.Object({
    username: Type.String({ format: 'email' }),
    clientRegistrationState: Type.String()
});
const OpaqueRegistrationStartResponseSchema = Type.Object({
    serverRegistrationState: Type.String(),
    registrationResponse: Type.String()
});
const OpaqueRegistrationFinishSchema = Type.Object({
    username: Type.String({ format: 'email' }),
    registrationRecord: Type.String(),
    serverRegistrationState: Type.String()
});
const OpaqueRegistrationFinishResponseSchema = Type.Object({
    success: Type.Boolean(),
    userId: Type.String()
});
const OpaqueLoginStartSchema = Type.Object({
    username: Type.String({ format: 'email' }),
    clientLoginState: Type.String()
});
const OpaqueLoginStartResponseSchema = Type.Object({
    serverLoginState: Type.String(),
    loginResponse: Type.String()
});
const OpaqueLoginFinishSchema = Type.Object({
    username: Type.String({ format: 'email' }),
    clientLoginFinish: Type.String(),
    serverLoginState: Type.String()
});
const OpaqueLoginFinishResponseSchema = Type.Object({
    sessionKey: Type.String(),
    userId: Type.String(),
    tenantId: Type.String(),
    accessToken: Type.String(),
    refreshToken: Type.String()
});
/**
 * OPAQUE PAKE Authentication Routes
 * Implements password-authenticated key exchange for secure authentication
 */
export const opaqueAuthRoutes = async (fastify) => {
    const opaqueService = createOpaquePakeService(fastify);
    // OPAQUE Registration Start
    fastify.post('/auth/opaque/register/start', {
        schema: {
            body: OpaqueRegistrationStartSchema,
            response: {
                200: OpaqueRegistrationStartResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            logger.info({ username: request.body.username }, 'OPAQUE registration start requested');
            const result = await opaqueService.registrationStart({
                username: request.body.username,
                clientRegistrationState: request.body.clientRegistrationState
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            logger.error({ err: error, username: request.body.username }, 'OPAQUE registration start failed');
            return reply.status(400).send({
                error: {
                    code: 'OPAQUE_REGISTRATION_START_FAILED',
                    message: 'Registration start failed'
                }
            });
        }
    });
    // OPAQUE Registration Finish
    fastify.post('/auth/opaque/register/finish', {
        schema: {
            body: OpaqueRegistrationFinishSchema,
            response: {
                200: OpaqueRegistrationFinishResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            logger.info({ username: request.body.username }, 'OPAQUE registration finish requested');
            const result = await opaqueService.registrationFinish({
                username: request.body.username,
                registrationRecord: request.body.registrationRecord,
                serverRegistrationState: request.body.serverRegistrationState
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            logger.error({ err: error, username: request.body.username }, 'OPAQUE registration finish failed');
            return reply.status(400).send({
                error: {
                    code: 'OPAQUE_REGISTRATION_FINISH_FAILED',
                    message: 'Registration finish failed'
                }
            });
        }
    });
    // OPAQUE Login Start
    fastify.post('/auth/opaque/login/start', {
        schema: {
            body: OpaqueLoginStartSchema,
            response: {
                200: OpaqueLoginStartResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            logger.info({ username: request.body.username }, 'OPAQUE login start requested');
            const result = await opaqueService.loginStart({
                username: request.body.username,
                clientLoginState: request.body.clientLoginState
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            logger.error({ err: error, username: request.body.username }, 'OPAQUE login start failed');
            return reply.status(400).send({
                error: {
                    code: 'OPAQUE_LOGIN_START_FAILED',
                    message: 'Login start failed'
                }
            });
        }
    });
    // OPAQUE Login Finish
    fastify.post('/auth/opaque/login/finish', {
        schema: {
            body: OpaqueLoginFinishSchema,
            response: {
                200: OpaqueLoginFinishResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            logger.info({ username: request.body.username }, 'OPAQUE login finish requested');
            // Complete OPAQUE authentication
            const opaqueResult = await opaqueService.loginFinish({
                username: request.body.username,
                clientLoginFinish: request.body.clientLoginFinish,
                serverLoginState: request.body.serverLoginState
            });
            // Generate PASETO tokens
            const tokenService = fastify.tokenService;
            const accessToken = await tokenService.generateAccessToken({
                sub: opaqueResult.userId,
                org: opaqueResult.tenantId,
                roles: [], // TODO: Load user roles
                permissions: [], // TODO: Load user permissions
                purpose: 'access'
            });
            const refreshToken = await tokenService.generateRefreshToken({
                sub: opaqueResult.userId,
                org: opaqueResult.tenantId,
                purpose: 'refresh'
            });
            // TODO: Create session record
            return reply.status(200).send({
                sessionKey: opaqueResult.sessionKey,
                userId: opaqueResult.userId,
                tenantId: opaqueResult.tenantId,
                accessToken,
                refreshToken
            });
        }
        catch (error) {
            logger.error({ err: error, username: request.body.username }, 'OPAQUE login finish failed');
            return reply.status(400).send({
                error: {
                    code: 'OPAQUE_LOGIN_FINISH_FAILED',
                    message: 'Login finish failed'
                }
            });
        }
    });
    // Legacy password upgrade endpoint (for rolling upgrade from legacy hashes)
    fastify.post('/auth/password/upgrade', {
        schema: {
            body: Type.Object({
                username: Type.String({ format: 'email' }),
                currentPassword: Type.String(),
                newPassword: Type.String({ minLength: 8 })
            })
        }
    }, async (request, reply) => {
        try {
            const { users } = await import('../../lib/schema.js');
            const { eq } = await import('drizzle-orm');
            // Find user
            const user = await fastify.db.select().from(users).where(eq(users.email, request.body.username)).limit(1);
            if (!user.length) {
                return reply.status(404).send({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }
                });
            }
            const userData = user[0];
            if (!userData) {
                return reply.status(404).send({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }
                });
            }
            // Verify current password
            const verification = await argon2PasswordService.verifyPassword(request.body.currentPassword, userData.passwordHash || '', userData.passwordHashSalt, userData.passwordHashAlgo);
            if (!verification.isValid) {
                return reply.status(401).send({
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Current password is incorrect'
                    }
                });
            }
            // Hash new password with Argon2id
            const newHash = await argon2PasswordService.hashPassword(request.body.newPassword);
            // Update user password
            await fastify.db
                .update(users)
                .set({
                passwordHash: newHash.hash,
                passwordHashSalt: newHash.salt,
                passwordHashAlgo: newHash.algorithm,
                updatedAt: new Date()
            })
                .where(eq(users.id, userData.id));
            logger.info({ userId: userData.id }, 'Password upgraded to Argon2id');
            return reply.status(200).send({
                success: true,
                message: 'Password upgraded successfully'
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Password upgrade failed');
            return reply.status(500).send({
                error: {
                    code: 'PASSWORD_UPGRADE_FAILED',
                    message: 'Password upgrade failed'
                }
            });
        }
    });
};
//# sourceMappingURL=routes.opaque-endpoints.js.map