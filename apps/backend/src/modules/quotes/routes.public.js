/**
 * Public Quote Routes - SaaS Multi-Tenant
 * Customer-facing quote approval with tenant isolation
 */
import { Type } from '@sinclair/typebox';
import { eq } from 'drizzle-orm';
import { quotes, customers, organizations } from '../../lib/schema.js';
import { QuoteDeliveryService } from './delivery.service.js';
// TypeBox schemas for public API
const PublicQuoteResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Object({
        id: Type.String(),
        quoteNumber: Type.String(),
        title: Type.String(),
        description: Type.Optional(Type.String()),
        status: Type.String(),
        validFrom: Type.String({ format: 'date' }),
        validUntil: Type.String({ format: 'date' }),
        currency: Type.String(),
        subtotal: Type.Number(),
        taxRate: Type.Number(),
        taxAmount: Type.Number(),
        discountAmount: Type.Number(),
        totalAmount: Type.Number(),
        termsConditions: Type.Optional(Type.String()),
        notes: Type.Optional(Type.String()),
        // Organization branding for SaaS
        organization: Type.Object({
            name: Type.String(),
            industry: Type.Optional(Type.String()),
            timezone: Type.String(),
            currency: Type.String()
        }),
        // Customer context
        customer: Type.Object({
            companyName: Type.String(),
            email: Type.Optional(Type.String())
        }),
        // Line items would be included here in full implementation
        lineItems: Type.Array(Type.Object({
            description: Type.String(),
            quantity: Type.Number(),
            unitPrice: Type.Number(),
            totalPrice: Type.Number()
        }))
    })
});
const AcceptQuoteSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 100 }),
    role: Type.String({ minLength: 2, maxLength: 100 }),
    checkedTerms: Type.Boolean()
});
const RejectQuoteSchema = Type.Object({
    reason: Type.String({ minLength: 10, maxLength: 500 })
});
const PublicActionResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    timestamp: Type.String({ format: 'date-time' })
});
const ErrorResponseSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
/**
 * Validate token and get quote with tenant isolation
 */
async function validateTokenAndGetQuote(fastify, token) {
    const db = fastify.db;
    // Validate token format
    const tokenValidation = QuoteDeliveryService.validatePublicToken(token);
    if (!tokenValidation.isValid) {
        throw new Error('Invalid or expired token');
    }
    // Get quote by token with tenant validation
    const quoteResult = await db
        .select({
        quote: quotes,
        customer: customers,
        organization: organizations
    })
        .from(quotes)
        .innerJoin(customers, eq(quotes.customerId, customers.id))
        .innerJoin(organizations, eq(quotes.organizationId, organizations.id))
        .where(eq(quotes.publicToken, token))
        .limit(1);
    if (!quoteResult || quoteResult.length === 0) {
        throw new Error('Quote not found');
    }
    const { quote, customer, organization } = quoteResult[0];
    // Verify token hasn't expired
    if (quote.tokenExpiresAt && new Date() > quote.tokenExpiresAt) {
        throw new Error('Quote link has expired');
    }
    // Verify quote is still valid
    if (quote.validUntil && new Date() > new Date(quote.validUntil)) {
        // Auto-expire the quote
        await db
            .update(quotes)
            .set({
            status: 'expired',
            updatedAt: new Date()
        })
            .where(eq(quotes.id, quote.id));
        throw new Error('Quote has expired');
    }
    // Validate tenant context via token hash
    const isValidTenant = QuoteDeliveryService.getOrganizationFromTokenHash(tokenValidation.organizationHash, organization.id);
    if (!isValidTenant) {
        throw new Error('Invalid token for organization');
    }
    return { quote, customer, organization };
}
/**
 * Register public quote routes (no authentication required)
 */
