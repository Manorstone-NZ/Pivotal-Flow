/**
 * PASETO-based Logout Route
 * Handles token revocation and session cleanup
 */

import type { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { logger } from "../../lib/logger.js";

// TypeBox schemas for logout endpoint
const LogoutRequestSchema = Type.Object({
  refreshToken: Type.Optional(Type.String()),
  allDevices: Type.Optional(Type.Boolean())
});

const LogoutResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  revokedTokens: Type.Number()
});

const LogoutErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

export const pasetoLogoutRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{
    Body: { refreshToken?: string; allDevices?: boolean };
    Reply: any;
  }>(
    "/logout",
    {
      schema: {
        body: LogoutRequestSchema,
        response: {
          200: LogoutResponseSchema,
          401: LogoutErrorSchema,
          500: LogoutErrorSchema
        }
      }
    },
    async (request, reply) => {
      const { refreshToken, allDevices = false } = request.body;
      const tokenService = (fastify as any).tokenService;

      try {
        // Extract current access token from Authorization header
        const authHeader = request.headers.authorization;
        const currentAccessToken = authHeader?.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null;

        let revokedCount = 0;

        if (request.user) {
          // User is authenticated via access token
          const userId = request.user.id;
          const tenantId = request.user.tenantId;
          const sessionId = request.user.sessionId;

          if (allDevices) {
            // Revoke all tokens for this user across all tenants
            revokedCount = await tokenService.revokeTokens({
              userId,
              reason: 'User logout - all devices',
              revokedBy: userId
            });

            logger.info({
              request_id: request.id,
              user_id: userId,
              revoked_count: revokedCount
            }, 'Logged out user from all devices');

          } else {
            // Revoke tokens for current session only
            revokedCount = await tokenService.revokeTokens({
              userId,
              tenantId,
              sessionId,
              reason: 'User logout - current session',
              revokedBy: userId
            });

            logger.info({
              request_id: request.id,
              user_id: userId,
              tenant_id: tenantId,
              session_id: sessionId,
              revoked_count: revokedCount
            }, 'Logged out user from current session');
          }

        } else if (refreshToken) {
          // User not authenticated but provided refresh token
          // Validate refresh token to get user context
          const refreshTokenData = await tokenService.validateRefreshToken(refreshToken);
          
          if (refreshTokenData) {
            if (allDevices) {
              // Revoke all tokens for this user
              revokedCount = await tokenService.revokeTokens({
                userId: refreshTokenData.userId,
                reason: 'User logout via refresh token - all devices',
                revokedBy: refreshTokenData.userId
              });
            } else {
              // Revoke tokens for this session
              revokedCount = await tokenService.revokeTokens({
                userId: refreshTokenData.userId,
                tenantId: refreshTokenData.tenantId,
                sessionId: refreshTokenData.sessionId,
                reason: 'User logout via refresh token',
                revokedBy: refreshTokenData.userId
              });
            }

            logger.info({
              request_id: request.id,
              user_id: refreshTokenData.userId,
              revoked_count: revokedCount
            }, 'Logged out user via refresh token');
          }

        } else {
          // No authentication context available
          return reply.status(401).send({
            error: "Unauthorized",
            message: "No valid authentication context",
            code: "NO_AUTH_CONTEXT"
          });
        }

        return reply.status(200).send({
          success: true,
          message: allDevices 
            ? `Successfully logged out from all devices. ${revokedCount} tokens revoked.`
            : `Successfully logged out. ${revokedCount} tokens revoked.`,
          revokedTokens: revokedCount
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id
        }, 'Logout error');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Logout failed",
          code: "LOGOUT_ERROR"
        });
      }
    }
  );

  // Additional endpoint for session management
  fastify.get<{
    Reply: any;
  }>(
    "/sessions",
    {
      schema: {
        response: {
          200: Type.Object({
            sessions: Type.Array(Type.Object({
              id: Type.String(),
              sessionId: Type.String(),
              tenantId: Type.String(),
              lastActivity: Type.String(),
              expiresAt: Type.String(),
              isActive: Type.Boolean()
            }))
          }),
          401: LogoutErrorSchema
        }
      }
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      try {
        const sessions = await tokenService.getActiveSessions(request.user.id);
        
        return reply.status(200).send({
          sessions: sessions.map(session => ({
            id: session.id,
            sessionId: session.sessionId,
            tenantId: session.tenantId,
            lastActivity: session.lastActivity.toISOString(),
            expiresAt: session.expiresAt.toISOString(),
            isActive: session.isActive
          }))
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id,
          user_id: request.user.id
        }, 'Failed to get active sessions');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to get sessions",
          code: "SESSIONS_ERROR"
        });
      }
    }
  );

  // Revoke specific session endpoint
  fastify.delete<{
    Params: { sessionId: string };
    Reply: any;
  }>(
    "/sessions/:sessionId",
    {
      schema: {
        params: Type.Object({
          sessionId: Type.String()
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            message: Type.String()
          }),
          401: LogoutErrorSchema,
          404: LogoutErrorSchema
        }
      }
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      try {
        const { sessionId } = request.params;
        
        const revokedCount = await tokenService.revokeTokens({
          userId: request.user.id,
          sessionId,
          reason: 'Session revoked by user',
          revokedBy: request.user.id
        });

        if (revokedCount === 0) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Session not found or already revoked",
            code: "SESSION_NOT_FOUND"
          });
        }

        logger.info({
          request_id: request.id,
          user_id: request.user.id,
          session_id: sessionId,
          revoked_count: revokedCount
        }, 'Session revoked by user');

        return reply.status(200).send({
          success: true,
          message: `Session ${sessionId} revoked successfully`
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id,
          user_id: request.user.id
        }, 'Failed to revoke session');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to revoke session",
          code: "REVOKE_SESSION_ERROR"
        });
      }
    }
  );
};

export default pasetoLogoutRoute;
