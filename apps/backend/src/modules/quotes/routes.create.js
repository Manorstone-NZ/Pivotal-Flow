import { Type } from '@sinclair/typebox';
import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';
// Import schemas from shared typeboxSchemas
import { CreateQuoteSchema, QuoteResponseSchema } from './typeboxSchemas.js';
export async function createQuoteRoute(fastify) {
    fastify.post('/v1/quotes', {
        schema: {
            body: CreateQuoteSchema,
            response: {
                201: QuoteResponseSchema,
                400: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String(),
                    details: Type.Optional(Type.Any())
                }),
                401: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                }),
                500: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        try {
            const quoteData = request.body; // TypeBox handles validation automatically
            const authenticatedRequest = request;
            // Get user context
            const user = authenticatedRequest.user;
            if (!user) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Authentication required',
                    code: 'TENANT_ACCESS_DENIED'
                });
            }
            // Create quote service
            const quoteService = new QuoteService({
                organizationId: user.organizationId,
                userId: user.userId
            });
            const result = await quoteService.createQuote({
                ...quoteData,
                metadata: quoteData.metadata || {}
            });
            logger.info('Quote created successfully', { quoteId: result.id });
            return reply.status(201).send(result);
        }
        catch (error) {
            if (error instanceof Error) {
                logger.error('Error creating quote:', error);
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
}
//# sourceMappingURL=routes.create.js.map