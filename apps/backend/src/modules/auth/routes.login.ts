import type { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@pivotal-flow/shared/security/password';
import { createAuditLogger } from '../../lib/audit-logger.js';
import { logger } from '../../lib/logger.js';
import type { LoginRequest, LoginResponse, AuthError } from './schemas.js';

export const loginRoute: FastifyPluginAsync = async (fastify) => {
  // Initialize dependencies
  const prisma = new PrismaClient();
  const auditLogger = createAuditLogger(prisma);

  fastify.post<{ Body: LoginRequest; Reply: LoginResponse | AuthError }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 12 },
          },
          required: ['email', 'password'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              user: {
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
            },
            required: ['accessToken', 'user'],
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
        tags: ['auth'],
        summary: 'User login',
        description: 'Authenticate user with email and password',
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as LoginRequest;

      // Use the decorated tokenManager from the app
      const tokenManager = fastify.tokenManager;

      try {
        // Find user by email and organization (multi-tenant)
        const user = await prisma.user.findFirst({
          where: { 
            email,
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            passwordHash: true,
            organizationId: true,
            status: true,
            userRoles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
              where: {
                isActive: true,
              },
            },
          },
        });

        if (!user || user.status !== 'active') {
          logger.warn({ email, event: 'auth.login_failed', reason: 'user_not_found' }, 'Login failed: user not found or inactive');
          
          // Log audit event for failed login
          await auditLogger.logAuthEvent(
            'auth.login_failed',
            'unknown', // We don't know the organization for failed logins
            null,
            { email, reason: 'user_not_found' },
            request
          );
          
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          });
        }

        // Verify password
        if (!user.passwordHash) {
          logger.warn({ email, userId: user.id, event: 'auth.login_failed', reason: 'no_password_hash' }, 'Login failed: no password hash');
          
          // Log audit event for failed login
          await auditLogger.logAuthEvent(
            'auth.login_failed',
            user.organizationId,
            user.id,
            { email, reason: 'no_password_hash' },
            request
          );
          
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          });
        }
        
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          logger.warn({ email, userId: user.id, event: 'auth.login_failed', reason: 'invalid_password' }, 'Login failed: invalid password');
          
          // Log audit event for failed login
          await auditLogger.logAuthEvent(
            'auth.login_failed',
            user.organizationId,
            user.id,
            { email, reason: 'invalid_password' },
            request
          );
          
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          });
        }

        // Extract roles from userRoles relation
        const roles = (user as any).userRoles.map((ur: any) => ur.role.name);

        // Generate tokens
        const accessToken = await tokenManager.signAccessToken({
          sub: user.id,
          org: user.organizationId,
          roles,
        });

        const refreshToken = await tokenManager.signRefreshToken({
          sub: user.id,
          org: user.organizationId,
          roles,
        });

        // Set refresh token as HTTP-only cookie
        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env['COOKIE_SECURE'] === 'true',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        // Log successful login
        logger.info({ 
          userId: user.id, 
          email: user.email, 
          organizationId: user.organizationId,
          event: 'auth.login_success' 
        }, 'User logged in successfully');

        // Log audit event for successful login
        try {
          await auditLogger.logAuthEvent(
            'auth.login',
            user.organizationId,
            user.id,
            { email: user.email },
            request
          );
        } catch (auditError) {
          logger.warn({ err: auditError }, 'Failed to log audit event for successful login');
        }

        return reply.status(200).send({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? 'Unknown User',
            roles,
            organizationId: user.organizationId,
          },
        });
      } catch (error) {
        logger.error({ err: error, email, event: 'auth.login_error' }, 'Login error occurred');
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'An error occurred during login',
          code: 'LOGIN_ERROR',
        });
      }
    }
  );
};
