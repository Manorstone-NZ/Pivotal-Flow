/**
 * PASETO-based Login Route
 * Replaces JWT authentication with PASETO + Opaque tokens
 */

import type { FastifyPluginAsync } from "fastify";
import { config } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { LoginRequestSchema, LoginResponseSchema, AuthErrorSchema, type LoginRequest, type LoginResponse, type AuthError } from "./typeboxSchemas.js";
import { AuthService } from "./service.drizzle.js";
import { users } from "../../lib/schema.js";
import type { SessionData, TokenBinding } from "../../lib/tokens/paseto-service.js";

export const pasetoLoginRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{
    Body: LoginRequest;
    Reply: LoginResponse | AuthError;
  }>(
    "/login",
    {
      schema: {
        body: LoginRequestSchema,
        response: {
          200: LoginResponseSchema,
          401: AuthErrorSchema,
          500: AuthErrorSchema
        }
      }
    },
    async (request, reply) => {
      const { email: rawEmail, password } = request.body;
      const authService = new AuthService(fastify);
      
      // Debug token service availability
      logger.info({ 
        hasFastify: !!fastify,
        hasTokenService: !!((fastify as any).tokenService),
        hasCache: !!((fastify as any).cache),
        hasDb: !!((fastify as any).db),
        fastifyKeys: Object.keys(fastify).filter(k => !k.startsWith('_'))
      }, 'Debugging token service availability');
      
      // Create token service directly since plugin decoration isn't working
      const tokenService = (fastify as any).tokenService || new (await import('../../lib/tokens/paseto-service.js')).PasetoTokenService(fastify);

      const email = rawEmail.trim().toLowerCase();

      try {
        // Debug: Test database connection
        logger.info({ email }, 'Attempting PASETO login for user');
        
        // Test database query directly
        try {
          const testResult = await (fastify as any).db.execute('SELECT 1 as test');
          logger.info({ testResult: testResult.length }, 'Database test query successful');
        } catch (dbError) {
          logger.error({ dbError }, 'Database test query failed');
          throw dbError;
        }
        
        // Authenticate user with database
        const user = await authService.authenticateUser(email, password);
        
        if (!user) {
          // Log failed login attempt
          logger.info({
            request_id: request.id,
            user_id: 'unknown',
            organisation_id: 'unknown',
            outcome: 'failed',
            reason: 'invalid_credentials',
            email: email
          }, 'Login failed: invalid credentials');

          return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS"
          });
        }

        // Extract token binding information
        const tokenBinding: TokenBinding = {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
          fingerprint: request.headers['x-client-fingerprint'] as string
        };

        // Create session data
        const sessionData: SessionData = {
          userId: user.id,
          tenantId: user.organizationId, // Using organizationId as tenantId for now
          organizationId: user.organizationId,
          roles: user.roles,
          permissions: user.permissions || [],
          memberships: [
            {
              tenantId: user.organizationId,
              role: user.roles[0] || 'STAFF'
            }
          ],
          createdAt: new Date(),
          lastActivity: new Date(),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
          fingerprint: tokenBinding.fingerprint
        };

        // Generate PASETO tokens
        const accessToken = await tokenService.generateAccessToken(sessionData, tokenBinding);
        const refreshToken = await tokenService.generateRefreshToken(user.id, user.organizationId, tokenBinding);

        // Log successful login
        logger.info({
          request_id: request.id,
          user_id: user.id,
          organisation_id: user.organizationId,
          outcome: 'success',
          email: email,
          token_type: 'PASETO'
        }, 'Login successful');

        // Return response with PASETO tokens
        return reply.status(200).send({
          accessToken,
          refreshToken,
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
        }, 'Login error');

        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Login failed",
          code: "LOGIN_ERROR"
        });
      }
    }
  );
};

export default pasetoLoginRoute;
