import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

import { ProjectService } from './service.js';
import { 
  CreateProjectSchema, 
  UpdateProjectSchema,
  ProjectFiltersSchema,
  ProjectDetailResponseSchema,
  ProjectsListResponseSchema,
  ProjectErrorSchema,
  type CreateProject,
  type UpdateProject,
  type ProjectFilters,
  type ProjectDetailResponse,
  type ProjectsListResponse,
  type ProjectError
} from './typeboxSchemas.js';

// Type definition for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
};

export async function projectRoutes(fastify: FastifyInstance) {
  // List projects with filters and pagination
  fastify.get<{
    Querystring: ProjectFilters;
    Reply: ProjectsListResponse | ProjectError;
  }>('/api/v1/projects', {
    schema: {
      tags: ['Projects'],
      summary: 'List projects',
      description: 'Get a paginated list of projects with optional filtering',
      querystring: ProjectFiltersSchema,
      response: {
        200: ProjectsListResponseSchema,
        400: ProjectErrorSchema,
        500: ProjectErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const { organizationId, userId } = authenticatedRequest.user;
      const filters = authenticatedRequest.query;

      const projectService = new ProjectService({ organizationId, userId });
      const result = await projectService.listProjects(filters);

      return reply.code(200).send(result);
    } catch (error) {
      fastify.log.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Projects list error');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list projects',
        code: 'PROJECTS_LIST_ERROR'
      });
    }
  });

  // Get project by ID
  fastify.get<{
    Params: { id: string };
    Reply: ProjectDetailResponse | ProjectError;
  }>('/api/v1/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Get project by ID',
      description: 'Get detailed information about a specific project',
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: ProjectDetailResponseSchema,
        404: ProjectErrorSchema,
        500: ProjectErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const { organizationId, userId } = authenticatedRequest.user;
      const { id } = authenticatedRequest.params;

      const projectService = new ProjectService({ organizationId, userId });
      const project = await projectService.getProjectById(id);

      if (!project) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      return reply.code(200).send(project);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get project',
        code: 'PROJECT_GET_ERROR'
      });
    }
  });

  // Create new project
  fastify.post<{
    Body: CreateProject;
    Reply: ProjectDetailResponse | ProjectError;
  }>('/api/v1/projects', {
    schema: {
      tags: ['Projects'],
      summary: 'Create project',
      description: 'Create a new project',
      body: CreateProjectSchema,
      response: {
        201: ProjectDetailResponseSchema,
        400: ProjectErrorSchema,
        500: ProjectErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const { organizationId, userId } = authenticatedRequest.user;
      const projectData = authenticatedRequest.body;

      const projectService = new ProjectService({ organizationId, userId });
      const project = await projectService.createProject(projectData);

      return reply.code(201).send(project);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create project',
        code: 'PROJECT_CREATE_ERROR'
      });
    }
  });

  // Update project
  fastify.patch<{
    Params: { id: string };
    Body: UpdateProject;
    Reply: ProjectDetailResponse | ProjectError;
  }>('/api/v1/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Update project',
      description: 'Update an existing project',
      params: Type.Object({
        id: Type.String()
      }),
      body: UpdateProjectSchema,
      response: {
        200: ProjectDetailResponseSchema,
        404: ProjectErrorSchema,
        400: ProjectErrorSchema,
        500: ProjectErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const { organizationId, userId } = authenticatedRequest.user;
      const { id } = authenticatedRequest.params;
      const updateData = authenticatedRequest.body;

      const projectService = new ProjectService({ organizationId, userId });
      const project = await projectService.updateProject(id, updateData);

      if (!project) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      return reply.code(200).send(project);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update project',
        code: 'PROJECT_UPDATE_ERROR'
      });
    }
  });

  // Delete project (soft delete)
  fastify.delete<{
    Params: { id: string };
    Reply: { success: boolean } | ProjectError;
  }>('/api/v1/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Delete project',
      description: 'Soft delete a project',
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean()
        }),
        404: ProjectErrorSchema,
        500: ProjectErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const { organizationId, userId } = authenticatedRequest.user;
      const { id } = authenticatedRequest.params;

      const projectService = new ProjectService({ organizationId, userId });
      const success = await projectService.deleteProject(id);

      if (!success) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      return reply.code(200).send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete project',
        code: 'PROJECT_DELETE_ERROR'
      });
    }
  });
}
