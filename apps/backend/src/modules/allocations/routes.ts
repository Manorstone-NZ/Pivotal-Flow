import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AllocationService } from './service.js';
import { 
  CreateAllocationRequestSchema,
  CreateAllocationBodySchema,
  UpdateAllocationRequestSchema,
  AllocationFiltersSchema,
  ResourceAllocationResponseSchema,
  ListAllocationsResponseSchema,
  WeeklyCapacitySummarySchema,
  createAllocationsPagingResponse
} from './schemas.js';

// Type definition for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
  organizationId: string;
  userId: string;
};

export async function allocationRoutes(fastify: FastifyInstance) {
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
    } as any,
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const allocationData = CreateAllocationRequestSchema.parse({
        ...(request.body as any),
        projectId
      });

      const allocationService = new AllocationService(
        request.organizationId,
        request.userId,
        fastify
      );

      const allocation = await allocationService.createAllocation(allocationData as any);

      reply.status(201).send(allocation);
    } catch (error: any) {
      (fastify.log as any).error('Error creating allocation:', error);
      
      if (error.message.includes('conflicts detected')) {
        reply.status(409).send({
          error: 'Allocation Conflict',
          message: error.message,
          conflicts: JSON.parse(error.message.split(': ')[1] || '[]')
        });
      } else if (error.message.includes('permission')) {
        reply.status(403).send({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        reply.status(400).send({
          error: 'Bad Request',
          message: error.message
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
    } as any,
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const query = AllocationFiltersSchema.parse({
        projectId,
        ...(request.query as any)
      });

      const allocationService = new AllocationService(
        request.organizationId,
        request.userId,
        fastify
      );

      const result = await allocationService.getAllocations(
        query as any,
        query.page || 1,
        query.pageSize || 20
      );

      const pagingResponse = createAllocationsPagingResponse(
        result.allocations,
        query.page || 1,
        query.pageSize || 20,
        result.total
      );

      reply.send(pagingResponse);
    } catch (error: any) {
      (fastify.log as any).error('Error getting allocations:', error);
      
      if (error.message.includes('permission')) {
        reply.status(403).send({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        reply.status(400).send({
          error: 'Bad Request',
          message: error.message
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
    } as any,
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = UpdateAllocationRequestSchema.parse(request.body);

      const allocationService = new AllocationService(
        request.organizationId,
        request.userId,
        fastify
      );

      const allocation = await allocationService.updateAllocation(id, updateData as any);

      reply.send(allocation);
    } catch (error: any) {
      (fastify.log as any).error('Error updating allocation:', error);
      
      if (error.message.includes('conflicts detected')) {
        reply.status(409).send({
          error: 'Allocation Conflict',
          message: error.message,
          conflicts: JSON.parse(error.message.split(': ')[1] || '[]')
        });
      } else if (error.message.includes('not found')) {
        reply.status(404).send({
          error: 'Not Found',
          message: error.message
        });
      } else if (error.message.includes('permission')) {
        reply.status(403).send({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        reply.status(400).send({
          error: 'Bad Request',
          message: error.message
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
    } as any,
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const allocationService = new AllocationService(
        request.organizationId,
        request.userId,
        fastify
      );

      await allocationService.deleteAllocation(id);

      reply.status(204).send();
    } catch (error: any) {
      (fastify.log as any).error('Error deleting allocation:', error);
      
      if (error.message.includes('not found')) {
        reply.status(404).send({
          error: 'Not Found',
          message: error.message
        });
      } else if (error.message.includes('permission')) {
        reply.status(403).send({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        reply.status(400).send({
          error: 'Bad Request',
          message: error.message
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
    } as any,
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const { weeks = 8 } = request.query as { weeks?: number };

      const allocationService = new AllocationService(
        request.organizationId,
        request.userId,
        fastify
      );

      const capacity = await allocationService.getProjectCapacity(projectId, weeks);

      reply.send(capacity);
    } catch (error: any) {
      (fastify.log as any).error('Error getting project capacity:', error);
      
      if (error.message.includes('not found')) {
        reply.status(404).send({
          error: 'Not Found',
          message: error.message
        });
      } else if (error.message.includes('permission')) {
        reply.status(403).send({
          error: 'Forbidden',
          message: error.message
        });
      } else {
        reply.status(400).send({
          error: 'Bad Request',
          message: error.message
        });
      }
    }
  });
}
