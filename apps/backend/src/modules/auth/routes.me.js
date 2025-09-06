import { logger } from '../../lib/logger.js';
import { AuthService } from './service.drizzle.js';
export const meRoute = async (fastify) => {
    fastify.get('/me', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        displayName: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                        organizationId: { type: 'string' },
                    },
                    required: ['id', 'email', 'displayName', 'roles', 'organizationId'],
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' },
                    },
                    required: ['error', 'message', 'code'],
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' },
                    },
                    required: ['error', 'message', 'code'],
                },
            },
        },
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const user = authenticatedRequest.user;
            if (!user?.userId) {
                logger.warn({ event: 'auth.me_failed', reason: 'no_user_context' }, 'Me route failed: no user context');
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'No user context found',
                    code: 'NO_USER_CONTEXT',
                });
            }
            const authService = new AuthService(fastify);
            const userData = await authService.getUserById(user.userId);
            if (!userData) {
                logger.warn({
                    userId: user.userId,
                    event: 'auth.me_failed',
                    reason: 'user_not_found_or_inactive'
                }, 'Me route failed: user not found or inactive');
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'User not found or inactive',
                    code: 'USER_NOT_FOUND',
                });
            }
            // Log successful profile retrieval
            logger.debug({
                userId: user.userId,
                organizationId: user.organizationId,
                event: 'auth.me_success'
            }, 'User profile retrieved successfully');
            return reply.status(200).send({
                id: userData.id,
                email: userData.email,
                displayName: userData.displayName ?? '',
                roles: userData.roles,
                organizationId: userData.organizationId,
            });
        }
        catch (error) {
            logger.error({ err: error, event: 'auth.me_error' }, 'Me route error occurred');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An error occurred while retrieving user profile',
                code: 'PROFILE_RETRIEVAL_ERROR',
            });
        }
    });
};
//# sourceMappingURL=routes.me.js.map