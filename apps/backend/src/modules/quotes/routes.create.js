import { z } from 'zod';
import { logger } from '../../lib/logger.js';
import { CreateQuoteSchema } from './schemas.js';
import { QuoteService } from './service.js';
/**
 * Register the create quote route
 */
export function registerCreateQuoteRoute(fastify) {
    fastify.post('/v1/quotes', async (request, reply) => {
        try {
            // Validate request body
            const validatedData = CreateQuoteSchema.parse(request.body);
            // Get user context
            const user = request.user;
            if (!user) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Authentication required',
                    code: 'TENANT_ACCESS_DENIED'
                });
            }
            // Create quote service
            const quoteService = new QuoteService(fastify.db, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Create quote
            const quote = await quoteService.createQuote(validatedData);
            return reply.status(201).send(quote);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                });
            }
            if (error instanceof Error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_CREATION_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in createQuoteRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
    // Debug route for quote calculation
    fastify.post('/v1/quotes/debug', async (request, reply) => {
        try {
            // Validate request body
            const validatedData = CreateQuoteSchema.parse(request.body);
            // Get user context
            const user = request.user;
            if (!user) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Authentication required',
                    code: 'TENANT_ACCESS_DENIED'
                });
            }
            // Create quote service
            const quoteService = new QuoteService(fastify.db, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Calculate quote with debug information
            const debugResult = await quoteService.calculateQuoteDebug(validatedData);
            return reply.status(200).send(debugResult);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                });
            }
            if (error instanceof Error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_DEBUG_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in debugQuoteRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.create.js.map