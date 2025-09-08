import type { FastifyInstance, FastifyRequest } from 'fastify';

import { RateCardService } from './service.js';
import { 
  CreateRateCardSchema, 
  UpdateRateCardSchema, 
  CreateRateCardItemSchema, 
  UpdateRateCardItemSchema,
  RateCardResponseSchema,
  RateCardErrorSchema,
  type CreateRateCard,
  type RateCardResponse,
  type RateCardError
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

export async function rateCardRoutes(fastify: FastifyInstance) {
  // RateCardService will be instantiated per request with proper user context

  // Create a new rate card
  fastify.post<{
    Body: CreateRateCard;
    Reply: RateCardResponse | RateCardError;
  }>('/rate-cards', {
    schema: {
      body: CreateRateCardSchema,
      response: {
        201: RateCardResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateRateCard }>, reply) => {
    try {
      const validatedData = request.body; // TypeBox handles validation automatically
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCard({
        ...validatedData,
        isActive: true,
        isDefault: validatedData.isDefault || false,
        metadata: validatedData.metadata || {}
      });
      
      reply.status(201).send(result);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error creating rate card');
      reply.status(500).send({ 
        code: 'INTERNAL_SERVER_ERROR',
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
      const validatedData = UpdateRateCardSchema['parse'](request.body);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.updateRateCard(id, validatedData);
      
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
      const validatedData = CreateRateCardItemSchema['parse'](request.body);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCardItem({
        ...validatedData,
        rateCardId,
        isActive: true,
        currency: validatedData.currency || 'NZD',
        metadata: validatedData.metadata || {}
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
      const validatedData = UpdateRateCardItemSchema['parse'](request.body);
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService(fastify.db, {
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.updateRateCardItem(
        itemId, 
        validatedData
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
        body.userHasOverridePermission || false
      );
      
      if (!result.success && (result as any).errors) {
        return reply.status(422).send({
          error: 'Pricing resolution failed',
          message: 'Some line items could not be priced',
          details: (result as any).errors
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
