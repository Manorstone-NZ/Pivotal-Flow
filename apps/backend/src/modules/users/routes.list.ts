// List users route with pagination and filters

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '../../lib/logger.js';

import { canViewUsers, extractUserContext } from './rbac.js';
import { 
  paginationSchema, 
  userListFiltersSchema, 
  userListSortSchema
} from './schemas.js';
import { listUsers, type UserListSort } from './service.drizzle.js';

interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  isActive?: boolean;
  roleId?: string;
  sortField?: 'email' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export const listUsersRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/v1/users', {
    schema: {
      
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
          pageSize: { type: 'number', minimum: 1, maximum: 100, default: 20, description: 'Items per page' },
          q: { type: 'string', description: 'Search query for email or display name' },
          isActive: { type: 'boolean', description: 'Filter by active status' },
          roleId: { type: 'string', description: 'Filter by specific role' },
          sortField: { type: 'string', enum: ['email', 'createdAt'], default: 'createdAt', description: 'Sort field' },
          sortDirection: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort direction' }
        },
        additionalProperties: false
      },
      response: {
        200: {
          
          type: 'object',
          required: ['items', 'page', 'pageSize', 'total', 'totalPages'],
          properties: {
            items: {
              type: 'array',
              items: {
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
              }
            },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
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
  }, async (request: FastifyRequest<{ Querystring: ListUsersQuery }>, reply: FastifyReply) => {
    try {
      // Extract user context
      const userContext = extractUserContext(request);
      
      // Check permissions
      const permissionCheck = await canViewUsers(userContext, fastify);
      if (!permissionCheck.hasPermission) {
        logger.warn({
          userId: userContext.userId,
          action: 'users.list',
          reason: permissionCheck.reason,
          message: 'Permission denied for listing users'
        });
        
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions to list users',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Parse and validate query parameters
      const pagination = paginationSchema.parse({
        page: request.query.page,
        pageSize: request.query.pageSize
      });

      const filters = userListFiltersSchema.parse({
        ...(request.query.q !== undefined && { q: request.query.q }),
        ...(request.query.isActive !== undefined && { isActive: request.query.isActive }),
        ...(request.query.roleId !== undefined && { roleId: request.query.roleId })
      });

      const parsedSort = userListSortSchema.parse({
        field: request.query.sortField || 'createdAt',
        direction: request.query.sortDirection || 'desc'
      });
      
      const sort: UserListSort = {
        field: parsedSort.field || 'createdAt',
        direction: parsedSort.direction || 'desc'
      };

      // Get users from service
      const result = await listUsers({
        organizationId: userContext.organizationId,
        filters: filters as any,
        sort,
        page: pagination.page,
        pageSize: pagination.pageSize
      }, fastify);

      // Log successful operation
      logger.info({
        userId: userContext.userId,
        action: 'users.list',
        organizationId: userContext.organizationId,
        filters,
        sort,
        pagination,
        resultCount: result.items.length,
        total: result.total
      });

      // Return response
      return reply.status(200).send({
        items: result.items,
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: result.total,
        totalPages: result.totalPages
      });

    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation Error')) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: error.message
        });
      }

      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        action: 'users.list',
        message: 'Error listing users'
      });

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while listing users',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
