import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

import { PermissionService } from './service.js';

type AuthenticatedRequest = FastifyRequest & {
  user: { userId: string; organizationId: string; permissions: string[] };
};

// TypeBox schemas
const PermissionSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  category: Type.String(),
  resource: Type.String(),
  action: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
});

const RoleSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isSystem: Type.Boolean(),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  permissions: Type.Optional(Type.Array(PermissionSchema)),
});

const CreateRoleBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  organizationId: Type.Optional(Type.String()),
  permissionIds: Type.Optional(Type.Array(Type.String())),
});

const UpdateRolePermissionsBodySchema = Type.Object({
  permissionIds: Type.Array(Type.String()),
});

const AssignRoleBodySchema = Type.Object({
  userId: Type.String(),
  roleId: Type.String(),
  organizationId: Type.Optional(Type.String()),
});

export async function permissionRoutes(fastify: FastifyInstance) {
  // List all permissions
  fastify.get('/v1/permissions', {
    schema: {
      tags: ['Permissions'],
      summary: 'List all permissions',
      security: [{ bearerAuth: [] }],
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const permissions = await permissionService.listPermissions();
      return reply.send({
        success: true,
        data: permissions,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch permissions',
      });
    }
  });

  // List roles for organization
  fastify.get('/v1/roles', {
    schema: {
      tags: ['Permissions'],
      summary: 'List roles for organization',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        organizationId: Type.Optional(Type.String()),
      }),
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { organizationId } = request.query;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const roles = await permissionService.listRoles(organizationId);
      return reply.send({
        success: true,
        data: roles,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch roles',
      });
    }
  });

  // Create new role
  fastify.post('/v1/roles', {
    schema: {
      tags: ['Permissions'],
      summary: 'Create new role',
      security: [{ bearerAuth: [] }],
      body: CreateRoleBodySchema,
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const role = await permissionService.createRole(request.body);
      return reply.status(201).send({
        success: true,
        data: role,
        message: 'Role created successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create role',
      });
    }
  });

  // Update role permissions
  fastify.put('/v1/roles/:roleId/permissions', {
    schema: {
      tags: ['Permissions'],
      summary: 'Update role permissions',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        roleId: Type.String(),
      }),
      body: UpdateRolePermissionsBodySchema,
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { roleId } = request.params;
    const { permissionIds } = request.body;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      await permissionService.updateRolePermissions(roleId, permissionIds);
      return reply.send({
        success: true,
        message: 'Role permissions updated successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update role permissions',
      });
    }
  });

  // List user roles
  fastify.get('/v1/user-roles', {
    schema: {
      tags: ['Permissions'],
      summary: 'List user role assignments',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        organizationId: Type.Optional(Type.String()),
      }),
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { organizationId } = request.query;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const userRoles = await permissionService.listUserRoles(organizationId);
      return reply.send({
        success: true,
        data: userRoles,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch user roles',
      });
    }
  });

  // Assign role to user
  fastify.post('/v1/user-roles', {
    schema: {
      tags: ['Permissions'],
      summary: 'Assign role to user',
      security: [{ bearerAuth: [] }],
      body: AssignRoleBodySchema,
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { userId, roleId, organizationId } = request.body;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const userRole = await permissionService.assignRoleToUser(userId, roleId, organizationId);
      return reply.status(201).send({
        success: true,
        data: userRole,
        message: 'Role assigned successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to assign role',
      });
    }
  });

  // Revoke role from user
  fastify.delete('/v1/user-roles/:userRoleId', {
    schema: {
      tags: ['Permissions'],
      summary: 'Revoke role from user',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        userRoleId: Type.String(),
      }),
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { userRoleId } = request.params;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      await permissionService.revokeRoleFromUser(userRoleId);
      return reply.send({
        success: true,
        message: 'Role revoked successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to revoke role',
      });
    }
  });

  // List organization users (for role assignment)
  fastify.get('/v1/organization-users', {
    schema: {
      tags: ['Permissions'],
      summary: 'List organization users for role assignment',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        organizationId: Type.Optional(Type.String()),
      }),
    }
  }, async (request: any, reply: FastifyReply) => {
    const { user } = request;
    const { organizationId } = request.query;
    const permissionService = new PermissionService(fastify, user.userId, user.organizationId);

    try {
      const users = await permissionService.listOrganizationUsers(organizationId);
      return reply.send({
        success: true,
        data: users,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch organization users',
      });
    }
  });
}