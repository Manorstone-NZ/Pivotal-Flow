import { logger } from '../../lib/logger.js';
import { QuoteStatusTransitionSchema } from './typeboxSchemas.js';
import { QuoteService } from './service.js';
/**
 * Register the status transition route
 */
export function registerStatusTransitionRoute(fastify) {
    fastify.post('/v1/quotes/:id/status', {
        schema: {
            body: QuoteStatusTransitionSchema
        }
    }, async (request, reply) => {
        try {
            // Get validated request body (TypeBox handles validation automatically)
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
            const quoteService = new QuoteService(fastify.db, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Transition status
            const quote = await quoteService.transitionStatus(id, validatedData);
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
                    return reply.status(400).send({
                        error: 'Not Found',
                        message: error.message,
                        code: 'QUOTE_NOT_FOUND'
                    });
                }
                if (error.message.includes('Invalid status transition')) {
                    return reply.status(409).send({
                        error: 'Conflict',
                        message: error.message,
                        code: 'INVALID_STATUS_TRANSITION'
                    });
                }
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'STATUS_TRANSITION_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in statusTransitionRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.status.js.map