import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
// Value import removed as it's not used

// Remove unused import

import { F2RateCardService } from './f2Service.js';
import { 
  CreateRateCardSchema,
  UpdateRateCardSchema,
  CreateServiceSchema,
  UpdateServiceSchema,
  RateCardListQuerySchema,
  RateCardResponseSchema,
  RateCardListResponseSchema,
  ServiceResponseSchema,
  RateCardErrorSchema,
  type RateCardListQuery,
  type CreateRateCard,
  type UpdateRateCard,
  type CreateService,
  type UpdateService
} from './f2Schemas.js';

// Type definition for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  tenantId: string;
  roles: string[];
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
};

export async function f2RateCardRoutes(fastify: FastifyInstance) {
  // Register session verification for F2B compliance
  const { verifySession } = await import('../../lib/auth/session-verification.js');
  
  // Add session verification middleware to all routes
  fastify.addHook('preHandler', verifySession);

  // List rate cards
  fastify.get('/rate-cards', {
    schema: {
      querystring: RateCardListQuerySchema,
      response: {
        200: RateCardListResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Querystring: RateCardListQuery }>, reply) => {
    try {
      const query = request.query;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const result = await rateCardService.getAllRateCards(query);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch rate cards',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get single rate card
  fastify.get('/rate-cards/:id', {
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: RateCardResponseSchema,
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const rateCard = await rateCardService.getRateCard(id);
      
      if (!rateCard) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Rate card not found',
          code: 'RATE_CARD_NOT_FOUND'
        });
      }

      return reply.send(rateCard);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Create rate card
  fastify.post('/rate-cards', {
    schema: {
      body: CreateRateCardSchema,
      response: {
        201: RateCardResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateRateCard }>, reply) => {
    try {
      const data = request.body;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const rateCard = await rateCardService.createRateCard(data);
      return reply.code(201).send(rateCard);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Update rate card
  fastify.put('/rate-cards/:id', {
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      body: UpdateRateCardSchema,
      response: {
        200: RateCardResponseSchema,
        404: RateCardErrorSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateRateCard }>, reply) => {
    try {
      const { id } = request.params;
      const data = request.body;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const rateCard = await rateCardService.updateRateCard(id, data);
      
      if (!rateCard) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Rate card not found',
          code: 'RATE_CARD_NOT_FOUND'
        });
      }

      return reply.send(rateCard);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Delete rate card
  fastify.delete('/rate-cards/:id', {
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        204: Type.Null(),
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const deleted = await rateCardService.deleteRateCard(id);
      
      if (!deleted) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Rate card not found',
          code: 'RATE_CARD_NOT_FOUND'
        });
      }

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Create service
  fastify.post('/rate-cards/:rateCardId/services', {
    schema: {
      params: Type.Object({
        rateCardId: Type.String()
      }),
      body: CreateServiceSchema,
      response: {
        201: ServiceResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        404: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { rateCardId: string }; Body: CreateService }>, reply) => {
    try {
      const { rateCardId } = request.params;
      const data = request.body;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const service = await rateCardService.createService(rateCardId, data);
      return reply.code(201).send(service);
    } catch (error) {
      if (error instanceof Error && error.message === 'Rate card not found') {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Rate card not found',
          code: 'RATE_CARD_NOT_FOUND'
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create service',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Update service
  fastify.put('/rate-cards/:rateCardId/services/:serviceId', {
    schema: {
      params: Type.Object({
        rateCardId: Type.String(),
        serviceId: Type.String()
      }),
      body: UpdateServiceSchema,
      response: {
        200: ServiceResponseSchema,
        404: RateCardErrorSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { rateCardId: string; serviceId: string }; Body: UpdateService }>, reply) => {
    try {
      const { rateCardId, serviceId } = request.params;
      const data = request.body;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const service = await rateCardService.updateService(rateCardId, serviceId, data);
      
      if (!service) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Service not found',
          code: 'SERVICE_NOT_FOUND'
        });
      }

      return reply.send(service);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update service',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Delete service
  fastify.delete('/rate-cards/:rateCardId/services/:serviceId', {
    schema: {
      params: Type.Object({
        rateCardId: Type.String(),
        serviceId: Type.String()
      }),
      response: {
        204: Type.Null(),
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { rateCardId: string; serviceId: string } }>, reply) => {
    try {
      const { rateCardId, serviceId } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const deleted = await rateCardService.deleteService(rateCardId, serviceId);
      
      if (!deleted) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Service not found',
          code: 'SERVICE_NOT_FOUND'
        });
      }

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete service',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get single service
  fastify.get('/rate-cards/:rateCardId/services/:serviceId', {
    schema: {
      params: Type.Object({
        rateCardId: Type.String(),
        serviceId: Type.String()
      }),
      response: {
        200: ServiceResponseSchema,
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { rateCardId: string; serviceId: string } }>, reply) => {
    try {
      const { rateCardId, serviceId } = request.params;
      const authenticatedRequest = request as AuthenticatedRequest;
      const rateCardService = new F2RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        tenantId: authenticatedRequest.user.tenantId,
        userId: authenticatedRequest.user.userId
      });
      const service = await rateCardService.getService(rateCardId, serviceId);
      
      if (!service) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Service not found',
          code: 'SERVICE_NOT_FOUND'
        });
      }

      return reply.send(service);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch service',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}

// No need to extend FastifyRequest since we create service instances in handlers
