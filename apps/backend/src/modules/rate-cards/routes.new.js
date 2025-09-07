import { Type } from '@sinclair/typebox';
import { RateCardService } from './service.js';
import { CreateRateCardSchema, UpdateRateCardSchema, CreateRateCardItemSchema, UpdateRateCardItemSchema, RateCardResponseSchema, RateCardItemResponseSchema, RateCardErrorSchema } from './typeboxSchemas.js';
export async function rateCardRoutes(fastify) {
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
            const rateCardService = new RateCardService(fastify.db, {
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
            const rateCardService = new RateCardService(fastify.db, {
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
}
//# sourceMappingURL=routes.new.js.map