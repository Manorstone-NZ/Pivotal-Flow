// Create user route with RBAC and audit logging

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { 
  userCreateSchema
} from './schemas.js';
import { createUser } from './service.js';
import { canManageUsers, extractUserContext } from './rbac.js';
import { logger } from '../../lib/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/users', {
    schema: {
      tags: ['Users'],
      summary: 'Create a new user',
      description: 'Create a new user in the current organization with the specified details',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', description: 'User email address' },
          firstName: { type: 'string', minLength: 1, maxLength: 100, description: 'User first name' },
          lastName: { type: 'string', minLength: 1, maxLength: 100, description: 'User last name' },
          displayName: { type: 'string', maxLength: 200, description: 'User display name' },
          phone: { type: 'string', maxLength: 20, description: 'User phone number' },
          timezone: { type: 'string', maxLength: 50, description: 'User timezone' },
          locale: { type: 'string', maxLength: 10, description: 'User locale' }
        },
        additionalProperties: false
      },
      response: {
        201: {
          description: 'User created successfully',
          type: 'object',
          required: ['id', 'email', 'isActive', 'mfaEnabled', 'createdAt', 'roles'],
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            displayName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            isActive: { type: 'boolean' },
            mfaEnabled: { type: 'boolean' },
            createdAt: { type: 'string' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'name', 'isSystem', 'isActive'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  isSystem: { type: 'boolean' },
                  isActive: { type: 'boolean' }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        },
        400: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        401: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        403: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        409: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        },
        429: {
          type: 'object',
          required: ['error', 'message', 'code'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' }
          },
          additionalProperties: false
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract user context
      const userContext = extractUserContext(request);
      
      // Check permissions
      const permissionCheck = await canManageUsers(userContext);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: 'users.create',
          reason: permissionCheck.reason,
          message: 'Permission denied for creating users'
        });
        
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to create users',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Validate request body
      const userData = userCreateSchema.parse(request.body);

      // Check if email already exists in organization
      const existingUser = await prisma.user.findFirst({
        where: {
          email: userData.email.toLowerCase(),
          organizationId: userContext.organizationId,
          deletedAt: null
        }
      });

      if (existingUser) {
        logger.warn({
          userId: userContext.userId,
          action: 'users.create',
          organizationId: userContext.organizationId,
          email: userData.email,
          message: 'User creation failed - email already exists'
        });

        return reply.status(409).send({
          error: 'Conflict',
          message: 'User with this email already exists in the organization',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      // Create user - filter out undefined values
      const filteredUserData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ...(userData.displayName !== undefined && { displayName: userData.displayName }),
        ...(userData.phone !== undefined && { phone: userData.phone }),
        ...(userData.timezone !== undefined && { timezone: userData.timezone }),
        ...(userData.locale !== undefined && { locale: userData.locale })
      };
      
      const newUser = await createUser(filteredUserData, userContext.organizationId);

      // Log audit event
      await prisma.auditLog.create({
        data: {
          organizationId: userContext.organizationId,
          userId: userContext.userId,
          action: 'users.create',
          entityType: 'User',
          entityId: newUser.id,
          newValues: {
            email: newUser.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            displayName: userData.displayName,
            phone: userData.phone,
            timezone: userData.timezone,
            locale: userData.locale
          },
          metadata: {
            actorUserId: userContext.userId,
            targetUserId: newUser.id,
            organizationId: userContext.organizationId
          }
        }
      });

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.create',
        organizationId: userContext.organizationId,
        newUserId: newUser.id,
        email: newUser.email,
        message: 'User created successfully'
      });

      // Return response
      return reply.status(201).send(newUser);

    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation Error')) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR',
          details: error.message
        });
      }

      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        action: 'users.create',
        message: 'Error creating user'
      });

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while creating the user',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
