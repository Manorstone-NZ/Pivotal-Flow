import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { config } from '../../config/index.js';
import { createAuditLogger } from '../../lib/audit-logger.drizzle.js';
import { logger } from '../../lib/logger.js';

import type { LogoutResponse } from './schemas.js';

// Type definitions for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  jti: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

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
      },
    },
    async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const user = authenticatedRequest.user;
        
        if (!user?.jti) {
          logger.warn({ event: 'auth.logout_failed', reason: 'no_user_context' }, 'Logout failed: no user context');
          return reply.status(400).send({
            message: 'No active session to logout',
          });
        }

        // Revoke refresh token from cache
        const refreshTokenManager = (fastify as any).refreshTokenManager;
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
