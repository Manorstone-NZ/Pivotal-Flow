/**
 * Quote Delivery Routes - SaaS Multi-Tenant
 * Handles quote delivery with proper tenant isolation
 */
import { Type } from '@sinclair/typebox';
import { QuoteDeliveryService } from './delivery.service.js';
// TypeBox schemas for SaaS delivery API
const DeliveryRequestSchema = Type.Object({
    recipientEmail: Type.Optional(Type.String({ format: 'email' })),
    customMessage: Type.Optional(Type.String({ maxLength: 500 })),
    expirationDays: Type.Optional(Type.Number({ minimum: 1, maximum: 30 }))
});
const DeliveryResponseSchema = Type.Object({
    success: Type.Boolean(),
    publicUrl: Type.String(),
    token: Type.String(),
    deliveredAt: Type.String({ format: 'date-time' }),
    expiresAt: Type.String({ format: 'date-time' }),
    message: Type.Optional(Type.String())
});
const ErrorResponseSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
/**
 * Register quote delivery route with SaaS multi-tenancy
 */
export function registerQuoteDeliveryRoute(fastify) {
    fastify.post('/v1/quotes/:id/deliver', {
        schema: {
            params: Type.Object({
                id: Type.String({ description: 'Quote ID' })
            }),
            body: DeliveryRequestSchema,
            response: {
                200: DeliveryResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: quoteId } = request.params;
            const deliveryOptions = request.body;
            if (!user) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }
            // Create delivery service with tenant context
            const deliveryService = new QuoteDeliveryService(fastify, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Deliver quote with SaaS tenant isolation
            const result = await deliveryService.deliverQuote(quoteId, deliveryOptions);
            return reply.status(200).send({
                success: result.success,
                publicUrl: result.publicUrl,
                token: result.token,
                deliveredAt: result.deliveredAt.toISOString(),
                expiresAt: result.expiresAt.toISOString(),
                message: result.message
            });
        }
        catch (error) {
            fastify.log.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                route: '/v1/quotes/:id/deliver',
                quoteId: request.params.id,
                userId: request.user?.userId,
                organizationId: request.user?.organizationId,
            }, 'Quote delivery failed');
            if (error instanceof Error) {
                if (error.message.includes('not found') || error.message.includes('access denied')) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Quote not found or access denied',
                        code: 'QUOTE_NOT_FOUND'
                    });
                }
                if (error.message.includes('cannot be delivered')) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: error.message,
                        code: 'INVALID_QUOTE_STATUS'
                    });
                }
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to deliver quote',
                code: 'DELIVERY_FAILED'
            });
        }
    });
}
//# sourceMappingURL=routes.delivery.js.map