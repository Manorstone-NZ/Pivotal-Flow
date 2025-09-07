// List users route with pagination and filters

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

import { logger } from '../../lib/logger.js';

import { canViewUsers, extractUserContext } from './rbac.js';
import { 
  UserListFiltersSchema,
  UserListSortSchema,
  UserListResponseSchema,
  UserErrorSchema,
  type UserListFilters,
  type UserListSort,
  type UserListResponse,
  type UserError
} from './typeboxSchemas.js';
import { listUsers } from './service.drizzle.js';

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
  fastify.get<{
    Querystring: ListUsersQuery;
    Reply: UserListResponse | UserError;
  }>('/v1/users', {
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1 })),
        pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
        q: Type.Optional(Type.String()),
        isActive: Type.Optional(Type.Boolean()),
        roleId: Type.Optional(Type.String()),
        sortField: Type.Optional(Type.Union([
          Type.Literal('email'),
          Type.Literal('createdAt')
        ])),
        sortDirection: Type.Optional(Type.Union([
          Type.Literal('asc'),
          Type.Literal('desc')
        ]))
      }),
      response: {
        200: UserListResponseSchema,
        400: UserErrorSchema,
        401: UserErrorSchema,
        403: UserErrorSchema,
        429: UserErrorSchema
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

      // Parse and validate query parameters (TypeBox handles validation automatically)
      const pagination = {
        page: request.query.page || 1,
        pageSize: request.query.pageSize || 20
      };

      const filters: UserListFilters = {
        ...(request.query.q !== undefined && { q: request.query.q }),
        ...(request.query.isActive !== undefined && { isActive: request.query.isActive }),
        ...(request.query.roleId !== undefined && { roleId: request.query.roleId })
      };

      const sort: UserListSort = {
        field: request.query.sortField || 'createdAt',
        direction: request.query.sortDirection || 'desc'
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
