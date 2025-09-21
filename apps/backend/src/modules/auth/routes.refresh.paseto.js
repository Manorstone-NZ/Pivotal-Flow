/**
 * PASETO-based Token Refresh Route
 * Handles refresh token validation and new access token generation
 */
import { Type } from '@sinclair/typebox';
import { logger } from "../../lib/logger.js";
import { AuthService } from "./service.drizzle.js";
// TypeBox schemas for refresh endpoint
const RefreshRequestSchema = Type.Object({
    refreshToken: Type.String({ minLength: 1 })
});
const RefreshResponseSchema = Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String(),
    user: Type.Object({
        id: Type.String(),
        email: Type.String(),
        displayName: Type.String(),
        roles: Type.Array(Type.String()),
        organizationId: Type.String(),
        permissions: Type.Array(Type.String())
    })
});
const RefreshErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
export const pasetoRefreshRoute = async (fastify) => {
    fastify.post("/refresh", {
        schema: {
            body: RefreshRequestSchema,
            response: {
                200: RefreshResponseSchema,
                401: RefreshErrorSchema,
                500: RefreshErrorSchema
            }
        }
    }, async (request, reply) => {
        const { refreshToken } = request.body;
        const tokenService = fastify.tokenService;
        const authService = new AuthService(fastify);
        try {
            logger.info({ request_id: request.id }, 'Processing PASETO token refresh');
            // Extract token binding information
            const tokenBinding = {
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'] || '',
                fingerprint: request.headers['x-client-fingerprint']
            };
            // Validate refresh token
            const refreshTokenData = await tokenService.validateRefreshToken(refreshToken, tokenBinding);
            if (!refreshTokenData) {
                logger.warn({ request_id: request.id }, 'Invalid or expired refresh token');
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid or expired refresh token",
                    code: "INVALID_REFRESH_TOKEN"
                });
            }
            // Get fresh user data from database
            const user = await authService.getUserById(refreshTokenData.userId);
            if (!user) {
                logger.warn({
                    request_id: request.id,
                    userId: refreshTokenData.userId
                }, 'User not found during token refresh');
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "User not found",
                    code: "USER_NOT_FOUND"
                });
            }
            // Verify user still has access to the tenant
            const hasAccess = await fastify.validateTenantMembership(user.id, refreshTokenData.tenantId);
            if (!hasAccess) {
                logger.warn({
                    request_id: request.id,
                    userId: user.id,
                    tenantId: refreshTokenData.tenantId
                }, 'User no longer has access to tenant');
                // Revoke the refresh token
                await tokenService.revokeTokens({
                    sessionId: refreshTokenData.sessionId,
                    reason: 'Tenant access revoked',
                    revokedBy: 'system'
                });
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Access to tenant revoked",
                    code: "TENANT_ACCESS_REVOKED"
                });
            }
            // Create new session data with fresh permissions
            const sessionData = {
                userId: user.id,
                tenantId: refreshTokenData.tenantId,
                organizationId: user.organizationId,
                roles: user.roles,
                permissions: user.permissions || [],
                memberships: [
                    {
                        tenantId: refreshTokenData.tenantId,
                        role: user.roles[0] || 'STAFF'
                    }
                ],
                createdAt: new Date(),
                lastActivity: new Date(),
                ipAddress: request.ip || '',
                userAgent: request.headers['user-agent'] || '',
                ...(tokenBinding.fingerprint ? { fingerprint: tokenBinding.fingerprint } : {})
            };
            // Generate new tokens
            const newAccessToken = await tokenService.generateAccessToken(sessionData, tokenBinding);
            const newRefreshToken = await tokenService.generateRefreshToken(user.id, refreshTokenData.tenantId, tokenBinding);
            // Optionally revoke the old refresh token (for single-use refresh tokens)
            // await tokenService.revokeTokens({
            //   sessionId: refreshTokenData.sessionId,
            //   tokenType: 'refresh',
            //   reason: 'Token refreshed'
            // });
            logger.info({
                request_id: request.id,
                user_id: user.id,
                tenant_id: refreshTokenData.tenantId,
                outcome: 'success'
            }, 'Token refresh successful');
            return reply.status(200).send({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    roles: user.roles,
                    organizationId: user.organizationId,
                    permissions: user.permissions
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id
            }, 'Token refresh error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Token refresh failed",
                code: "REFRESH_ERROR"
            });
        }
    });
};
export default pasetoRefreshRoute;
//# sourceMappingURL=routes.refresh.paseto.js.map