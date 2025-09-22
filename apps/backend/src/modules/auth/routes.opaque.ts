/**
 * Opaque Authentication Routes
 * New routes for opaque session authentication (feature flagged)
 * Existing JWT routes remain unchanged
 */

import type { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
// import { randomBytes } from 'crypto'; // No longer needed for F2B
import { logger } from "../../lib/logger.js";
import { AuthService } from "./service.drizzle.js";
// import { AuthenticationError } from "../../lib/error-handler.js";
import { AuditLogger } from "../../lib/audit-logger.drizzle.js";

// Helper function to extract session ID from request
function extractSessionId(request: any): string | null {
  // Try to get session ID from cookie first
  const sessionCookie = request.cookies?.['sid'];
  if (sessionCookie) {
    return sessionCookie;
  }
  
  // Fallback to Authorization header
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

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

// const OpaqueLogoutResponseSchema = Type.Object({
//   success: Type.Boolean(),
//   message: Type.String(),
//   revokedSessions: Type.Number()
// });

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
      // const cache = (fastify as any).cache; // No longer needed for F2B
      const auditLogger = new AuditLogger(fastify);
      // TODO: Fix authRepository access - need to check what's available on fastify instance

      const email = rawEmail.trim().toLowerCase();

      try {
        logger.info({ email, opaque: true }, 'Attempting opaque login');

        // Authenticate user (reuse existing service)
        const user = await authService.authenticateUser(email, password);
        if (!user) {
          // Log failed login attempt - use system organization for failed attempts
          await auditLogger.logEvent({
            action: 'login_failed',
            entityType: 'user',
            entityId: email, // Use email as entity ID for failed attempts
            organizationId: 'd549ddfa-d6e4-44dd-8749-36ea051a795a', // System org for failed attempts
            userId: null,
            metadata: {
              reason: 'invalid_credentials',
              loginMethod: 'opaque_token',
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              attemptedEmail: email
            }
          }, request);
          
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS"
          });
        }

        // Create opaque session
        // const sessionBinding = {
        //   ipAddress: request.ip,
        //   userAgent: request.headers['user-agent'] || '',
        //   fingerprint: request.headers['x-client-fingerprint'] as string
        // };

        // Create session using SessionService
        const { SessionService } = await import('../../lib/auth/session-service.js');
        const sessionService = new SessionService();
        
        const sessionData = {
          userId: user.id,
          tenantId: user.organizationId,
          organizationId: user.organizationId,
          roles: user.roles || [],
          permissions: user.permissions || [],
          memberships: [{
            tenantId: user.organizationId,
            role: user.roles[0] || 'STAFF'
          }],
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
          fingerprint: request.headers['x-client-fingerprint'] as string
        };
        
        const sessionId = await sessionService.createSession(
          user.id,
          'fc86afa8-9319-4e1f-be7b-4bc1c1ab7e68', // Use the default tenant ID
          sessionData,
          {
            rememberMe,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
            fingerprint: request.headers['x-client-fingerprint'] as string
          }
        );

        // Set HttpOnly cookie for browser sessions
        reply.setCookie('sid', sessionId, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax',
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 15 * 60,
          path: '/'
        });

        // Update user login stats
        // TODO: Fix authRepository access
        // await authRepository.updateUserLastLogin(user.id);

        // Log successful login
        await auditLogger.logEvent({
          action: 'login_success',
          entityType: 'user',
          entityId: user.id,
          organizationId: user.organizationId,
          userId: user.id,
          metadata: {
            loginMethod: 'opaque_token',
            sessionId: sessionId,
            rememberMe: rememberMe,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            roles: user.roles,
            permissions: user.permissions?.length || 0
          }
        }, request);

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
        // response: {
        //   200: OpaqueLogoutResponseSchema,
        //   401: OpaqueErrorSchema,
        //   500: OpaqueErrorSchema
        // }
      }
    },
    async (request, reply) => {
      const { allDevices = false } = request.body;
      // const cache = (fastify as any).cache; // No longer needed for F2B
      const auditLogger = new AuditLogger(fastify);

      try {
        const sessionId = extractSessionId(request);
        if (!sessionId) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "No active session",
            code: "NO_SESSION"
          });
        }

        // Use SessionService for logout
        const { SessionService } = await import('../../lib/auth/session-service.js');
        const sessionService = new SessionService();
        
        // Get session data for user context
        const sessionData = await sessionService.validateSession(sessionId);
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
          revokedCount = await sessionService.revokeUserSessions(
            sessionData.userId, 
            'user_logout_all_devices'
          );
        } else {
          // Revoke current session only
          const success = await sessionService.revokeSession(sessionId, 'user_logout');
          revokedCount = success ? 1 : 0;
        }

        // Log logout action
        await auditLogger.logEvent({
          action: 'logout',
          entityType: 'user',
          entityId: sessionData.userId,
          organizationId: sessionData.tenantId,
          userId: sessionData.userId,
          metadata: {
            logoutMethod: 'opaque_token',
            sessionId: sessionId,
            allDevices: allDevices,
            revokedCount: revokedCount,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
          }
        }, request);

        // Clear cookie
        reply.clearCookie('sid', { path: '/' });

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
      // const cache = (fastify as any).cache; // No longer needed for F2B
      
      try {
        const sessionId = extractSessionId(request);
        if (!sessionId) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Session required",
            code: "SESSION_REQUIRED"
          });
        }

        // F2B: Session validation using SessionService instead of cache
        const { SessionService } = await import('../../lib/auth/session-service.js');
        const sessionService = new SessionService();
        const sessionData = await sessionService.validateSession(sessionId);
        if (!sessionData) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid session",
            code: "INVALID_SESSION"
          });
        }
        // sessionData is already parsed from SessionService

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
            lastActivity: new Date().toISOString(), // Use current time as lastActivity
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

  // Add /me endpoint for user profile
  fastify.get<{
    Reply: any;
  }>(
    "/me",
    {
      schema: {
        response: {
          200: Type.Object({
            id: Type.String(),
            email: Type.String(),
            displayName: Type.String(),
            roles: Type.Array(Type.String()),
            organizationId: Type.String(),
          }),
          401: Type.Object({
            error: Type.String(),
            message: Type.String(),
            code: Type.String(),
          }),
          500: Type.Object({
            error: Type.String(),
            message: Type.String(),
            code: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const sessionId = extractSessionId(request);
        if (!sessionId) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "No active session",
            code: "NO_SESSION"
          });
        }

        // Validate session using SessionService
        const { SessionService } = await import('../../lib/auth/session-service.js');
        const sessionService = new SessionService();
        const sessionData = await sessionService.validateSession(sessionId);

        if (!sessionData) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid session",
            code: "INVALID_SESSION"
          });
        }

        // Return user data from session
        return reply.status(200).send({
          id: sessionData.userId,
          email: sessionData.email || '',
          displayName: sessionData.displayName || '',
          roles: sessionData.roles,
          organizationId: sessionData.organizationId,
        });
      } catch (error) {
        logger.error({ err: error, event: 'auth.me_error' }, 'Me route error occurred');
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "An error occurred while retrieving user profile",
          code: "PROFILE_RETRIEVAL_ERROR"
        });
      }
    }
  );

  logger.info('Opaque auth routes registered (AUTH_USE_OPAQUE=true)');
};

export default opaqueAuthRoutes;
