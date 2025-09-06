import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { config } from '../../config/index.js';
import { createAuditLogger } from '../../lib/audit-logger.drizzle.js';
import { logger } from '../../lib/logger.js';

import type { RefreshRequest, RefreshResponse, AuthError } from './schemas.js';

// Type definitions for request context
interface RequestWithCookies extends FastifyRequest {
  cookies: {
    refreshToken?: string;
  };
}

interface RequestWithBody extends FastifyRequest {
  body: RefreshRequest;
}

export const refreshRoute: FastifyPluginAsync = async (fastify) => {
  const auditLogger = createAuditLogger(fastify);

  fastify.post<{ Body: RefreshRequest; Reply: RefreshResponse | AuthError }>(
    '/refresh',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
            },
            required: ['accessToken'],
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
        },
      },
    },
    async (request, reply) => {
      try {
        // Get refresh token from cookie or body
        const requestWithCookies = request as RequestWithCookies;
        const requestWithBody = request as RequestWithBody;
        
        let refreshToken = requestWithCookies.cookies?.refreshToken;
        
        if (!refreshToken && requestWithBody.body?.refreshToken) {
          refreshToken = requestWithBody.body.refreshToken;
        }

        if (!refreshToken) {
          logger.warn({ event: 'auth.refresh_failed', reason: 'no_refresh_token' }, 'Refresh failed: no refresh token provided');
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Refresh token required',
            code: 'REFRESH_TOKEN_REQUIRED',
          });
        }

        // Verify refresh token
        const decoded = await (fastify as any).tokenManager.verifyToken(refreshToken);
        
        // Validate refresh token in Redis
        if (!decoded.jti) {
          logger.warn({ 
            request_id: request.id,
            user_id: 'unknown',
            organisation_id: 'unknown',
            outcome: 'failed',
            reason: 'no_jti' 
          }, 'Refresh failed: no JTI in token');
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid refresh token',
            code: 'INVALID_REFRESH_TOKEN',
          });
        }
        
        const refreshTokenManager = (fastify as any).refreshTokenManager;
        const tokenData = await refreshTokenManager.getRefresh(decoded.jti);
        if (!tokenData) {
          logger.warn({ 
            request_id: request.id,
            user_id: decoded.sub, 
            organisation_id: decoded.org,
            jti: decoded.jti, 
            outcome: 'failed',
            reason: 'invalid_refresh_token' 
          }, 'Refresh failed: invalid or expired refresh token');
          
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired refresh token',
            code: 'INVALID_REFRESH_TOKEN',
          });
        }

        // Rotate refresh token (revoke old, create new)
        const newJti = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await refreshTokenManager.rotateRefresh(decoded.jti, newJti, {
          jti: newJti,
          userId: decoded.sub,
          organisationId: decoded.org,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        const newRefreshToken = await (fastify as any).tokenManager.signRefreshToken({
          sub: decoded.sub,
          org: decoded.org,
          roles: decoded.roles ?? [],
        });

        // Generate new access token
        const newAccessToken = await (fastify as any).tokenManager.signAccessToken({
          sub: decoded.sub,
          org: decoded.org,
          roles: decoded.roles ?? [],
        });

        // Set new refresh token as HTTP-only cookie
        reply.setCookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: config.auth.COOKIE_SECURE,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        // Log successful refresh
        logger.info({ 
          request_id: request.id,
          user_id: decoded.sub, 
          organisation_id: decoded.org,
          outcome: 'success'
        }, 'Access token refreshed successfully');

        // Log audit event for successful refresh
        try {
          await auditLogger.logAuthEvent(
            'auth.refresh',
            decoded.org,
            decoded.sub,
            {},
            request
          );
        } catch (auditError) {
          logger.warn({ err: auditError }, 'Failed to log audit event for refresh');
        }

        return reply.status(200).send({
          accessToken: newAccessToken,
        });
      } catch (error) {
        logger.error({ err: error, event: 'auth.refresh_error' }, 'Refresh error occurred');
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }
    }
  );
};
