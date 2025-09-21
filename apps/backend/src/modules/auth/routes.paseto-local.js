/**
 * PASETO v4.public Authentication Routes
 * For service-to-service auth and signed links only
 * User sessions use opaque tokens, not PASETO
 */
import { Type } from '@sinclair/typebox';
import { PasetoPublicService } from '../../services/paseto-v4-public.js';
import { logger } from '../../lib/logger.js';
// TypeBox schemas
const PasetoLoginRequestSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 1 }),
    rememberMe: Type.Optional(Type.Boolean())
});
const PasetoLoginResponseSchema = Type.Object({
    success: Type.Boolean(),
    accessToken: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.Number(),
    user: Type.Object({
        id: Type.String(),
        email: Type.String(),
        displayName: Type.String(),
        roles: Type.Array(Type.String()),
        organizationId: Type.String(),
        permissions: Type.Array(Type.String())
    })
});
const PasetoRefreshRequestSchema = Type.Object({
    refreshToken: Type.String()
});
const PasetoLogoutRequestSchema = Type.Object({
    refreshToken: Type.Optional(Type.String())
});
const PasetoLogoutResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String()
});
/**
 * PASETO v4.local Authentication Routes
 */
export const pasetoLocalAuthRoutes = async (fastify) => {
    const pasetoService = new PasetoLocalService();
    const authRepository = new AuthRepository(fastify);
    // PASETO login endpoint
    fastify.post("/login-paseto", {
        schema: {
            body: PasetoLoginRequestSchema
            // Remove response schemas to avoid serialization issues for now
        }
    }, async (request, reply) => {
        const { email, password, rememberMe = false } = request.body;
        try {
            logger.info({
                email,
                paseto: true
            }, 'Attempting PASETO v4.local login');
            // Authenticate user
            const user = await authRepository.getUserByEmail(email);
            if (!user) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid email or password",
                    code: "INVALID_CREDENTIALS"
                });
            }
            // Verify password
            const isValidPassword = await argon2.verify(user.passwordHash, password);
            if (!isValidPassword) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid email or password",
                    code: "INVALID_CREDENTIALS"
                });
            }
            // Get user permissions and roles
            const userWithPermissions = await authRepository.getUserWithPermissions(user.id);
            if (!userWithPermissions) {
                return reply.status(500).send({
                    error: "Internal Server Error",
                    message: "Failed to load user permissions",
                    code: "PERMISSION_LOAD_ERROR"
                });
            }
            // Update last login (ignore errors - this is non-critical)
            try {
                await authRepository.updateUserLastLogin(user.id);
            }
            catch (loginUpdateError) {
                logger.error({
                    err: loginUpdateError,
                    userId: user.id
                }, 'Failed to update user last login');
            }
            // Generate access token (1 hour expiration)
            const accessTokenExp = Math.floor(Date.now() / 1000) + (60 * 60);
            const accessToken = await pasetoService.generateToken({
                sub: user.id,
                org: userWithPermissions.organizationId || '',
                scope: userWithPermissions.permissions,
                exp: accessTokenExp,
                purpose: 'user-access'
            });
            // Generate refresh token (30 days if rememberMe, 1 day otherwise)
            const refreshTokenExp = Math.floor(Date.now() / 1000) +
                (rememberMe ? (30 * 24 * 60 * 60) : (24 * 60 * 60));
            const refreshToken = await pasetoService.generateToken({
                sub: user.id,
                org: userWithPermissions.organizationId || '',
                scope: ['refresh'],
                exp: refreshTokenExp,
                purpose: 'user-refresh'
            });
            logger.info({
                request_id: request.id,
                user_id: user.id,
                tenant_id: userWithPermissions.organizationId,
                token_type: 'paseto-v4-local',
                remember_me: rememberMe,
                outcome: 'success'
            }, 'PASETO v4.local login successful');
            return reply.status(200).send({
                success: true,
                accessToken,
                refreshToken,
                expiresIn: 3600, // 1 hour in seconds
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName || '',
                    roles: userWithPermissions.roles,
                    organizationId: userWithPermissions.organizationId || '',
                    permissions: userWithPermissions.permissions
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id,
                email
            }, 'PASETO v4.local login error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Login failed",
                code: "PASETO_LOGIN_ERROR"
            });
        }
    });
    // PASETO refresh endpoint
    fastify.post("/refresh-paseto", {
        schema: {
            body: PasetoRefreshRequestSchema
        }
    }, async (request, reply) => {
        const { refreshToken } = request.body;
        try {
            // Verify refresh token
            const payload = await pasetoService.verifyToken(refreshToken);
            if (payload.purpose !== 'user-refresh') {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN"
                });
            }
            // Get fresh user data
            const userWithPermissions = await authRepository.getUserWithPermissions(payload.sub);
            if (!userWithPermissions) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "User not found",
                    code: "USER_NOT_FOUND"
                });
            }
            // Generate new access token
            const accessTokenExp = Math.floor(Date.now() / 1000) + (60 * 60);
            const newAccessToken = await pasetoService.generateToken({
                sub: payload.sub,
                org: userWithPermissions.organizationId || '',
                scope: userWithPermissions.permissions,
                exp: accessTokenExp,
                purpose: 'user-access'
            });
            return reply.status(200).send({
                success: true,
                accessToken: newAccessToken,
                expiresIn: 3600,
                user: {
                    id: userWithPermissions.id,
                    email: userWithPermissions.email,
                    displayName: userWithPermissions.displayName || '',
                    roles: userWithPermissions.roles,
                    organizationId: userWithPermissions.organizationId || '',
                    permissions: userWithPermissions.permissions
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id
            }, 'PASETO v4.local refresh error');
            return reply.status(401).send({
                error: "Unauthorized",
                message: "Invalid or expired refresh token",
                code: "REFRESH_TOKEN_ERROR"
            });
        }
    });
    // PASETO logout endpoint
    fastify.post("/logout-paseto", {
        schema: {
            body: PasetoLogoutRequestSchema
        }
    }, async (request, reply) => {
        // Note: PASETO tokens are stateless, so logout is primarily client-side
        // In a production system, you might maintain a revocation list for critical scenarios
        logger.info({
            request_id: request.id,
            token_type: 'paseto-v4-local'
        }, 'PASETO v4.local logout requested');
        return reply.status(200).send({
            success: true,
            message: 'Logged out successfully'
        });
    });
};
//# sourceMappingURL=routes.paseto-local.js.map