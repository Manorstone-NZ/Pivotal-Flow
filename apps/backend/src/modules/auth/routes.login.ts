import type { FastifyPluginAsync } from "fastify";
import { createAuditLogger } from "../../lib/audit-logger.drizzle.js";
import { logger } from "../../lib/logger.js";
import type { LoginRequest, LoginResponse, AuthError } from "./schemas.js";
import { config } from "../../lib/config.js";
import { AuthService } from "./service.drizzle.js";

export const loginRoute: FastifyPluginAsync = async fastify => {
  const auditLogger = createAuditLogger(fastify);

  fastify.post<{ Body: LoginRequest; Reply: LoginResponse | AuthError }>(
    "/login",
    {
      // per route rate limit for unauthenticated calls
      config: { rateLimit: { max: config.rateLimit.max, timeWindow: config.rateLimit.window } },
      schema: {
        tags: ["auth"],
        summary: "User login",
        description: "Authenticate user with email and password",
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
      const tokenManager = fastify.tokenManager;
      const { email: rawEmail, password } = request.body;
      const authService = new AuthService(fastify);

      const email = rawEmail.trim().toLowerCase();

      try {
        // Authenticate user with database
        const user = await authService.authenticateUser(email, password);
        
        if (!user) {
          // Log failed login attempt
          try {
            await auditLogger.logAuthEvent(
              "auth.login_failed",
              "unknown",
              "unknown",
              { email, reason: "invalid_credentials" },
              request
            );
          } catch (auditError) {
            logger.warn({ err: auditError }, "Audit log write failed for failed login");
          }

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

        reply.setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: config.auth.cookieSecure,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60
        });

        try {
          await auditLogger.logAuthEvent(
            "auth.login",
            user.organizationId,
            user.id,
            { email: user.email },
            request
          );
        } catch (auditError) {
          logger.warn({ err: auditError }, "Audit log write failed for login");
        }

        return reply.status(200).send({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName || '',
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
