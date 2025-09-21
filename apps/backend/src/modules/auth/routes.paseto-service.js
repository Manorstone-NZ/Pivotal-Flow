/**
 * PASETO v4.public Service-to-Service Authentication Routes
 * For internal service authentication and signed public links
 * Users should use opaque tokens via /login-opaque
 */
import { Type } from '@sinclair/typebox';
import { PasetoPublicService } from '../../services/paseto-v4-public.js';
import { logger } from '../../lib/logger.js';
// TypeBox schemas
const ServiceTokenRequestSchema = Type.Object({
    serviceId: Type.String(),
    tenantId: Type.String(),
    scopes: Type.Array(Type.String()),
    purpose: Type.Optional(Type.String()),
    resource: Type.Optional(Type.String()) // For quote-delivery and invoice-access tokens
});
const VerifyTokenRequestSchema = Type.Object({
    token: Type.String(),
    consumeToken: Type.Optional(Type.Boolean()) // Default true for one-time use
});
/**
 * PASETO v4.public Service Routes
 * For service-to-service authentication and signed links
 */
export const pasetoServiceRoutes = async (fastify) => {
    const pasetoService = new PasetoPublicService(fastify);
    // Generate service-to-service token
    fastify.post("/service-token", {
        schema: {
            body: ServiceTokenRequestSchema
        }
    }, async (request, reply) => {
        const { serviceId, tenantId, scopes, purpose = 'service-auth' } = request.body;
        try {
            // This endpoint should be protected by service credentials in production
            logger.info({
                serviceId,
                tenantId,
                scopes,
                purpose
            }, 'Generating PASETO service token');
            let token;
            let expiresIn;
            switch (purpose) {
                case 'service-auth':
                    token = await pasetoService.generateServiceToken(serviceId, tenantId, scopes);
                    expiresIn = 300; // 5 minutes
                    break;
                case 'quote-delivery':
                    if (!request.body.resource) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'resource (quoteId) required for quote-delivery tokens'
                        });
                    }
                    token = await pasetoService.generateQuoteDeliveryToken(request.body.resource, tenantId, serviceId);
                    expiresIn = 900; // 15 minutes
                    break;
                case 'invoice-access':
                    if (!request.body.resource) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'resource (invoiceId) required for invoice-access tokens'
                        });
                    }
                    token = await pasetoService.generateInvoiceAccessToken(request.body.resource, tenantId, serviceId);
                    expiresIn = 600; // 10 minutes
                    break;
                default:
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: `Unknown token purpose: ${purpose}`
                    });
            }
            return reply.status(200).send({
                success: true,
                token,
                expiresIn,
                purpose
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id,
                serviceId,
                tenantId
            }, 'PASETO service token generation error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Token generation failed",
                code: "PASETO_SERVICE_TOKEN_ERROR"
            });
        }
    });
    // Verify and consume PASETO token (one-time use by default)
    fastify.post("/verify-token", {
        schema: {
            body: VerifyTokenRequestSchema
        }
    }, async (request, reply) => {
        const { token, consumeToken = true } = request.body;
        try {
            let payload;
            if (consumeToken) {
                // Verify and consume (one-time use)
                payload = await pasetoService.verifyAndConsumeToken(token);
            }
            else {
                // Verify without consuming (read-only)
                payload = await pasetoService.verifyTokenReadOnly(token);
            }
            logger.debug({
                jti: payload.jti,
                purpose: payload.purpose,
                consumed: consumeToken
            }, 'PASETO token verified');
            return reply.status(200).send({
                success: true,
                payload: {
                    sub: payload.sub,
                    org: payload.org,
                    scope: payload.scope,
                    purpose: payload.purpose,
                    exp: payload.exp,
                    jti: payload.jti,
                    resource: payload.resource,
                    resourceType: payload.resourceType
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id
            }, 'PASETO token verification error');
            return reply.status(401).send({
                error: "Unauthorized",
                message: error instanceof Error ? error.message : "Invalid or expired token",
                code: "PASETO_VERIFY_ERROR"
            });
        }
    });
    // Generate quote delivery link (public endpoint for quote delivery)
    fastify.post("/quote-delivery-token", {
        schema: {
            body: Type.Object({
                quoteId: Type.String(),
                tenantId: Type.String(),
                userId: Type.String()
            })
        }
    }, async (request, reply) => {
        const { quoteId, tenantId, userId } = request.body;
        try {
            // This should be protected by proper auth in production
            const token = await pasetoService.generateQuoteDeliveryToken(quoteId, tenantId, userId);
            logger.info({
                quoteId,
                tenantId,
                userId,
                request_id: request.id
            }, 'Quote delivery token generated');
            return reply.status(200).send({
                success: true,
                token,
                expiresIn: 900, // 15 minutes
                purpose: 'quote-delivery',
                publicUrl: `${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/public/quotes/${token}`
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id,
                quoteId,
                tenantId
            }, 'Quote delivery token generation error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Quote delivery token generation failed",
                code: "QUOTE_DELIVERY_TOKEN_ERROR"
            });
        }
    });
};
//# sourceMappingURL=routes.paseto-service.js.map