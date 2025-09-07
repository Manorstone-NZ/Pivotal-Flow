import { Type } from '@sinclair/typebox';
import { QuoteService } from './service.js';
import { CreateQuoteSchema, UpdateQuoteSchema, QuoteResponseSchema, QuoteErrorSchema } from './typeboxSchemas.js';
export async function quoteRoutes(fastify) {
    // Create a new quote
    fastify.post('/quotes', {
        schema: {
            body: CreateQuoteSchema,
            response: {
                201: QuoteResponseSchema,
                400: QuoteErrorSchema,
                401: QuoteErrorSchema,
                403: QuoteErrorSchema,
                500: QuoteErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const validatedData = request.body; // TypeBox handles validation automatically
            const authenticatedRequest = request;
            const quoteService = new QuoteService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await quoteService.createQuote({
                ...validatedData,
                metadata: validatedData.metadata || {}
            });
            return reply.status(201).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to create quote',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Get all quotes
    fastify.get('/quotes', {
        schema: {
            response: {
                200: Type.Array(QuoteResponseSchema),
                401: QuoteErrorSchema,
                403: QuoteErrorSchema,
                500: QuoteErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const quoteService = new QuoteService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await quoteService.getAllQuotes();
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get quotes',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Get quote by ID
    fastify.get('/quotes/:id', {
        schema: {
            params: Type.Object({
                id: Type.String()
            }),
            response: {
                200: QuoteResponseSchema,
                401: QuoteErrorSchema,
                403: QuoteErrorSchema,
                404: QuoteErrorSchema,
                500: QuoteErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const quoteService = new QuoteService(fastify.db, {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            });
            const result = await quoteService.getQuoteById(request.params.id);
            if (!result) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Quote not found',
                    code: 'QUOTE_NOT_FOUND'
                });
            }
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to get quote',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.new.js.map