export function registerPublicQuoteRoutes(fastify) {
    // Get public quote for customer viewing
    fastify.get('/public/quotes/:token', {
        schema: {
            params: Type.Object({
                token: Type.String({ description: 'Secure public token' })
            }),
            response: {
                200: PublicQuoteResponseSchema,
                400: ErrorResponseSchema,
                404: ErrorResponseSchema,
                410: ErrorResponseSchema, // Gone - expired
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { token } = request.params;
            const db = fastify.db;
            // Validate token and get quote with tenant isolation
            const { quote, customer, organization } = await validateTokenAndGetQuote(fastify, token);
            // Track quote view (first time only)
            if (!quote.viewedAt && quote.status === 'sent') {
                await db
                    .update(quotes)
                    .set({
                    status: 'viewed',
                    viewedAt: new Date(),
                    updatedAt: new Date()
                })
                    .where(eq(quotes.id, quote.id));
                // Log view for analytics
                fastify.log.info({
                    audit: {
                        action: 'quote.viewed',
                        organizationId: organization.id,
                        quoteId: quote.id,
                        customerEmail: customer.email,
                        viewedAt: new Date(),
                    }
                }, 'Quote viewed by customer');
            }
            // Return quote data with organization branding
            return reply.status(200).send({
                success: true,
                data: {
                    id: quote.id,
                    quoteNumber: quote.quoteNumber,
                    title: quote.title,
                    description: quote.description,
                    status: quote.status,
                    validFrom: quote.validFrom,
                    validUntil: quote.validUntil,
                    currency: quote.currency,
                    subtotal: parseFloat(quote.subtotal),
                    taxRate: parseFloat(quote.taxRate),
                    taxAmount: parseFloat(quote.taxAmount),
                    discountAmount: parseFloat(quote.discountAmount),
                    totalAmount: parseFloat(quote.totalAmount),
                    termsConditions: quote.termsConditions,
                    notes: quote.notes,
                    // SaaS organization branding
                    organization: {
                        name: organization.name,
                        industry: organization.industry,
                        timezone: organization.timezone,
                        currency: organization.currency
                    },
                    customer: {
                        companyName: customer.companyName,
                        email: customer.email
                    },
                    // Placeholder for line items (would be populated from quote_line_items table)
                    lineItems: []
                }
            });
        }
        catch (error) {
            fastify.log.warn({
                error: error instanceof Error ? error.message : 'Unknown error',
                token: request.params.token.substring(0, 16) + '...',
                route: '/public/quotes/:token'
            }, 'Public quote access failed');
            if (error instanceof Error) {
                if (error.message.includes('expired')) {
                    return reply.status(410).send({
                        error: 'Gone',
                        message: 'Quote has expired',
                        code: 'QUOTE_EXPIRED'
                    });
                }
                if (error.message.includes('not found') || error.message.includes('Invalid')) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Quote not found or invalid token',
                        code: 'QUOTE_NOT_FOUND'
                    });
                }
            }
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to load quote',
                code: 'LOAD_FAILED'
            });
        }
    });
    // Accept quote (customer approval)
    fastify.post('/public/quotes/:token/accept', {
        schema: {
            params: Type.Object({
                token: Type.String({ description: 'Secure public token' })
            }),
            body: AcceptQuoteSchema,
            response: {
                200: PublicActionResponseSchema,
                400: ErrorResponseSchema,
                404: ErrorResponseSchema,
                409: ErrorResponseSchema, // Conflict - already processed
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { token } = request.params;
            const { name, role, checkedTerms } = request.body;
            const db = fastify.db;
            // Validate required terms acceptance
            if (!checkedTerms) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Terms and conditions must be accepted',
                    code: 'TERMS_NOT_ACCEPTED'
                });
            }
            // Validate token and get quote
            const { quote, organization } = await validateTokenAndGetQuote(fastify, token);
            // Check quote can be accepted
            if (!['sent', 'viewed'].includes(quote.status)) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: `Quote cannot be accepted from status: ${quote.status}`,
                    code: 'INVALID_STATUS'
                });
            }
            const acceptedAt = new Date();
            // Update quote status to accepted
            await db
                .update(quotes)
                .set({
                status: 'accepted',
                acceptedAt,
                updatedAt: acceptedAt,
                // Store approval details in metadata for SaaS audit
                metadata: {
                    ...quote.metadata,
                    customerApproval: {
                        name,
                        role,
                        acceptedAt: acceptedAt.toISOString(),
                        ipAddress: request.ip,
                        userAgent: request.headers['user-agent']
                    }
                }
            })
                .where(eq(quotes.id, quote.id));
            // Log acceptance for SaaS audit trail
            fastify.log.info({
                audit: {
                    action: 'quote.accepted',
                    organizationId: organization.id,
                    quoteId: quote.id,
                    customerName: name,
                    customerRole: role,
                    acceptedAt,
                    ipAddress: request.ip,
                }
            }, 'Quote accepted by customer');
            return reply.status(200).send({
                success: true,
                message: 'Quote accepted successfully',
                timestamp: acceptedAt.toISOString()
            });
        }
        catch (error) {
            fastify.log.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                token: request.params.token.substring(0, 16) + '...',
                route: '/public/quotes/:token/accept'
            }, 'Quote acceptance failed');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to accept quote',
                code: 'ACCEPT_FAILED'
            });
        }
    });
    // Reject quote (customer decline)
    fastify.post('/public/quotes/:token/reject', {
        schema: {
            params: Type.Object({
                token: Type.String({ description: 'Secure public token' })
            }),
            body: RejectQuoteSchema,
            response: {
                200: PublicActionResponseSchema,
                400: ErrorResponseSchema,
                404: ErrorResponseSchema,
                409: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { token } = request.params;
            const { reason } = request.body;
            const db = fastify.db;
            // Validate token and get quote
            const { quote, organization } = await validateTokenAndGetQuote(fastify, token);
            // Check quote can be rejected
            if (!['sent', 'viewed'].includes(quote.status)) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: `Quote cannot be rejected from status: ${quote.status}`,
                    code: 'INVALID_STATUS'
                });
            }
            const rejectedAt = new Date();
            // Update quote status to rejected
            await db
                .update(quotes)
                .set({
                status: 'rejected',
                updatedAt: rejectedAt,
                // Store rejection details in metadata for SaaS audit
                metadata: {
                    ...quote.metadata,
                    customerRejection: {
                        reason,
                        rejectedAt: rejectedAt.toISOString(),
                        ipAddress: request.ip,
                        userAgent: request.headers['user-agent']
                    }
                }
            })
                .where(eq(quotes.id, quote.id));
            // Log rejection for SaaS audit trail
            fastify.log.info({
                audit: {
                    action: 'quote.rejected',
                    organizationId: organization.id,
                    quoteId: quote.id,
                    reason,
                    rejectedAt,
                    ipAddress: request.ip,
                }
            }, 'Quote rejected by customer');
            return reply.status(200).send({
                success: true,
                message: 'Quote rejected successfully',
                timestamp: rejectedAt.toISOString()
            });
        }
        catch (error) {
            fastify.log.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                token: request.params.token.substring(0, 16) + '...',
                route: '/public/quotes/:token/reject'
            }, 'Quote rejection failed');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to reject quote',
                code: 'REJECT_FAILED'
            });
        }
    });
}
//# sourceMappingURL=routes.public.js.map