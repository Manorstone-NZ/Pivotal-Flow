/**
 * Opaque Authentication Routes
 * New routes for opaque session authentication (feature flagged)
 * Existing JWT routes remain unchanged
 */

import type { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { logger } from "../../lib/logger.js";
import { AuthService } from "./service.drizzle.js";
import { AuthenticationError } from "../../lib/error-handler.js";

// TypeBox schemas for opaque auth endpoints
const OpaqueLoginRequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 }),
  rememberMe: Type.Optional(Type.Boolean())
});

const OpaqueLoginResponseSchema = Type.Object({
  success: Type.Boolean(),
  sessionId: Type.String(),
  user: Type.Object({
    id: Type.String(),
    email: Type.String(),
    displayName: Type.String(),
    roles: Type.Array(Type.String()),
    organizationId: Type.String(),
    permissions: Type.Array(Type.String())
  })
});

const OpaqueLogoutResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  revokedSessions: Type.Number()
});

const OpaqueErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

/**
 * Opaque Authentication Routes
 * Only registered when AUTH_USE_OPAQUE=true
 */
export const opaqueAuthRoutes: FastifyPluginAsync = async (fastify) => {
  // Opaque login endpoint
  fastify.post<{
    Body: { email: string; password: string; rememberMe?: boolean };
    Reply: any;
  }>(
    "/login-opaque",
    {
      schema: {
        body: OpaqueLoginRequestSchema,
        response: {
          200: OpaqueLoginResponseSchema,
          401: OpaqueErrorSchema,
          500: OpaqueErrorSchema
        }
      }
    },
    async (request, reply) => {
      const { email: rawEmail, password, rememberMe = false } = request.body;
      const authService = new AuthService(fastify);
      const sessionService = (fastify as any).sessionService;
      const authRepository = (fastify as any).authRepository;

      const email = rawEmail.trim().toLowerCase();

      try {
        logger.info({ email, opaque: true }, 'Attempting opaque login');

        // Authenticate user (reuse existing service)
        const user = await authService.authenticateUser(email, password);
        if (!user) {
          await authRepository.recordFailedLogin(email, request.ip);
          
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS"
          });
        }

        // Create opaque session
        const sessionBinding = {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
          fingerprint: request.headers['x-client-fingerprint'] as string
        };

        const sessionId = await sessionService.createUserSession({
          userId: user.id,
          tenantId: user.organizationId,
          organizationId: user.organizationId,
          roles: user.roles,
          permissions: user.permissions || [],
          memberships: [{
            tenantId: user.organizationId,
            role: user.roles[0] || 'STAFF'
          }]
        }, sessionBinding, {
          ttlSeconds: rememberMe ? 30 * 24 * 60 * 60 : 15 * 60, // 30 days or 15 minutes
          slidingExpiry: true,
          bindToIp: process.env.SESSION_BIND_IP === 'true',
          bindToUserAgent: process.env.SESSION_BIND_UA === 'true'
        });

        // Set HttpOnly cookie for browser sessions
        reply.setCookie('pf-session', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 15 * 60,
          path: '/'
        });

        // Update user login stats
        await authRepository.updateUserLastLogin(user.id);

        logger.info({
          request_id: request.id,
          user_id: user.id,
          tenant_id: user.organizationId,
          session_type: 'opaque',
          remember_me: rememberMe,
          outcome: 'success'
        }, 'Opaque login successful');

        return reply.status(200).send({
          success: true,
          sessionId: sessionId.substring(0, 12) + '...', // Masked for response
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            roles: user.roles,
            organizationId: user.organizationId,
            permissions: user.permissions
          }
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id,
          email: email
        }, 'Opaque login error');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Login failed",
          code: "OPAQUE_LOGIN_ERROR"
        });
      }
    }
  );

  // Opaque logout endpoint
  fastify.post<{
    Body: { allDevices?: boolean };
    Reply: any;
  }>(
    "/logout-opaque",
    {
      schema: {
        body: Type.Object({
          allDevices: Type.Optional(Type.Boolean())
        }),
        response: {
          200: OpaqueLogoutResponseSchema,
          401: OpaqueErrorSchema,
          500: OpaqueErrorSchema
        }
      }
    },
    async (request, reply) => {
      const { allDevices = false } = request.body;
      const sessionService = (fastify as any).sessionService;

      try {
        const sessionId = extractSessionId(request);
        if (!sessionId) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "No active session",
            code: "NO_SESSION"
          });
        }

        // Get session data for user context
        const sessionData = await sessionService.validateUserSession(sessionId);
        if (!sessionData) {
          return reply.status(401).send({
            error: "Unauthorized", 
            message: "Invalid session",
            code: "INVALID_SESSION"
          });
        }

        let revokedCount = 0;

        if (allDevices) {
          // Revoke all sessions for user
          revokedCount = await sessionService.revokeAllUserSessions(sessionData.userId);
        } else {
          // Revoke current session only
          const revoked = await sessionService.revokeUserSession(sessionId);
          revokedCount = revoked ? 1 : 0;
        }

        // Clear cookie
        reply.clearCookie('pf-session', { path: '/' });

        logger.info({
          request_id: request.id,
          user_id: sessionData.userId,
          session_type: 'opaque',
          all_devices: allDevices,
          revoked_count: revokedCount
        }, 'Opaque logout successful');

        return reply.status(200).send({
          success: true,
          message: allDevices 
            ? `Logged out from all devices (${revokedCount} sessions)` 
            : 'Logged out successfully',
          revokedSessions: revokedCount
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id
        }, 'Opaque logout error');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Logout failed", 
          code: "OPAQUE_LOGOUT_ERROR"
        });
      }
    }
  );

  // Session management endpoint
  fastify.get<{
    Reply: any;
  }>(
    "/sessions",
    {
      schema: {
        response: {
          200: Type.Object({
            sessions: Type.Array(Type.Object({
              sessionId: Type.String(),
              tenantId: Type.String(),
              lastActivity: Type.String(),
              ipAddress: Type.Optional(Type.String()),
              userAgent: Type.Optional(Type.String())
            })),
            stats: Type.Object({
              total: Type.Number(),
              active: Type.Number(),
              expiringSoon: Type.Number()
            })
          }),
          401: OpaqueErrorSchema
        }
      }
    },
    async (request, reply) => {
      const sessionService = (fastify as any).sessionService;
      
      try {
        const sessionId = extractSessionId(request);
        if (!sessionId) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Session required",
            code: "SESSION_REQUIRED"
          });
        }

        const sessionData = await sessionService.validateUserSession(sessionId);
        if (!sessionData) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid session", 
            code: "INVALID_SESSION"
          });
        }

        // Get session stats (this would need to be implemented in SessionService)
        const stats = {
          total: 1, // Placeholder
          active: 1,
          expiringSoon: 0
        };

        return reply.status(200).send({
          sessions: [{
            sessionId: sessionId.substring(0, 12) + '...', // Masked
            tenantId: sessionData.tenantId,
            lastActivity: new Date(sessionData.lastActivity).toISOString(),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent
          }],
          stats
        });

      } catch (error) {
        logger.error({
          err: error,
          request_id: request.id
        }, 'Session list error');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to get sessions",
          code: "SESSIONS_ERROR"
        });
      }
    }
  );

  logger.info('Opaque auth routes registered (AUTH_USE_OPAQUE=true)');
};
