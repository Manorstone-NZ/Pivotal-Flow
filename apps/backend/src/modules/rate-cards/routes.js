import { Type } from '@sinclair/typebox';
import { RateCardService } from './service.js';
import { CreateRateCardSchema, CreateRateCardItemSchema, UpdateRateCardItemSchema, RateCardResponseSchema, RateCardItemResponseSchema, RateCardErrorSchema } from './typeboxSchemas.js';
export async function rateCardRoutes(fastify) {
    // Add authentication middleware to all routes
    fastify.addHook('preHandler', fastify.authenticate);
    // Create a new rate card
    fastify.post('/rate-cards', {
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
    }, async (request, reply) => {
        try {
            const validatedData = request.body; // TypeBox handles validation automatically
            const authenticatedRequest = request;
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
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create rate card',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Get all rate cards
    fastify.get('/rate-cards', {
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
            const authenticatedRequest = request;
            const rateCardService = new RateCardService({
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await rateCardService.getAllRateCards();
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get rate cards',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Get a specific rate card by ID
    fastify.get('/rate-cards/:id', {
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
            const { id } = request.params;
            const authenticatedRequest = request;
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
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get rate card',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Update a specific rate card
    fastify.put('/rate-cards/:id', {
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
            const { id } = request.params;
            const updateData = request.body;
            const authenticatedRequest = request;
            const rateCardService = new RateCardService({
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await rateCardService.updateRateCard(id, updateData);
            if (!result) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Rate card not found',
                    code: 'RATE_CARD_NOT_FOUND'
                });
            }
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update rate card',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Get rate card items for a specific rate card
    fastify.get('/rate-cards/:id/items', {
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
            const { id } = request.params;
            const authenticatedRequest = request;
            const rateCardService = new RateCardService({
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await rateCardService.getRateCardItems(id);
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get rate card items',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Create a new rate card item for a specific rate card
    fastify.post('/rate-cards/:id/items', {
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
            const { id } = request.params;
            const validatedData = request.body; // TypeBox handles validation automatically
            const authenticatedRequest = request;
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
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create rate card item',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Create a new rate card item
    fastify.post('/rate-cards/items', {
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
            const validatedData = request.body; // TypeBox handles validation automatically
            const authenticatedRequest = request;
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
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create rate card item',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Update a rate card item by ID
    fastify.put('/rate-card-items/:itemId', {
        schema: {
            body: UpdateRateCardItemSchema,
            response: {
                200: RateCardItemResponseSchema,
                404: RateCardErrorSchema,
                401: RateCardErrorSchema,
                403: RateCardErrorSchema,
                500: RateCardErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const { itemId } = request.params;
            const updateData = request.body;
            const authenticatedRequest = request;
            const rateCardService = new RateCardService({
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await rateCardService.updateRateCardItem(itemId, updateData);
            if (!result) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Rate card item not found',
                    code: 'RATE_CARD_ITEM_NOT_FOUND'
                });
            }
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to update rate card item',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map