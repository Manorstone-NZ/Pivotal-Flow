import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { logger } from '../../lib/logger.js';

import { MeResponseSchema, AuthErrorSchema, type MeResponse, type AuthError } from './typeboxSchemas.js';
import { AuthService } from './service.drizzle.js';

// Type definitions for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export const meRoute: FastifyPluginAsync = async (fastify) => {

  fastify.get<{ Reply: MeResponse | AuthError }>(
    '/me',
    {
      schema: {
        response: {
          200: MeResponseSchema,
          401: AuthErrorSchema,
          500: AuthErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const authenticatedRequest = request as AuthenticatedRequest;
        const user = authenticatedRequest.user;
        
        if (!user?.userId) {
          logger.warn({ event: 'auth.me_failed', reason: 'no_user_context' }, 'Me route failed: no user context');
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'No user context found',
            code: 'NO_USER_CONTEXT',
          });
        }

        const authService = new AuthService(fastify);
        const userData = await authService.getUserById(user.userId);

        if (!userData) {
          logger.warn({ 
            userId: user.userId, 
            event: 'auth.me_failed', 
            reason: 'user_not_found_or_inactive' 
          }, 'Me route failed: user not found or inactive');
          
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'User not found or inactive',
            code: 'USER_NOT_FOUND',
          });
        }

        // Log successful profile retrieval
        logger.debug({ 
          userId: user.userId, 
          organizationId: user.organizationId,
          event: 'auth.me_success' 
        }, 'User profile retrieved successfully');

        return reply.status(200).send({
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName ?? '',
          roles: userData.roles,
          organizationId: userData.organizationId,
        });
      } catch (error) {
        logger.error({ err: error, event: 'auth.me_error' }, 'Me route error occurred');
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'An error occurred while retrieving user profile',
          code: 'PROFILE_RETRIEVAL_ERROR',
        });
      }
    }
  );
};
