import { Type } from '@sinclair/typebox';
import { ProjectService } from './service.js';
import { CreateProjectSchema, UpdateProjectSchema, ProjectFiltersSchema, ProjectDetailResponseSchema, ProjectsListResponseSchema, ProjectErrorSchema } from './typeboxSchemas.js';
export async function projectRoutes(fastify) {
    // List projects with filters and pagination
    fastify.get('/api/v1/projects', {
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
            const authenticatedRequest = request;
            const { organizationId, userId } = authenticatedRequest.user;
            const filters = authenticatedRequest.query;
            const projectService = new ProjectService({ organizationId, userId });
            const result = await projectService.listProjects(filters);
            return reply.code(200).send(result);
        }
        catch (error) {
            fastify.log.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Projects list error');
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to list projects',
                code: 'PROJECTS_LIST_ERROR'
            });
        }
    });
    // Get project by ID
    fastify.get('/api/v1/projects/:id', {
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
            const authenticatedRequest = request;
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
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get project',
                code: 'PROJECT_GET_ERROR'
            });
        }
    });
    // Create new project
    fastify.post('/api/v1/projects', {
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
            const authenticatedRequest = request;
            const { organizationId, userId } = authenticatedRequest.user;
            const projectData = authenticatedRequest.body;
            const projectService = new ProjectService({ organizationId, userId });
            const project = await projectService.createProject(projectData);
            return reply.code(201).send(project);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create project',
                code: 'PROJECT_CREATE_ERROR'
            });
        }
    });
    // Update project
    fastify.patch('/api/v1/projects/:id', {
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
            const authenticatedRequest = request;
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
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update project',
                code: 'PROJECT_UPDATE_ERROR'
            });
        }
    });
    // Delete project (soft delete)
    fastify.delete('/api/v1/projects/:id', {
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
            const authenticatedRequest = request;
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
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to delete project',
                code: 'PROJECT_DELETE_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map