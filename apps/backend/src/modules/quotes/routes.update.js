import { logger } from '../../lib/logger.js';
import { UpdateQuoteSchema } from './typeboxSchemas.js';
import { QuoteService } from './service.js';
/**
 * Register the update quote route
 */
export function registerUpdateQuoteRoute(fastify) {
    fastify.patch('/v1/quotes/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },
            body: UpdateQuoteSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        clientId: { type: 'string' },
                        title: { type: 'string' },
                        status: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                403: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            // TypeBox handles validation automatically, so request.body is already validated
            const validatedData = request.body;
            // Get user context
            const user = request.user;
            if (!user) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Authentication required',
                    code: 'TENANT_ACCESS_DENIED'
                });
            }
            const { id } = request.params;
            // Create quote service
            const quoteService = new QuoteService({
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Update quote
            const quote = await quoteService.updateQuote(id, validatedData);
            return reply.status(200).send(quote);
        }
        catch (error) {
            // Handle validation errors
            if (error instanceof Error && error.message.includes('validation')) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR'
                });
            }
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: error.message,
                        code: 'QUOTE_NOT_FOUND'
                    });
                }
                if (error.message.includes('cannot be updated')) {
                    return reply.status(409).send({
                        error: 'Conflict',
                        message: error.message,
                        code: 'QUOTE_UPDATE_CONFLICT'
                    });
                }
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_UPDATE_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in updateQuoteRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.update.js.map