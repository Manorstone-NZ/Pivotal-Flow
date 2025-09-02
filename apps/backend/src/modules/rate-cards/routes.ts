import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { RateCardService } from './service.js';

// Request schemas
const CreateRateCardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be YYYY-MM-DD'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be YYYY-MM-DD').optional(),
    isDefault: z.boolean().optional(),
    metadata: z.record(z.any()).optional()
  })
});

const UpdateRateCardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    currency: z.string().length(3, 'Currency must be 3 characters').optional(),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be YYYY-MM-DD').optional(),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be YYYY-MM-DD').optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional()
  })
});

const CreateRateCardItemSchema = z.object({
  body: z.object({
    serviceCategoryId: z.string().uuid('Service category ID must be a valid UUID'),
    roleId: z.string().uuid('Role ID must be a valid UUID').optional(),
    baseRate: z.number().positive('Base rate must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters').optional(),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be YYYY-MM-DD'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be YYYY-MM-DD').optional(),
    metadata: z.record(z.any()).optional()
  })
});

const UpdateRateCardItemSchema = z.object({
  body: z.object({
    serviceCategoryId: z.string().uuid('Service category ID must be a valid UUID').optional(),
    roleId: z.string().uuid('Role ID must be a valid UUID').optional(),
    baseRate: z.number().positive('Base rate must be positive').optional(),
    currency: z.string().length(3, 'Currency must be 3 characters').optional(),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be YYYY-MM-DD').optional(),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be YYYY-MM-DD').optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional()
  })
});

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

