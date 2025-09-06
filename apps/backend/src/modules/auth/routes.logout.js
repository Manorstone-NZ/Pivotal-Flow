import { config } from '../../config/index.js';
import { createAuditLogger } from '../../lib/audit-logger.drizzle.js';
import { logger } from '../../lib/logger.js';
export const logoutRoute = async (fastify) => {
    const auditLogger = createAuditLogger(fastify);
    fastify.post('/logout', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                    required: ['message'],
                },
            },
        },
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const user = authenticatedRequest.user;
            if (!user?.jti) {
                logger.warn({ event: 'auth.logout_failed', reason: 'no_user_context' }, 'Logout failed: no user context');
                return reply.status(400).send({
                    message: 'No active session to logout',
                });
            }
            // Revoke refresh token from cache
            const refreshTokenManager = fastify.refreshTokenManager;
            await refreshTokenManager.revokeRefresh(user.jti);
            // Clear refresh token cookie
            reply.clearCookie('refreshToken', {
                path: '/',
                httpOnly: true,
                secure: config.auth.COOKIE_SECURE,
                sameSite: 'lax',
            });
            // Log successful logout
            logger.info({
                request_id: request.id,
                user_id: user.userId,
                organisation_id: user.organizationId,
                jti: user.jti,
                outcome: 'success'
            }, 'User logged out successfully');
            // Log audit event for successful logout
            try {
                await auditLogger.logAuthEvent('auth.logout', user.organizationId, user.userId, { jti: user.jti }, request);
            }
            catch (auditError) {
                logger.warn({ err: auditError }, 'Failed to log audit event for logout');
            }
            return reply.status(200).send({
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            logger.error({ err: error, event: 'auth.logout_error' }, 'Logout error occurred');
            return reply.status(500).send({
                message: 'An error occurred during logout',
            });
        }
    });
};
//# sourceMappingURL=routes.logout.js.map