import 'dotenv/config';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { register, collectDefaultMetrics } from 'prom-client';
import { config } from './config/index.js';
// C0 Backend Readiness imports
import { filesModule } from './files/index.js';
import { accessControlMiddleware, tenancyMiddleware, requestContextMiddleware } from './lib/access-control.js';
import { getCorsConfig, securityHeadersMiddleware } from './lib/cors-rate-limit.js';
import { globalErrorHandler, requestIdMiddleware, requestLoggingMiddleware } from './lib/error-handler.js';
import { createIdempotencyMiddleware } from './lib/idempotency.js';
import { logger } from './lib/logger.js';
import { requestLoggingMiddleware as observabilityRequestLogging, metricsEndpointMiddleware, healthCheckMiddleware } from './lib/observability.js';
import { openApiSchema } from './lib/openapi-schema.js';
// Test auth route removed - no longer needed
import { allocationModule } from './modules/allocations/index.js';
import { approvalModule } from './modules/approvals/index.js';
import { authPlugin, loginRoute, refreshRoute, logoutRoute, meRoute } from './modules/auth/index.js';
import { listUsersRoute, createUserRoute, getUserRoute, updateUserRoute, assignRoleRoute, removeRoleRoute, updateUserStatusRoute } from './modules/users/index.js';
import { registerQuoteRoutes } from './modules/quotes/index.js';
import { rateCardRoutes } from './modules/rate-cards/index.js';
import { permissionRoutes } from './modules/permissions/index.js';
import { currencyRoutes } from './modules/currencies/routes.js';
import { paymentRoutes } from './modules/payments/routes.js';
import { portalModule } from './modules/portal/index.js';
import { reportsModule } from './modules/reports/index.js';
import { jobsModule } from './modules/jobs/index.js';
import { referenceDataModule } from './modules/reference-data/index.js';
import { xeroIntegrationModule } from './modules/integrations/xero/index.js';
import { cachePlugin } from './plugins/cache.plugin.js';
import { cacheHeadersPlugin } from './plugins/cache-headers.js';
import databasePlugin from './plugins/database.js';
import { idempotencyPlugin } from './plugins/idempotency.js';
import openapiPlugin from './plugins/openapi.js';
import { payloadGuardPlugin } from './plugins/payloadGuard.js';
import { metricsRoutes } from './routes/metrics.js';
import { performanceRoutes } from './routes/perf.js';
// Enable default metrics collection (once per process)
const g = globalThis;
if (!g.__metricsInit) {
    try {
        collectDefaultMetrics({ register });
        g.__metricsInit = true;
    }
    catch (error) {
        // Metrics already registered, continue
        logger.warn('Default metrics already registered, skipping');
    }
}
const app = Fastify({
    logger: {
        level: 'info',
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }),
            res: (res) => ({
                statusCode: res.statusCode
            })
        }
    },
    trustProxy: true,
    genReqId: () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
});
async function registerPlugins() {
    // C0 Backend Readiness - Global error handler
    app.setErrorHandler(globalErrorHandler);
    // C0 Backend Readiness - Request ID and logging middleware
    app.addHook('preHandler', requestIdMiddleware);
    app.addHook('preHandler', requestLoggingMiddleware);
    app.addHook('preHandler', observabilityRequestLogging);
    // C0 Backend Readiness - CORS configuration
    const corsConfig = getCorsConfig();
    await app.register(cors, corsConfig);
    // C0 Backend Readiness - Security headers
    await app.register(helmet, {
        contentSecurityPolicy: false, // ok for development
    });
    // C0 Backend Readiness - Rate limiting with per-route configuration
    await app.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        allowList: ['127.0.0.1', '::1'],
        keyGenerator: (request) => (request).user?.sub || request.ip,
        errorResponseBuilder: (request, context) => ({
            error: {
                code: 'RATE_LIMIT_ERROR',
                message: 'Rate limit exceeded',
                details: {
                    limit: context.max,
                    remaining: context.remaining,
                    reset: context.resetTime
                },
                timestamp: new Date().toISOString(),
                request_id: request.id
            },
            meta: {
                api_version: '1.0.0',
                documentation_url: 'https://api.pivotalflow.com/docs'
            }
        })
    });
    // Database plugin (register early for database access)
    await app.register(databasePlugin);
    // Cache plugin (Redis integration)
    const cacheOptions = {
        host: 'localhost', // Default host
        port: 6379, // Default port
        db: 0, // Default db
        keyPrefix: 'pivotal-flow:',
        ttl: 300, // 5 minutes default
        enabled: true // Default enabled
    };
    // Parse Redis URL if available
    if (config.redis.REDIS_URL) {
        const redisUrl = new URL(config.redis.REDIS_URL);
        cacheOptions.host = redisUrl.hostname;
        cacheOptions.port = parseInt(redisUrl.port) || 6379;
        cacheOptions.password = redisUrl.password;
    }
    await app.register(cachePlugin, cacheOptions);
    // C0 Backend Readiness - Access control middleware
    app.addHook('preHandler', accessControlMiddleware);
    app.addHook('preHandler', tenancyMiddleware);
    app.addHook('preHandler', requestContextMiddleware);
    // C0 Backend Readiness - Security headers middleware
    app.addHook('onRequest', securityHeadersMiddleware);
    // C0 Backend Readiness - Idempotency middleware
    const idempotencyMiddleware = createIdempotencyMiddleware();
    app.addHook('preHandler', idempotencyMiddleware);
    // Register payload guard plugin (enforces JSONB rules)
    await app.register(payloadGuardPlugin);
    // Register idempotency plugin (enables safe and repeatable writes)
    await app.register(idempotencyPlugin);
    // D3 Contract Stability - Cache headers
    await app.register(cacheHeadersPlugin);
    // C0 Backend Readiness - OpenAPI documentation
    app.get('/api/openapi.json', {
        preHandler: [],
        config: {
            // @ts-ignore - skipAuth is a custom property
            skipAuth: true
        }
    }, async () => {
        return openApiSchema;
    });
    // C0 Backend Readiness - Health check endpoint
    app.get('/health', {
        preHandler: [],
        config: {
            // @ts-ignore - skipAuth is a custom property
            skipAuth: true
        }
    }, healthCheckMiddleware);
    // C0 Backend Readiness - Metrics endpoint
    app.get('/metrics', {
        preHandler: [],
        config: {
            // @ts-ignore - skipAuth is a custom property
            skipAuth: true
        }
    }, metricsEndpointMiddleware);
    // Override the Swagger UI to serve our manual OpenAPI documentation
    app.get('/api/docs', {
        preHandler: [],
        config: {
            skipAuth: true
        }
    }, async (_, reply) => {
        const openApiSpec = {
            openapi: '3.0.0',
            info: {
                title: 'Pivotal Flow API',
                description: 'Business Management Platform API - Complete endpoint documentation',
                version: '0.1.0',
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
                schemas: {
                    Quote: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            quoteNumber: { type: 'string' },
                            customerId: { type: 'string', format: 'uuid' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            status: {
                                type: 'string',
                                enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled']
                            },
                            validFrom: { type: 'string', format: 'date-time' },
                            validUntil: { type: 'string', format: 'date-time' },
                            totalAmount: { type: 'number' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    },
                    CreateQuoteRequest: {
                        type: 'object',
                        required: ['customerId', 'title', 'validFrom', 'validUntil'],
                        properties: {
                            customerId: { type: 'string', format: 'uuid' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            validFrom: { type: 'string', format: 'date-time' },
                            validUntil: { type: 'string', format: 'date-time' }
                        }
                    },
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    },
                    RateCard: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            currency: { type: 'string', minLength: 3, maxLength: 3 },
                            effectiveFrom: { type: 'string', format: 'date' },
                            effectiveUntil: { type: 'string', format: 'date' },
                            isDefault: { type: 'boolean' },
                            isActive: { type: 'boolean' }
                        }
                    },
                    Currency: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', minLength: 3, maxLength: 3 },
                            name: { type: 'string' },
                            symbol: { type: 'string' },
                            isActive: { type: 'boolean' }
                        }
                    },
                    Payment: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            invoiceId: { type: 'string' },
                            amount: { type: 'number' },
                            currency: { type: 'string', minLength: 3, maxLength: 3 },
                            method: { type: 'string' },
                            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'voided'] },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
            paths: {
                // Quote Management
                '/v1/quotes': {
                    get: {
                        tags: ['quotes'],
                        summary: 'List quotes',
                        description: 'Retrieve a paginated list of quotes with optional filtering and sorting.',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'page',
                                in: 'query',
                                schema: { type: 'integer', minimum: 1, default: 1 },
                                description: 'Page number'
                            },
                            {
                                name: 'pageSize',
                                in: 'query',
                                schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                                description: 'Page size'
                            },
                            {
                                name: 'status',
                                in: 'query',
                                schema: {
                                    type: 'string',
                                    enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled']
                                },
                                description: 'Filter by status'
                            }
                        ],
                        responses: {
                            200: {
                                description: 'List of quotes',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                quotes: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/Quote' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ['quotes'],
                        summary: 'Create a new quote',
                        description: 'Create a new quote with status "draft"',
                        security: [{ bearerAuth: [] }],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/CreateQuoteRequest' }
                                }
                            }
                        },
                        responses: {
                            201: {
                                description: 'Quote created successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Quote' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/quotes/{id}': {
                    get: {
                        tags: ['quotes'],
                        summary: 'Get quote by ID',
                        description: 'Retrieve a specific quote by its ID',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Quote ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Quote details',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Quote' }
                                    }
                                }
                            }
                        }
                    },
                    patch: {
                        tags: ['quotes'],
                        summary: 'Update quote',
                        description: 'Update a quote (draft status only)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Quote ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Quote updated successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Quote' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/quotes/{id}/status': {
                    post: {
                        tags: ['quotes'],
                        summary: 'Transition quote status',
                        description: 'Transition quote status (draft→pending→approved→sent→accepted)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Quote ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Quote status updated successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Quote' }
                                    }
                                }
                            }
                        }
                    }
                },
                // User Management
                '/v1/users': {
                    get: {
                        tags: ['users'],
                        summary: 'List users',
                        description: 'Retrieve a paginated list of users',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'page',
                                in: 'query',
                                schema: { type: 'integer', minimum: 1, default: 1 },
                                description: 'Page number'
                            },
                            {
                                name: 'pageSize',
                                in: 'query',
                                schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                                description: 'Page size'
                            },
                            {
                                name: 'status',
                                in: 'query',
                                schema: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
                                description: 'Filter by status'
                            }
                        ],
                        responses: {
                            200: {
                                description: 'List of users',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                users: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/User' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ['users'],
                        summary: 'Create user',
                        description: 'Create a new user',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            201: {
                                description: 'User created successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/users/{id}': {
                    get: {
                        tags: ['users'],
                        summary: 'Get user by ID',
                        description: 'Retrieve a specific user by ID',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'User ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'User details',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    },
                    patch: {
                        tags: ['users'],
                        summary: 'Update user',
                        description: 'Update user information',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'User ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'User updated successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/users/{id}/roles': {
                    post: {
                        tags: ['users'],
                        summary: 'Assign role to user',
                        description: 'Assign a role to a user',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'User ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Role assigned successfully'
                            }
                        }
                    },
                    delete: {
                        tags: ['users'],
                        summary: 'Remove role from user',
                        description: 'Remove a role from a user',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'User ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Role removed successfully'
                            }
                        }
                    }
                },
                // Rate Cards
                '/v1/rate-cards': {
                    get: {
                        tags: ['rate-cards'],
                        summary: 'List rate cards',
                        description: 'Retrieve rate cards for the organization',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'List of rate cards',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/RateCard' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ['rate-cards'],
                        summary: 'Create rate card',
                        description: 'Create a new rate card',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            201: {
                                description: 'Rate card created successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/RateCard' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/rate-cards/{id}': {
                    get: {
                        tags: ['rate-cards'],
                        summary: 'Get rate card by ID',
                        description: 'Retrieve a specific rate card',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Rate card ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Rate card details',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/RateCard' }
                                    }
                                }
                            }
                        }
                    },
                    patch: {
                        tags: ['rate-cards'],
                        summary: 'Update rate card',
                        description: 'Update rate card information',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Rate card ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Rate card updated successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/RateCard' }
                                    }
                                }
                            }
                        }
                    }
                },
                // Currencies
                '/v1/currencies': {
                    get: {
                        tags: ['currencies'],
                        summary: 'List currencies',
                        description: 'Get all active ISO 4217 currency codes',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'List of currencies',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Currency' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/currencies/popular': {
                    get: {
                        tags: ['currencies'],
                        summary: 'Get popular currencies',
                        description: 'Get commonly used currencies',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'List of popular currencies',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Currency' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/currencies/region/{region}': {
                    get: {
                        tags: ['currencies'],
                        summary: 'Get currencies by region',
                        description: 'Get currencies by geographic region',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'region',
                                in: 'path',
                                required: true,
                                description: 'Geographic region',
                                schema: {
                                    type: 'string',
                                    enum: ['europe', 'asia', 'americas', 'africa', 'middle-east', 'oceania']
                                }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'List of currencies for region',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Currency' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                // Payments
                '/v1/payments': {
                    post: {
                        tags: ['payments'],
                        summary: 'Create payment',
                        description: 'Create a new payment record',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'Payment created successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Payment' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/payments/{id}/void': {
                    post: {
                        tags: ['payments'],
                        summary: 'Void payment',
                        description: 'Void a payment',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                description: 'Payment ID',
                                schema: { type: 'string', format: 'uuid' }
                            }
                        ],
                        responses: {
                            200: {
                                description: 'Payment voided successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Payment' }
                                    }
                                }
                            }
                        }
                    }
                },
                // Permissions
                '/v1/permissions/check': {
                    post: {
                        tags: ['permissions'],
                        summary: 'Check permission',
                        description: 'Check if user has a specific permission',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'Permission check result',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                hasPermission: { type: 'boolean' },
                                                reason: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/permissions/can-override-quote-price': {
                    get: {
                        tags: ['permissions'],
                        summary: 'Check quote price override permission',
                        description: 'Check if current user can override quote prices',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'Permission check result',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                hasPermission: { type: 'boolean' },
                                                reason: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                // Authentication
                '/v1/auth/login': {
                    post: {
                        tags: ['auth'],
                        summary: 'User login',
                        description: 'Authenticate user and get access token',
                        responses: {
                            200: {
                                description: 'Login successful',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                accessToken: { type: 'string' },
                                                refreshToken: { type: 'string' },
                                                user: { $ref: '#/components/schemas/User' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/auth/refresh': {
                    post: {
                        tags: ['auth'],
                        summary: 'Refresh token',
                        description: 'Refresh access token using refresh token',
                        responses: {
                            200: {
                                description: 'Token refreshed successfully',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                accessToken: { type: 'string' },
                                                refreshToken: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/v1/auth/logout': {
                    post: {
                        tags: ['auth'],
                        summary: 'User logout',
                        description: 'Logout user and invalidate tokens',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'Logout successful'
                            }
                        }
                    }
                },
                '/v1/auth/me': {
                    get: {
                        tags: ['auth'],
                        summary: 'Get current user',
                        description: 'Get current authenticated user information',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'Current user information',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    }
                },
                // Health and Monitoring
                '/health': {
                    get: {
                        tags: ['health'],
                        summary: 'Health check',
                        description: 'Check API health status',
                        responses: {
                            200: {
                                description: 'API is healthy',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                                timestamp: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/metrics': {
                    get: {
                        tags: ['health'],
                        summary: 'Metrics',
                        description: 'Get Prometheus metrics',
                        responses: {
                            200: {
                                description: 'Metrics in Prometheus format',
                                content: {
                                    'text/plain': {
                                        schema: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            tags: [
                { name: 'quotes', description: 'Quote management endpoints' },
                { name: 'users', description: 'User management endpoints' },
                { name: 'rate-cards', description: 'Rate card management endpoints' },
                { name: 'currencies', description: 'Currency management endpoints' },
                { name: 'payments', description: 'Payment processing endpoints' },
                { name: 'permissions', description: 'Permission and authorization endpoints' },
                { name: 'auth', description: 'Authentication endpoints' },
                { name: 'health', description: 'Health and monitoring endpoints' }
            ]
        };
        // Return a simple HTML page that displays the OpenAPI spec
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pivotal Flow API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .method { font-weight: bold; color: #007bff; }
        .path { font-family: monospace; background: #f8f9fa; padding: 5px; }
        .description { color: #666; margin: 10px 0; }
        .tag { background: #e9ecef; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Pivotal Flow API Documentation</h1>
    <p>Version: ${openApiSpec.info.version}</p>
    
    <div class="section">
        <h2>Quote Management Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/quotes</div>
            <div class="description">List quotes with pagination and filtering</div>
            <div class="tag">quotes</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/quotes</div>
            <div class="description">Create a new quote with status "draft"</div>
            <div class="tag">quotes</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/quotes/{id}</div>
            <div class="description">Get specific quote by ID</div>
            <div class="tag">quotes</div>
        </div>
        
        <div class="endpoint">
            <div class="method">PATCH</div>
            <div class="path">/v1/quotes/{id}</div>
            <div class="description">Update quote (draft status only)</div>
            <div class="tag">quotes</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/quotes/{id}/status</div>
            <div class="description">Transition quote status (draft→pending→approved→sent→accepted)</div>
            <div class="tag">quotes</div>
        </div>
    </div>
    
    <div class="section">
        <h2>User Management Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/users</div>
            <div class="description">List users with pagination and filtering</div>
            <div class="tag">users</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/users</div>
            <div class="description">Create a new user</div>
            <div class="tag">users</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/users/{id}</div>
            <div class="description">Get user by ID</div>
            <div class="tag">users</div>
        </div>
        
        <div class="endpoint">
            <div class="method">PATCH</div>
            <div class="path">/v1/users/{id}</div>
            <div class="description">Update user information</div>
            <div class="tag">users</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/users/{id}/roles</div>
            <div class="description">Assign role to user</div>
            <div class="tag">users</div>
        </div>
        
        <div class="endpoint">
            <div class="method">DELETE</div>
            <div class="path">/v1/users/{id}/roles</div>
            <div class="description">Remove role from user</div>
            <div class="tag">users</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Rate Card Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/rate-cards</div>
            <div class="description">List rate cards for organization</div>
            <div class="tag">rate-cards</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/rate-cards</div>
            <div class="description">Create a new rate card</div>
            <div class="tag">rate-cards</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/rate-cards/{id}</div>
            <div class="description">Get rate card by ID</div>
            <div class="tag">rate-cards</div>
        </div>
        
        <div class="endpoint">
            <div class="method">PATCH</div>
            <div class="path">/v1/rate-cards/{id}</div>
            <div class="description">Update rate card information</div>
            <div class="tag">rate-cards</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Currency Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/currencies</div>
            <div class="description">Get all active ISO 4217 currency codes</div>
            <div class="tag">currencies</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/currencies/popular</div>
            <div class="description">Get commonly used currencies</div>
            <div class="tag">currencies</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/currencies/region/{region}</div>
            <div class="description">Get currencies by geographic region</div>
            <div class="tag">currencies</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Payment Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/payments</div>
            <div class="description">Create a new payment record</div>
            <div class="tag">payments</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/payments/{id}/void</div>
            <div class="description">Void a payment</div>
            <div class="tag">payments</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Permission Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/permissions/check</div>
            <div class="description">Check if user has specific permission</div>
            <div class="tag">permissions</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/permissions/can-override-quote-price</div>
            <div class="description">Check quote price override permission</div>
            <div class="tag">permissions</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Authentication Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/auth/login</div>
            <div class="description">Authenticate user and get access token</div>
            <div class="tag">auth</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/auth/refresh</div>
            <div class="description">Refresh access token</div>
            <div class="tag">auth</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="path">/v1/auth/logout</div>
            <div class="description">Logout user and invalidate tokens</div>
            <div class="tag">auth</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/v1/auth/me</div>
            <div class="description">Get current authenticated user information</div>
            <div class="tag">auth</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Health & Monitoring Endpoints</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/health</div>
            <div class="description">Check API health status</div>
            <div class="tag">health</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="path">/metrics</div>
            <div class="description">Get Prometheus metrics</div>
            <div class="tag">health</div>
        </div>
    </div>
    
    <h3>Authentication</h3>
    <p>All endpoints require Bearer JWT authentication except for login, refresh, health, and metrics endpoints.</p>
    
    <h3>OpenAPI Specification</h3>
    <p><a href="/api/openapi.json">Download OpenAPI JSON</a></p>
    
    <h3>API Overview</h3>
    <p>This API provides comprehensive business management capabilities including:</p>
    <ul>
        <li><strong>Quote Management:</strong> Create, update, and manage quotes with status transitions</li>
        <li><strong>User Management:</strong> User CRUD operations and role assignments</li>
        <li><strong>Rate Cards:</strong> Manage pricing structures and rate cards</li>
        <li><strong>Currencies:</strong> Support for multiple currencies and regions</li>
        <li><strong>Payments:</strong> Payment processing and management</li>
        <li><strong>Permissions:</strong> Fine-grained permission checking</li>
        <li><strong>Authentication:</strong> JWT-based authentication system</li>
        <li><strong>Monitoring:</strong> Health checks and metrics</li>
    </ul>
</body>
</html>`;
        await reply.type('text/html').send(html);
    });
    // Register public documentation routes as a separate plugin BEFORE auth
    await app.register(async (fastify) => {
        // Test route to verify manual routes work
        fastify.get('/test/manual', {
            preHandler: [], // Explicitly empty preHandler array to bypass auth
        }, async () => {
            return { message: 'Manual route working', timestamp: new Date().toISOString() };
        });
        // Manual OpenAPI documentation endpoint
        fastify.get('/api/openapi.json', {
            preHandler: [], // Explicitly empty preHandler array to bypass auth
        }, async () => {
            return {
                openapi: '3.0.0',
                info: {
                    title: 'Pivotal Flow API',
                    description: 'Business Management Platform API',
                    version: '0.1.0',
                },
                paths: {
                    '/v1/quotes': {
                        get: {
                            tags: ['quotes'],
                            summary: 'List quotes',
                            description: 'Retrieve a paginated list of quotes',
                            responses: {
                                200: {
                                    description: 'List of quotes',
                                    content: {
                                        'application/json': {
                                            schema: {
                                                type: 'object',
                                                properties: {
                                                    data: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                id: { type: 'string' },
                                                                title: { type: 'string' }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        post: {
                            tags: ['quotes'],
                            summary: 'Create a new quote',
                            description: 'Create a new quote with status "draft"',
                            requestBody: {
                                required: true,
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            required: ['customerId', 'title'],
                                            properties: {
                                                customerId: { type: 'string' },
                                                title: { type: 'string' },
                                                description: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            },
                            responses: {
                                201: {
                                    description: 'Quote created successfully',
                                    content: {
                                        'application/json': {
                                            schema: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    title: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                tags: [
                    { name: 'quotes', description: 'Quote management endpoints' }
                ]
            };
        });
    });
    // Authentication plugin
    await app.register(authPlugin);
    // Register authentication routes
    await app.register(loginRoute, { prefix: '/v1/auth' });
    await app.register(refreshRoute, { prefix: '/v1/auth' });
    await app.register(logoutRoute, { prefix: '/v1/auth' });
    await app.register(meRoute, { prefix: '/v1/auth' });
    // Test routes removed - no longer needed
    // Register users routes
    await app.register(listUsersRoute);
    await app.register(createUserRoute);
    await app.register(getUserRoute);
    await app.register(updateUserRoute);
    await app.register(assignRoleRoute);
    await app.register(removeRoleRoute);
    await app.register(updateUserStatusRoute);
    // Register quotes routes
    registerQuoteRoutes(app);
    // Register rate card routes
    await app.register(rateCardRoutes, { prefix: '/v1' });
    // Register permission routes
    await app.register(permissionRoutes, { prefix: '/v1' });
    // Register currency routes
    await app.register(currencyRoutes, { prefix: '/v1' });
    // Register payment routes
    await app.register(paymentRoutes, { prefix: '/v1' });
    // Register approval routes
    await app.register(approvalModule);
    // Register allocation routes
    await app.register(allocationModule);
    await app.register(portalModule);
    await app.register(reportsModule);
    await app.register(jobsModule);
    await app.register(filesModule);
    await app.register(referenceDataModule);
    await app.register(xeroIntegrationModule);
    // Simple test route
    app.get('/v1/simple-test', {
        schema: {
            tags: ['quotes'],
            summary: 'Simple test',
            description: 'Simple test route',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: async () => {
            return { message: 'Simple test working' };
        }
    });
    // Register metrics routes
    await app.register(metricsRoutes, { prefix: '/v1/metrics' });
    await app.register(performanceRoutes, { prefix: '/v1/perf' });
    // OpenAPI Documentation (after all routes are registered)
    console.log('About to register OpenAPI plugin...');
    await app.register(openapiPlugin);
    console.log('OpenAPI plugin registered successfully');
    // Add simple docs route if OPENAPI_ENABLE is true
    if (process.env['OPENAPI_ENABLE'] === 'true') {
        app.get('/docs', async (_request, reply) => {
            console.log('Serving /docs route');
            return reply.type('text/html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pivotal Flow API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                onComplete: function() {
                    console.log('Swagger UI loaded successfully');
                },
                onFailure: function(data) {
                    console.error('Failed to load Swagger UI:', data);
                }
            });
        };
    </script>
</body>
</html>
      `);
        });
        console.log('Added /docs route');
    }
}
app.get('/', async () => {
    return {
        message: 'Pivotal Flow API',
        version: '0.1.0',
        status: 'running',
        endpoints: {
            health: '/health',
            metrics: '/metrics',
            docs: '/docs',
            docsJson: '/docs/json',
            openapi: '/api/openapi.json',
            quoteDocs: '/api/quotes-docs.json',
            quotesOpenApi: '/api/quotes-openapi.json',
            apiDocs: '/api/docs',
            testManual: '/test/manual',
            auth: '/v1/auth'
        },
        openapi: {
            title: 'Pivotal Flow API',
            version: '0.1.0',
            available_endpoints: {
                'Quote Management': {
                    'GET /v1/quotes': 'List all quotes with pagination and filtering',
                    'POST /v1/quotes': 'Create a new quote with status "draft"',
                    'GET /v1/quotes/{id}': 'Get specific quote by ID',
                    'PATCH /v1/quotes/{id}': 'Update quote (draft status only)',
                    'POST /v1/quotes/{id}/status': 'Transition quote status (draft→pending→approved→sent→accepted)'
                },
                'User Management': {
                    'GET /v1/users': 'List users with pagination and filtering',
                    'POST /v1/users': 'Create a new user',
                    'GET /v1/users/{id}': 'Get user by ID',
                    'PATCH /v1/users/{id}': 'Update user information',
                    'POST /v1/users/{id}/roles': 'Assign role to user',
                    'DELETE /v1/users/{id}/roles': 'Remove role from user'
                },
                'Rate Cards': {
                    'GET /v1/rate-cards': 'List rate cards for organization',
                    'POST /v1/rate-cards': 'Create a new rate card',
                    'GET /v1/rate-cards/{id}': 'Get rate card by ID',
                    'PATCH /v1/rate-cards/{id}': 'Update rate card information'
                },
                'Currencies': {
                    'GET /v1/currencies': 'Get all active ISO 4217 currency codes',
                    'GET /v1/currencies/popular': 'Get commonly used currencies',
                    'GET /v1/currencies/region/{region}': 'Get currencies by geographic region'
                },
                'Payments': {
                    'POST /v1/payments': 'Create a new payment record',
                    'POST /v1/payments/{id}/void': 'Void a payment'
                },
                'Permissions': {
                    'POST /v1/permissions/check': 'Check if user has specific permission',
                    'GET /v1/permissions/can-override-quote-price': 'Check quote price override permission'
                },
                'Approvals': {
                    'POST /v1/approvals': 'Create a new approval request',
                    'POST /v1/approvals/{id}/approve': 'Approve an approval request',
                    'POST /v1/approvals/{id}/reject': 'Reject an approval request',
                    'POST /v1/approvals/{id}/cancel': 'Cancel an approval request',
                    'GET /v1/approvals': 'List approval requests with filters',
                    'GET /v1/approvals/{id}': 'Get approval request by ID',
                    'GET /v1/approvals/policy': 'Get organization approval policy'
                },
                'Resource Allocations': {
                    'POST /v1/projects/{id}/allocations': 'Create a new resource allocation',
                    'GET /v1/projects/{id}/allocations': 'Get allocations for a project',
                    'PATCH /v1/allocations/{id}': 'Update a resource allocation',
                    'DELETE /v1/allocations/{id}': 'Delete a resource allocation',
                    'GET /v1/projects/{id}/capacity': 'Get project capacity summary (planned vs actual)'
                },
                'Customer Portal': {
                    'GET /v1/portal/quotes': 'List customer quotes with filtering (external customer users only)',
                    'GET /v1/portal/quotes/{id}': 'Get quote detail with line items (customer ownership verified)',
                    'GET /v1/portal/invoices': 'List customer invoices with filtering (external customer users only)',
                    'GET /v1/portal/invoices/{id}': 'Get invoice detail with line items (customer ownership verified)',
                    'GET /v1/portal/time': 'List approved time entries summary by project and month',
                    'GET /v1/portal/health': 'Portal service health check and user context verification'
                },
                'Reports & Exports': {
                    'POST /v1/reports/export': 'Start async export job for reports (CSV/JSON)',
                    'GET /v1/reports/export/{jobId}': 'Get export job status and progress',
                    'GET /v1/reports/export/{jobId}/download': 'Download completed export file',
                    'GET /v1/reports/summary/quote-cycle-time': 'Get quote cycle time summary statistics',
                    'GET /v1/reports/summary/invoice-settlement-time': 'Get invoice settlement time summary statistics',
                    'GET /v1/reports/summary/time-approvals': 'Get time approvals summary statistics',
                    'GET /v1/reports/summary/payments-received': 'Get payments received summary statistics'
                },
                'Authentication': {
                    'POST /v1/auth/login': 'Authenticate user and get access token',
                    'POST /v1/auth/refresh': 'Refresh access token',
                    'POST /v1/auth/logout': 'Logout user and invalidate tokens',
                    'GET /v1/auth/me': 'Get current authenticated user information'
                },
                'Health & Monitoring': {
                    'GET /health': 'Check API health status',
                    'GET /metrics': 'Get Prometheus metrics'
                }
            },
            schemas: {
                Quote: {
                    id: 'UUID',
                    quoteNumber: 'Q-2025-XXXX (organization-specific)',
                    customerId: 'UUID',
                    title: 'string',
                    description: 'string',
                    status: 'draft|pending|approved|sent|accepted|rejected|cancelled',
                    validFrom: 'ISO datetime',
                    validUntil: 'ISO datetime',
                    totalAmount: 'number (calculated)',
                    createdAt: 'ISO datetime',
                    updatedAt: 'ISO datetime'
                },
                User: {
                    id: 'UUID',
                    email: 'string (email format)',
                    firstName: 'string',
                    lastName: 'string',
                    status: 'active|inactive|suspended',
                    createdAt: 'ISO datetime'
                },
                RateCard: {
                    id: 'UUID',
                    name: 'string',
                    description: 'string',
                    currency: 'string (3 chars)',
                    effectiveFrom: 'date',
                    effectiveUntil: 'date',
                    isDefault: 'boolean',
                    isActive: 'boolean'
                },
                Currency: {
                    code: 'string (3 chars)',
                    name: 'string',
                    symbol: 'string',
                    isActive: 'boolean'
                },
                Payment: {
                    id: 'UUID',
                    invoiceId: 'string',
                    amount: 'number',
                    currency: 'string (3 chars)',
                    method: 'string',
                    status: 'pending|completed|failed|voided',
                    createdAt: 'ISO datetime'
                }
            },
            authentication: {
                type: 'Bearer JWT',
                required: 'Most endpoints require authentication',
                public_endpoints: [
                    '/health',
                    '/metrics',
                    '/api/docs',
                    '/v1/auth/login',
                    '/v1/auth/refresh'
                ]
            }
        }
    };
});
app.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server is healthy',
        version: '0.1.0',
    };
});
app.get('/health/db', async (req, reply) => {
    try {
        // Use Drizzle health check instead of Prisma
        await req.server.db.query `SELECT 1`;
        return reply.send({ status: "ok" });
    }
    catch {
        return reply.code(500).send({ status: "db_error" });
    }
});
// Top-level metrics endpoint (gated by config)
if (config.metrics.METRICS_ENABLED) {
    app.get('/metrics', async (_request, reply) => {
        try {
            const metrics = await register.metrics();
            await reply.header('Content-Type', register.contentType);
            await reply.status(200).send(metrics);
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to generate metrics');
            await reply.status(500).send('Failed to generate metrics');
        }
    });
}
app.get('/metrics/info', async () => {
    return {
        enabled: config.metrics.METRICS_ENABLED,
        path: config.metrics.METRICS_PATH,
        defaultMetrics: true,
        customMetrics: [],
    };
});
// Process level error handling
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled rejection');
});
process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception');
    process.exit(1);
});
// Start server
async function startServer() {
    try {
        logger.info(`Startup at ${new Date().toISOString()} - WATCHER WORKING!`);
        logger.info({
            port: config.server.PORT,
            host: config.server.HOST,
            startupTime: new Date().toISOString(),
            message: '🚀 BACKEND STARTUP - NEW INSTANCE - FILE WATCHING TEST'
        }, 'Starting server');
        // Probe prom client early
        try {
            const testMetrics = await register.metrics();
            logger.info({ length: testMetrics.length }, 'Prometheus metrics test ok');
        }
        catch (promError) {
            logger.warn({ err: promError }, 'Prometheus metrics test failed');
        }
        await registerPlugins();
        logger.info({}, 'Ensuring plugins are ready');
        await app.ready();
        // Fail loud in dev if boot fails - check after listen
        logger.info({}, 'Calling app.listen');
        await app.listen({
            port: config.server.PORT,
            host: config.server.HOST,
        });
        logger.info({}, 'app.listen completed');
        // Fail loud in dev if boot fails - check after listen
        if (config.server.NODE_ENV === 'development') {
            try {
                // Check if app is properly configured and listening
                if (!app.server || !app.server.listening) {
                    logger.error({}, "Boot failed after listen - app not properly configured");
                    process.exit(1);
                }
                logger.info({}, "App is properly configured and listening");
            }
            catch (error) {
                logger.error({ err: error }, "Boot failed after listen - error in configuration check");
                process.exit(1);
            }
        }
        logger.info({ url: `http://${config.server.HOST}:${config.server.PORT}` }, 'Server running');
    }
    catch (err) {
        if (err instanceof Error) {
            logger.error({
                name: err.name,
                message: err.message,
                stack: err.stack,
                code: err?.code,
                errno: err?.errno,
                syscall: err?.syscall,
                address: err?.address,
                port: err?.port,
                cause: err?.cause,
            }, 'Failed to start server');
            if (err.code === 'EADDRINUSE' ||
                err.code === 'EACCES' ||
                err.code === 'EADDRNOTAVAIL') {
                logger.error({}, 'Critical server error - exiting');
                process.exit(1);
            }
        }
        else {
            logger.error({ err: err }, 'Failed to start server with unknown error');
        }
        if (config.server.NODE_ENV === 'development') {
            logger.warn({}, 'Server failed to start, continuing in development mode');
        }
        else {
            process.exit(1);
        }
    }
}
// Single start guard to prevent accidental double starts during watch reloads
if (globalThis.__appStarted) {
    logger.warn({}, "App already started in this process");
    setTimeout(() => process.exit(0), 50); // Give time for logs to flush
}
globalThis.__appStarted = true;
startServer().catch((error) => {
    logger.fatal({ err: error }, 'Fatal error during server startup');
    process.exit(1);
});
// Graceful shutdown
process.once('SIGTERM', () => {
    logger.info({}, 'SIGTERM received, shutting down gracefully');
    void app.close().then(() => process.exit(0));
});
process.once('SIGINT', () => {
    logger.info({}, 'SIGINT received, shutting down gracefully');
    void app.close().then(() => process.exit(0));
});
//# sourceMappingURL=index.js.map