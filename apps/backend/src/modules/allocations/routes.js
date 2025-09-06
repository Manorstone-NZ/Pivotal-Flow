import { CreateAllocationRequestSchema, CreateAllocationBodySchema, UpdateAllocationRequestSchema, AllocationFiltersSchema, ResourceAllocationResponseSchema, ListAllocationsResponseSchema, WeeklyCapacitySummarySchema, createAllocationsPagingResponse } from './schemas.js';
import { AllocationService } from './service.js';
// Helper function to safely extract error information
function getErrorInfo(error) {
    if (error instanceof Error) {
        return { message: error.message, statusCode: error.statusCode };
    }
    return { message: String(error) };
}
export async function allocationRoutes(fastify) {
    // Create allocation
    fastify.post('/v1/projects/:projectId/allocations', {
        schema: {
            description: 'Create a new resource allocation',
            tags: ['Allocations'],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                },
                required: ['projectId']
            },
            body: CreateAllocationBodySchema,
            response: {
                201: ResourceAllocationResponseSchema,
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        conflicts: { type: 'array' }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { projectId } = request.params;
            const allocationData = CreateAllocationRequestSchema.parse({
                ...request.body,
                projectId
            });
            const allocationService = new AllocationService(request.organizationId, request.userId, fastify);
            const allocation = await allocationService.createAllocation(allocationData);
            reply.status(201).send(allocation);
        }
        catch (error) {
            fastify.log.error('Error creating allocation:', error);
            const errorInfo = getErrorInfo(error);
            if (errorInfo.message.includes('conflicts detected')) {
                reply.status(409).send({
                    error: 'Allocation Conflict',
                    message: errorInfo.message,
                    conflicts: JSON.parse(errorInfo.message.split(': ')[1] || '[]')
                });
            }
            else if (errorInfo.message.includes('permission')) {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: errorInfo.message
                });
            }
            else {
                reply.status(400).send({
                    error: 'Bad Request',
                    message: errorInfo.message
                });
            }
        }
    });
    // Get project allocations
    fastify.get('/v1/projects/:projectId/allocations', {
        schema: {
            description: 'Get allocations for a project',
            tags: ['Allocations'],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                },
                required: ['projectId']
            },
            querystring: AllocationFiltersSchema,
            response: {
                200: ListAllocationsResponseSchema,
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { projectId } = request.params;
            const query = AllocationFiltersSchema.parse({
                projectId,
                ...request.query
            });
            const allocationService = new AllocationService(request.organizationId, request.userId, fastify);
            const result = await allocationService.getAllocations(query, query.page || 1, query.pageSize || 20);
            // Transform AllocationQueryResult to ResourceAllocationResponse format
            const transformedAllocations = result.allocations.map(allocation => ({
                id: allocation.id,
                organizationId: request.organizationId,
                projectId: allocation.projectId,
                userId: allocation.userId,
                role: allocation.role,
                allocationPercent: allocation.allocationPercent,
                startDate: allocation.startDate.toISOString(),
                endDate: allocation.endDate.toISOString(),
                isBillable: allocation.isBillable,
                notes: allocation.notes ? JSON.parse(allocation.notes) : {},
                createdAt: allocation.createdAt.toISOString(),
                updatedAt: allocation.updatedAt.toISOString(),
                deletedAt: null
            }));
            const pagingResponse = createAllocationsPagingResponse(transformedAllocations, query.page || 1, query.pageSize || 20, result.total);
            reply.send(pagingResponse);
        }
        catch (error) {
            fastify.log.error('Error getting allocations:', error);
            const errorInfo = getErrorInfo(error);
            if (errorInfo.message.includes('permission')) {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: errorInfo.message
                });
            }
            else {
                reply.status(400).send({
                    error: 'Bad Request',
                    message: errorInfo.message
                });
            }
        }
    });
    // Update allocation
    fastify.patch('/v1/allocations/:id', {
        schema: {
            description: 'Update a resource allocation',
            tags: ['Allocations'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            body: UpdateAllocationRequestSchema,
            response: {
                200: ResourceAllocationResponseSchema,
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        conflicts: { type: 'array' }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const updateData = UpdateAllocationRequestSchema.parse(request.body);
            const allocationService = new AllocationService(request.organizationId, request.userId, fastify);
            const allocation = await allocationService.updateAllocation(id, updateData);
            reply.send(allocation);
        }
        catch (error) {
            fastify.log.error('Error updating allocation:', error);
            const errorInfo = getErrorInfo(error);
            if (errorInfo.message.includes('conflicts detected')) {
                reply.status(409).send({
                    error: 'Allocation Conflict',
                    message: errorInfo.message,
                    conflicts: JSON.parse(errorInfo.message.split(': ')[1] || '[]')
                });
            }
            else if (errorInfo.message.includes('not found')) {
                reply.status(404).send({
                    error: 'Not Found',
                    message: errorInfo.message
                });
            }
            else if (errorInfo.message.includes('permission')) {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: errorInfo.message
                });
            }
            else {
                reply.status(400).send({
                    error: 'Bad Request',
                    message: errorInfo.message
                });
            }
        }
    });
    // Delete allocation
    fastify.delete('/v1/allocations/:id', {
        schema: {
            description: 'Delete a resource allocation',
            tags: ['Allocations'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            response: {
                204: { type: 'null' },
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const allocationService = new AllocationService(request.organizationId, request.userId, fastify);
            await allocationService.deleteAllocation(id);
            reply.status(204).send();
        }
        catch (error) {
            fastify.log.error('Error deleting allocation:', error);
            const errorInfo = getErrorInfo(error);
            if (errorInfo.message.includes('not found')) {
                reply.status(404).send({
                    error: 'Not Found',
                    message: errorInfo.message
                });
            }
            else if (errorInfo.message.includes('permission')) {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: errorInfo.message
                });
            }
            else {
                reply.status(400).send({
                    error: 'Bad Request',
                    message: errorInfo.message
                });
            }
        }
    });
    // Get project capacity summary
    fastify.get('/v1/projects/:projectId/capacity', {
        schema: {
            description: 'Get project capacity summary with planned vs actual hours',
            tags: ['Allocations'],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                },
                required: ['projectId']
            },
            querystring: {
                type: 'object',
                properties: {
                    weeks: { type: 'integer', minimum: 1, maximum: 52, default: 8 }
                }
            },
            response: {
                200: WeeklyCapacitySummarySchema,
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { projectId } = request.params;
            const { weeks = 8 } = request.query;
            const allocationService = new AllocationService(request.organizationId, request.userId, fastify);
            const capacity = await allocationService.getProjectCapacity(projectId, weeks);
            reply.send(capacity);
        }
        catch (error) {
            fastify.log.error('Error getting project capacity:', error);
            const errorInfo = getErrorInfo(error);
            if (errorInfo.message.includes('not found')) {
                reply.status(404).send({
                    error: 'Not Found',
                    message: errorInfo.message
                });
            }
            else if (errorInfo.message.includes('permission')) {
                reply.status(403).send({
                    error: 'Forbidden',
                    message: errorInfo.message
                });
            }
            else {
                reply.status(400).send({
                    error: 'Bad Request',
                    message: errorInfo.message
                });
            }
        }
    });
}
//# sourceMappingURL=routes.js.map