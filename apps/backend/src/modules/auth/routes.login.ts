import type { FastifyPluginAsync } from "fastify";

// import { createAuditLogger } from "../../lib/audit-logger.drizzle.js";
import { config } from "../../config/index.js";
import { logger } from "../../lib/logger.js";

import type { LoginRequest, LoginResponse, AuthError } from "./schemas.js";
import { AuthService } from "./service.drizzle.js";

export const loginRoute: FastifyPluginAsync = async fastify => {
  // const auditLogger = createAuditLogger(fastify);

  fastify.post<{ Body: LoginRequest; Reply: LoginResponse | AuthError }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12 }
          },
          additionalProperties: false
        },
        response: {
          200: {
            type: "object",
            required: ["accessToken", "user"],
            properties: {
              accessToken: { type: "string" },
              user: {
                type: "object",
                required: ["id", "email", "displayName", "roles", "organizationId"],
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                  displayName: { type: "string" },
                  roles: { type: "array", items: { type: "string" } },
                  organizationId: { type: "string" }
                },
                additionalProperties: false
              }
            },
            additionalProperties: false
          },
          401: errorShape(),
          500: errorShape()
        }
      }
    },
    async (request, reply) => {
      const tokenManager = (fastify as any).tokenManager;
      const { email: rawEmail, password } = request.body;
      const authService = new AuthService(fastify);

      const email = rawEmail.trim().toLowerCase();

      try {
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

        const accessToken = await tokenManager.signAccessToken({
          sub: user.id,
          org: user.organizationId,
          roles: user.roles
        });

        const refreshToken = await tokenManager.signRefreshToken({
          sub: user.id,
          org: user.organizationId,
          roles: user.roles
        });

        // Store refresh token in Redis using TokenManager
        const refreshTokenManager = (fastify as any).refreshTokenManager;
        const refreshJti = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await refreshTokenManager.setRefresh(refreshJti, {
          jti: refreshJti,
          userId: user.id,
          organisationId: user.organizationId,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        });

        reply.setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: config.auth.COOKIE_SECURE,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60
        });

        // Log successful login
        logger.info({
          request_id: request.id,
          user_id: user.id,
          organisation_id: user.organizationId,
          outcome: 'success',
          email: user.email
        }, 'Login successful');

        return reply.status(200).send({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? '',
            roles: user.roles,
            organizationId: user.organizationId
          }
        });
      } catch (err) {
        logger.error({ err, event: "auth.login_error" }, "Login error");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "An error occurred during login",
          code: "LOGIN_ERROR"
        });
      }
    }
  );
};

function errorShape() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["error", "message", "code"],
    properties: {
      error: { type: "string" },
      message: { type: "string" },
      code: { type: "string" }
    }
  } as const;
}
