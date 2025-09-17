import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

import { RateCardService } from './service.js';
import { 
  CreateRateCardSchema, 
  CreateRateCardItemSchema, 
  RateCardResponseSchema,
  RateCardItemResponseSchema,
  RateCardErrorSchema,
  type CreateRateCard,
  type CreateRateCardItem,
  type RateCardResponse,
  type RateCardItemResponse,
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
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCard({
        ...validatedData,
        isActive: true,
        isDefault: validatedData.isDefault || false,
        metadata: validatedData.metadata || {}
      });

      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get all rate cards
  fastify.get<{
    Reply: RateCardResponse[] | RateCardError;
  }>('/rate-cards', {
    schema: {
      response: {
        200: Type.Array(RateCardResponseSchema),
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.getAllRateCards();
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get rate cards',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get a specific rate card by ID
  fastify.get<{
    Params: { id: string };
    Reply: RateCardResponse | RateCardError;
  }>('/rate-cards/:id', {
    schema: {
      response: {
        200: RateCardResponseSchema,
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.getRateCardById(id);
      
      if (!result) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Rate card not found',
          code: 'RATE_CARD_NOT_FOUND'
        });
      }
      
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get rate card',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get rate card items for a specific rate card
  fastify.get<{
    Params: { id: string };
    Reply: RateCardItemResponse[] | RateCardError;
  }>('/rate-cards/:id/items', {
    schema: {
      response: {
        200: Type.Array(RateCardItemResponseSchema),
        404: RateCardErrorSchema,
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.getRateCardItems(id);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get rate card items',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Create a new rate card item for a specific rate card
  fastify.post<{
    Params: { id: string };
    Body: CreateRateCardItem;
    Reply: RateCardItemResponse | RateCardError;
  }>('/rate-cards/:id/items', {
    schema: {
      body: CreateRateCardItemSchema,
      response: {
        201: RateCardItemResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const validatedData = request.body; // TypeBox handles validation automatically
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCardItem(id, {
        ...validatedData,
        isActive: true,
        metadata: validatedData.metadata || {}
      });

      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create rate card item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Create a new rate card item
  fastify.post<{
    Body: CreateRateCardItem;
    Reply: RateCardItemResponse | RateCardError;
  }>('/rate-cards/items', {
    schema: {
      body: CreateRateCardItemSchema,
      response: {
        201: RateCardItemResponseSchema,
        400: RateCardErrorSchema,
        401: RateCardErrorSchema,
        403: RateCardErrorSchema,
        500: RateCardErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateRateCardItem }>, reply) => {
    try {
      const validatedData = request.body; // TypeBox handles validation automatically
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const rateCardService = new RateCardService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await rateCardService.createRateCardItem({
        ...validatedData,
        isActive: true,
        metadata: validatedData.metadata || {}
      });

      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create rate card item',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
