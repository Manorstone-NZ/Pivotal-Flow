/**
 * Portal Routes
 *
 * Customer portal API routes with strict security isolation
 */
import { portalAuth, portalRateLimit } from './rate-limiter.js';
import { PortalQuoteFiltersSchema, PortalInvoiceFiltersSchema, PortalTimeEntryFiltersSchema, PortalQuoteQuerySchema, PortalInvoiceQuerySchema, PortalTimeEntryQuerySchema, PortalQuoteListResponseSchema, PortalQuoteDetailSchema, PortalInvoiceListResponseSchema, PortalInvoiceDetailSchema, PortalTimeEntryListResponseSchema, PortalErrorResponseSchema } from './schemas.js';
import { PortalService } from './service.js';
/**
 * Register portal routes with security and rate limiting
 */
export async function portalRoutes(fastify) {
    // Apply portal authentication and rate limiting to all portal routes
    await fastify.register(async function portalScope(fastify) {
        // Add portal authentication hooks
        fastify.addHook('preHandler', portalAuth);
        fastify.addHook('preHandler', portalRateLimit);
        // GET /v1/portal/quotes - List customer quotes with filtering
        fastify.get('/v1/portal/quotes', {
            schema: {
                tags: ['Portal'],
                summary: 'List customer quotes',
                description: 'Get paginated list of quotes for authenticated customer with filtering options',
                security: [{ bearerAuth: [] }],
                querystring: PortalQuoteQuerySchema,
                response: {
                    200: PortalQuoteListResponseSchema,
                    400: PortalErrorResponseSchema,
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema,
                    500: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                const startTime = Date.now();
                // Validate and parse query parameters
                const parsedFilters = PortalQuoteFiltersSchema.parse(request.query);
                const filters = Object.fromEntries(Object.entries(parsedFilters).filter(([_, value]) => value !== undefined));
                // Create portal service
                const portalService = new PortalService(fastify.db, portalRequest.portalUser, fastify);
                // Get quotes
                const result = await portalService.getQuotes(filters);
                // Add performance headers
                const duration = Date.now() - startTime;
                reply.header('X-Response-Time', `${duration}ms`);
                reply.send(result);
            }
            catch (error) {
                fastify.log.error(error, 'Error listing portal quotes');
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // GET /v1/portal/quotes/:id - Get quote detail
        fastify.get('/v1/portal/quotes/:id', {
            schema: {
                tags: ['Portal'],
                summary: 'Get quote detail',
                description: 'Get detailed quote information including line items for authenticated customer',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' }
                    }
                },
                response: {
                    200: PortalQuoteDetailSchema,
                    400: PortalErrorResponseSchema,
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    404: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema,
                    500: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                const startTime = Date.now();
                const { id: quoteId } = request.params;
                // Create portal service
                const portalService = new PortalService(fastify.db, portalRequest.portalUser, fastify);
                // Get quote detail
                const quote = await portalService.getQuoteDetail(quoteId);
                // Add performance headers
                const duration = Date.now() - startTime;
                reply.header('X-Response-Time', `${duration}ms`);
                reply.send(quote);
            }
            catch (error) {
                fastify.log.error(error, 'Error getting portal quote detail');
                if (error instanceof Error && error.message === 'Quote not found') {
                    reply.status(404).send({
                        error: 'Not Found',
                        message: 'Quote not found'
                    });
                }
                else {
                    reply.status(500).send({
                        error: 'Internal Server Error',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        });
        // GET /v1/portal/invoices - List customer invoices with filtering
        fastify.get('/v1/portal/invoices', {
            schema: {
                tags: ['Portal'],
                summary: 'List customer invoices',
                description: 'Get paginated list of invoices for authenticated customer with filtering options',
                security: [{ bearerAuth: [] }],
                querystring: PortalInvoiceQuerySchema,
                response: {
                    200: PortalInvoiceListResponseSchema,
                    400: PortalErrorResponseSchema,
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema,
                    500: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                const startTime = Date.now();
                // Validate and parse query parameters
                const parsedFilters = PortalInvoiceFiltersSchema.parse(request.query);
                const filters = Object.fromEntries(Object.entries(parsedFilters).filter(([_, value]) => value !== undefined));
                // Create portal service
                const portalService = new PortalService(fastify.db, portalRequest.portalUser, fastify);
                // Get invoices
                const result = await portalService.getInvoices(filters);
                // Add performance headers
                const duration = Date.now() - startTime;
                reply.header('X-Response-Time', `${duration}ms`);
                reply.send(result);
            }
            catch (error) {
                fastify.log.error(error, 'Error listing portal invoices');
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // GET /v1/portal/invoices/:id - Get invoice detail
        fastify.get('/v1/portal/invoices/:id', {
            schema: {
                tags: ['Portal'],
                summary: 'Get invoice detail',
                description: 'Get detailed invoice information including line items for authenticated customer',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' }
                    }
                },
                response: {
                    200: PortalInvoiceDetailSchema,
                    400: PortalErrorResponseSchema,
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    404: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema,
                    500: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                const startTime = Date.now();
                const { id: invoiceId } = request.params;
                // Create portal service
                const portalService = new PortalService(fastify.db, portalRequest.portalUser, fastify);
                // Get invoice detail
                const invoice = await portalService.getInvoiceDetail(invoiceId);
                // Add performance headers
                const duration = Date.now() - startTime;
                reply.header('X-Response-Time', `${duration}ms`);
                reply.send(invoice);
            }
            catch (error) {
                fastify.log.error(error, 'Error getting portal invoice detail');
                if (error instanceof Error && error.message === 'Invoice not found') {
                    reply.status(404).send({
                        error: 'Not Found',
                        message: 'Invoice not found'
                    });
                }
                else {
                    reply.status(500).send({
                        error: 'Internal Server Error',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        });
        // GET /v1/portal/time - List approved time entries summary
        fastify.get('/v1/portal/time', {
            schema: {
                tags: ['Portal'],
                summary: 'List approved time entries',
                description: 'Get paginated summary of approved time entries for authenticated customer by project and month',
                security: [{ bearerAuth: [] }],
                querystring: PortalTimeEntryQuerySchema,
                response: {
                    200: PortalTimeEntryListResponseSchema,
                    400: PortalErrorResponseSchema,
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema,
                    500: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                const startTime = Date.now();
                // Validate and parse query parameters
                const parsedFilters = PortalTimeEntryFiltersSchema.parse(request.query);
                const filters = Object.fromEntries(Object.entries(parsedFilters).filter(([_, value]) => value !== undefined));
                // Create portal service
                const portalService = new PortalService(fastify.db, portalRequest.portalUser, fastify);
                // Get time entries (currently returns empty as time entries table doesn't exist)
                const result = await portalService.getTimeEntries(filters);
                // Add performance headers
                const duration = Date.now() - startTime;
                reply.header('X-Response-Time', `${duration}ms`);
                reply.send(result);
            }
            catch (error) {
                fastify.log.error(error, 'Error listing portal time entries');
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // Health check endpoint for portal (useful for monitoring)
        fastify.get('/v1/portal/health', {
            schema: {
                tags: ['Portal'],
                summary: 'Portal health check',
                description: 'Check portal service health and user access',
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            user: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'string' },
                                    customerId: { type: 'string' },
                                    organizationId: { type: 'string' }
                                }
                            },
                            timestamp: { type: 'string' }
                        }
                    },
                    401: PortalErrorResponseSchema,
                    403: PortalErrorResponseSchema,
                    429: PortalErrorResponseSchema
                }
            }
        }, async (request, reply) => {
            const portalRequest = request;
            try {
                reply.send({
                    status: 'healthy',
                    user: {
                        userId: portalRequest.portalUser.userId,
                        customerId: portalRequest.portalUser.customerId,
                        organizationId: portalRequest.portalUser.organizationId
                    },
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                fastify.log.error(error, 'Portal health check error');
                reply.status(500).send({
                    error: 'Internal Server Error',
                    message: 'Portal health check failed'
                });
            }
        });
    });
}
//# sourceMappingURL=routes.js.map