export async function rateCardRoutes(fastify: FastifyInstance) {
  // RateCardService will be instantiated per request with proper user context

  // Create a new rate card
  fastify.post('/rate-cards', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'currency', 'effectiveFrom'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          effectiveFrom: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          effectiveUntil: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          isDefault: { type: 'boolean' },
          metadata: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isDefault: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { name: string; description?: string; currency: string; effectiveFrom: string; effectiveUntil?: string; isDefault?: boolean; metadata?: Record<string, any> } }>, reply) => {
    try {
      const { body } = CreateRateCardSchema.parse(request);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCard({
        ...body,
        isActive: true,
        isDefault: body.isDefault || false,
        metadata: body.metadata || {}
      });
      
      reply.status(201).send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error creating rate card');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get a rate card by ID
  fastify.get('/rate-cards/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isDefault: { type: 'boolean' },
            isActive: { type: 'boolean' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  serviceCategoryId: { type: 'string' },
                  roleId: { type: 'string' },
                  baseRate: { type: 'string' },
                  currency: { type: 'string' },
                  effectiveFrom: { type: 'string' },
                  effectiveUntil: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.getRateCardById(id);
      
      if (!result) {
        return reply.status(404).send({ 
          error: 'Not found',
          message: 'Rate card not found'
        });
      }
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error getting rate card');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List rate cards with pagination
  fastify.get('/rate-cards', {
    schema: {
      
      
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  currency: { type: 'string' },
                  effectiveFrom: { type: 'string' },
                  effectiveUntil: { type: 'string' },
                  isDefault: { type: 'boolean' },
                  isActive: { type: 'boolean' }
                }
              }
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { page?: number; pageSize?: number; search?: string } }>, reply) => {
    try {
      const { page = 1, pageSize = 20, search } = request.query;
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const options: any = { page, pageSize };
      if (search) {
        options.search = search;
      }
      
      const result = await rateCardService.listRateCards(options);
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error listing rate cards');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update a rate card
  fastify.put('/rate-cards/:id', {
    schema: {
      
      
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          effectiveFrom: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          effectiveUntil: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          isDefault: { type: 'boolean' },
          isActive: { type: 'boolean' },
          metadata: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isDefault: { type: 'boolean' },
            isActive: { type: 'boolean' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; description?: string; currency?: string; effectiveFrom?: string; effectiveUntil?: string; isDefault?: boolean; isActive?: boolean; metadata?: Record<string, any> } }>, reply) => {
    try {
      const { id } = request.params;
      const { body } = UpdateRateCardSchema.parse(request);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.updateRateCard(id, body);
      
      if (!result) {
        return reply.status(404).send({ 
          error: 'Not found',
          message: 'Rate card not found'
        });
      }
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error updating rate card');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create a rate card item
  fastify.post('/rate-cards/:id/items', {
    schema: {
      
      
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        required: ['serviceCategoryId', 'baseRate', 'effectiveFrom'],
        properties: {
          serviceCategoryId: { type: 'string', format: 'uuid' },
          roleId: { type: 'string', format: 'uuid' },
          baseRate: { type: 'number', minimum: 0 },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          effectiveFrom: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          effectiveUntil: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          metadata: { type: 'object' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceCategoryId: { type: 'string' },
            roleId: { type: 'string' },
            baseRate: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { serviceCategoryId: string; roleId?: string; baseRate: number; currency?: string; effectiveFrom: string; effectiveUntil?: string; metadata?: Record<string, any> } }>, reply) => {
    try {
      const { id: rateCardId } = request.params;
      const { body } = CreateRateCardItemSchema.parse(request);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCardItem({
        ...body,
        rateCardId,
        isActive: true,
        currency: body.currency || 'NZD',
        metadata: body.metadata || {}
      });
      
      reply.status(201).send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error creating rate card item');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update a rate card item
  fastify.put('/rate-cards/:id/items/:itemId', {
    schema: {
      
      
      params: {
        type: 'object',
        required: ['id', 'itemId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          serviceCategoryId: { type: 'string', format: 'uuid' },
          roleId: { type: 'string', format: 'uuid' },
          baseRate: { type: 'number', minimum: 0 },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          effectiveFrom: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          effectiveUntil: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          isActive: { type: 'boolean' },
          metadata: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceCategoryId: { type: 'string' },
            roleId: { type: 'string' },
            baseRate: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string; itemId: string }; Body: { serviceCategoryId?: string; roleId?: string; baseRate?: number; currency?: string; effectiveFrom?: string; effectiveUntil?: string; isActive?: boolean; metadata?: Record<string, any> } }>, reply) => {
    try {
      const { itemId } = request.params;
      const { body } = UpdateRateCardItemSchema.parse(request);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.updateRateCardItem(
        itemId, 
        body
      );
      
      if (!result) {
        return reply.status(404).send({ 
          error: 'Not found',
          message: 'Rate card item not found'
        });
      }
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error updating rate card item');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Resolve pricing for line items using rate cards
  fastify.post('/rate-cards/resolve-pricing', {
    schema: {
      summary: 'Resolve pricing for quote line items',
      description: 'Resolve unit prices and tax rates for line items using rate cards with proper priority logic',
      body: {
        type: 'object',
        required: ['lineItems'],
        properties: {
          lineItems: {
            type: 'array',
            items: {
              type: 'object',
              required: ['lineNumber', 'description'],
              properties: {
                lineNumber: { type: 'integer', minimum: 1 },
                description: { type: 'string', minLength: 1 },
                unitPrice: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', minimum: 0 },
                    currency: { type: 'string', minLength: 3, maxLength: 3 }
                  }
                },
                serviceCategoryId: { type: 'string', format: 'uuid' },
                rateCardId: { type: 'string', format: 'uuid' },
                taxRate: { type: 'number', minimum: 0, maximum: 1 },
                itemCode: { type: 'string' },
                unit: { type: 'string' }
              }
            }
          },
          effectiveDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          userHasOverridePermission: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  unitPrice: { type: 'string' },
                  taxRate: { type: 'string' },
                  unit: { type: 'string' },
                  source: { type: 'string', enum: ['explicit', 'rate_card', 'default'] },
                  rateCardId: { type: 'string' },
                  rateCardItemId: { type: 'string' },
                  serviceCategoryId: { type: 'string' },
                  itemCode: { type: 'string' }
                }
              }
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lineNumber: { type: 'integer' },
                  description: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        },
        422: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lineNumber: { type: 'integer' },
                  description: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { lineItems: any[]; effectiveDate?: string; userHasOverridePermission?: boolean } }>, reply) => {
    try {
      const { body } = request;
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.resolvePricing(
        body.lineItems,
        body.userHasOverridePermission || false,
        body.effectiveDate ? new Date(body.effectiveDate) : new Date()
      );
      
      if (!result.success && result.errors) {
        return reply.status(422).send({
          error: 'Pricing resolution failed',
          message: 'Some line items could not be priced',
          details: result.errors
        });
      }
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error resolving pricing');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get active rate card for a date
  fastify.get('/rate-cards/active/:date', {
    schema: {
      
      
      params: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            currency: { type: 'string' },
            effectiveFrom: { type: 'string' },
            effectiveUntil: { type: 'string' },
            isDefault: { type: 'boolean' },
            isActive: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { date: string } }>, reply) => {
    try {
      const { date } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.getActiveRateCard(new Date(date));
      
      if (!result) {
        return reply.status(404).send({ 
          error: 'Not found',
          message: 'No active rate card found for the specified date'
        });
      }
      
      reply.send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error getting active rate card');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
