import type { FastifyPluginAsync } from 'fastify';
import { createAuditLogger } from '../../lib/audit-logger.js';
import { logger } from '../../lib/logger.js';
import type { LogoutResponse } from './schemas.js';

export const logoutRoute: FastifyPluginAsync = async (fastify) => {
  const auditLogger = createAuditLogger(fastify);

  fastify.post<{ Reply: LogoutResponse }>(
    '/logout',
    {
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
        tags: ['auth'],
        summary: 'User logout',
        description: 'Logout user and revoke refresh token',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const user = request.user as any;
        
        if (!user || !user.jti) {
          logger.warn({ event: 'auth.logout_failed', reason: 'no_user_context' }, 'Logout failed: no user context');
          return reply.status(400).send({
            message: 'No active session to logout',
          });
        }

        // Revoke refresh token from Redis
        await fastify.tokenManager.revokeRefreshToken(user.jti);

        // Clear refresh token cookie
        reply.clearCookie('refreshToken', {
          path: '/',
          httpOnly: true,
          secure: process.env['COOKIE_SECURE'] === 'true',
          sameSite: 'lax',
        });

        // Log successful logout
        logger.info({ 
          userId: user.userId, 
          organizationId: user.organizationId,
          jti: user.jti,
          event: 'auth.logout_success' 
        }, 'User logged out successfully');

        // Log audit event for successful logout
        try {
          await auditLogger.logAuthEvent(
            'auth.logout',
            user.organizationId,
            user.userId,
            { jti: user.jti },
            request
          );
        } catch (auditError) {
          logger.warn({ err: auditError }, 'Failed to log audit event for logout');
        }

        return reply.status(200).send({
          message: 'Logged out successfully',
        });
      } catch (error) {
        logger.error({ err: error, event: 'auth.logout_error' }, 'Logout error occurred');
        return reply.status(500).send({
          message: 'An error occurred during logout',
        });
      }
    }
  );
};
