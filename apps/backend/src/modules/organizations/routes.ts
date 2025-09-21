/**
 * Organization routes
 * API endpoints for organization management
 */

import type { FastifyInstance, FastifyReply } from 'fastify';

import { OrganizationService } from './service.js';
import {
  CreateOrganizationBodySchema,
  UpdateOrganizationBodySchema,
  InviteUserBodySchema,
  OrganizationSettingsBodySchema,
  OrganizationIdParamSchema,
  OrganizationQuerystringSchema,
  OrganizationResponseSchema,
  // OrganizationListResponseSchema, // TODO: Use when needed
  OrganizationDetailResponseSchema,
  OrganizationSettingsResponseSchema,
  InviteUserResponseSchema,
  StandardSuccessResponseSchema,
  ErrorResponseSchema,
} from './schemas.js';

// List organizations
export function registerOrganizationListRoute(fastify: FastifyInstance): void {
  fastify.get('/v1/organizations', {
    schema: {
      tags: ['Organizations'],
      summary: 'List organizations',
      description: 'Get paginated list of organizations with filtering',
      security: [{ bearerAuth: [] }],
      querystring: OrganizationQuerystringSchema,
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const organizationService = new OrganizationService(fastify);

      const result = await organizationService.listOrganizations(
        request.query,
        {
          page: request.query.page,
          limit: request.query.limit,
        }
      );

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to list organizations',
      });
    }
  });
}

// Create organization
export function registerOrganizationCreateRoute(fastify: FastifyInstance): void {
  fastify.post('/v1/organizations', {
    schema: {
      tags: ['Organizations'],
      summary: 'Create organization',
      description: 'Create a new organization/tenant',
      security: [{ bearerAuth: [] }],
      body: CreateOrganizationBodySchema,
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const organizationService = new OrganizationService(fastify);

      const organization = await organizationService.createOrganization(request.body);

      return reply.status(201).send({
        success: true,
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create organization',
      });
    }
  });
}

// Get organization by ID
export function registerOrganizationDetailRoute(fastify: FastifyInstance): void {
  fastify.get('/v1/organizations/:id', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization',
      description: 'Get organization details by ID',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      response: {
        200: OrganizationDetailResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const organization = await organizationService.getOrganizationById(organizationId);

      if (!organization) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({
        success: true,
        data: organization,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get organization',
      });
    }
  });
}

// Update organization
export function registerOrganizationUpdateRoute(fastify: FastifyInstance): void {
  fastify.patch('/v1/organizations/:id', {
    schema: {
      tags: ['Organizations'],
      summary: 'Update organization',
      description: 'Update organization details',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      body: UpdateOrganizationBodySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: OrganizationResponseSchema,
            message: { type: 'string' },
          },
        },
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const organization = await organizationService.updateOrganization(organizationId, request.body);

      if (!organization) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({
        success: true,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update organization',
      });
    }
  });
}

// Delete organization
export function registerOrganizationDeleteRoute(fastify: FastifyInstance): void {
  fastify.delete('/v1/organizations/:id', {
    schema: {
      tags: ['Organizations'],
      summary: 'Delete organization',
      description: 'Soft delete organization',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      response: {
        200: StandardSuccessResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const success = await organizationService.deleteOrganization(organizationId);

      if (!success) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete organization',
      });
    }
  });
}

// Get organization settings
export function registerOrganizationSettingsGetRoute(fastify: FastifyInstance): void {
  fastify.get('/v1/organizations/:id/settings', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization settings',
      description: 'Get organization settings and configuration',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      response: {
        200: OrganizationSettingsResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const settings = await organizationService.getOrganizationSettings(organizationId);

      if (settings === null) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get organization settings',
      });
    }
  });
}

// Update organization settings
export function registerOrganizationSettingsUpdateRoute(fastify: FastifyInstance): void {
  fastify.post('/v1/organizations/:id/settings', {
    schema: {
      tags: ['Organizations'],
      summary: 'Update organization settings',
      description: 'Update organization settings and configuration',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      body: OrganizationSettingsBodySchema,
      response: {
        200: OrganizationSettingsResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const settings = await organizationService.updateOrganizationSettings(
        organizationId,
        request.body.settings
      );

      if (settings === null) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update organization settings',
      });
    }
  });
}

// Invite user to organization
export function registerOrganizationInviteUserRoute(fastify: FastifyInstance): void {
  fastify.post('/v1/organizations/:id/invite-user', {
    schema: {
      tags: ['Organizations'],
      summary: 'Invite user to organization',
      description: 'Send invitation email to user for organization access',
      security: [{ bearerAuth: [] }],
      params: OrganizationIdParamSchema,
      body: InviteUserBodySchema,
      response: {
        200: InviteUserResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { user: _user } = request; // TODO: Use user for permission checks
      const { id: organizationId } = request.params;
      const organizationService = new OrganizationService(fastify);

      const result = await organizationService.inviteUser(organizationId, request.body);

      return reply.send({
        success: true,
        message: 'User invitation sent successfully',
        data: result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to invite user',
      });
    }
  });
}
