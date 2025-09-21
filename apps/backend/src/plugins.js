import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { app } from './server.js';
// Import auth plugins (clean, no JWT)
import authCleanPlugin from './plugins/auth.clean.js'; // Clean auth (opaque + PASETO)
import redisPlugin from './plugins/redis.js'; // Redis for session management
import cookiePlugin from '@fastify/cookie';
// Import database plugin
import databasePlugin from './plugins/database.js';
// Import tenant context plugin
import tenantContextPlugin from './plugins/tenant-context.js';
// Import permission check plugin
import permissionCheckPlugin from './plugins/permission-check.js';
// Import audit logging plugin
// import auditLoggingPlugin from './plugins/audit-logging.js';
// C0 Backend Readiness imports
import { getCorsConfig } from './lib/cors-rate-limit.js';
import { globalErrorHandler, requestIdMiddleware, requestLoggingMiddleware } from './lib/error-handler.js';
import { requestLoggingMiddleware as observabilityRequestLogging } from './lib/observability.js';
export async function registerPlugins() {
    // C0 Backend Readiness - Global error handler
    app.setErrorHandler(globalErrorHandler);
    // C0 Backend Readiness - Request ID and logging middleware
    app.addHook('preHandler', requestIdMiddleware);
    app.addHook('preHandler', requestLoggingMiddleware);
    app.addHook('preHandler', observabilityRequestLogging);
    // C0 Backend Readiness - CORS configuration (register before auth)
    const corsConfig = getCorsConfig();
    // CORS config with origin header for all routes
    const simpleCorsConfig = {
        origin: true, // Allow all origins for development (sends back requesting origin)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        exposedHeaders: ['X-Request-ID']
    };
    await app.register(cors, simpleCorsConfig);
    // Tenant context plugin (before auth for proper request context)
    // TODO: Temporarily disabled - causing serialization errors
    // await app.register(tenantContextPlugin);
    // Permission check plugin (after authentication)
    await app.register(permissionCheckPlugin);
    // Audit logging plugin (after permission check)
    // await app.register(auditLoggingPlugin);
    // C0 Backend Readiness - Security headers
    await app.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'", "https:", "data:"],
                connectSrc: ["'self'"]
            }
        }
    });
    // C0 Backend Readiness - Rate limiting with per-route configuration
    await app.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        allowList: ['127.0.0.1', '::1'],
        keyGenerator: (request) => (request).user?.sub || request.ip,
        errorResponseBuilder: (_request, context) => ({
            error: {
                message: 'Rate limit exceeded',
                statusCode: 429,
                limit: context.max,
                remaining: context.remaining,
                resetTime: context.resetTime
            }
        })
    });
    // Database plugin (register early for database access)
    await app.register(databasePlugin);
    // Redis plugin (register before any auth or session plugin)
    await app.register(redisPlugin);
    // Cookie plugin (required for session management)
    await app.register(cookiePlugin, {
        secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-that-is-at-least-32-characters-long'
    });
    // Keep existing JWT authentication (stable)
    await app.register(authCleanPlugin);
    // Feature-flagged auth hardening plugins
    if (process.env.AUTH_USE_OPAQUE === 'true') {
        const { opaqueAuthPlugin } = await import('./plugins/auth.opaque.js');
        await app.register(opaqueAuthPlugin);
    }
    if (process.env.AUTH_ENABLE_PASETO_LINKS === 'true') {
        const { pasetoLinksPlugin } = await import('./plugins/auth.paseto-links.js');
        await app.register(pasetoLinksPlugin);
    }
    // Swagger/OpenAPI configuration (conditional registration)
    if (process.env['OPENAPI_ENABLE'] === 'true') {
        await app.register(swagger, {
            openapi: {
                info: {
                    title: 'Pivotal Flow API',
                    description: 'Business Management Platform API',
                    version: '1.0.0',
                },
                servers: [
                    {
                        url: 'http://localhost:3000',
                        description: 'Development server',
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'PASETO',
                            description: 'PASETO Bearer token authentication',
                        },
                    },
                },
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
            },
        });
        // Swagger UI (only after swagger is registered)
        await app.register(swaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false,
            },
            staticCSP: false, // Disable static CSP since we're handling it with helmet
            transformSpecification: (swaggerObject, _request, _reply) => {
                return swaggerObject;
            },
            transformSpecificationClone: true,
        });
    }
    // C0 Backend Readiness - OpenAPI documentation
    // app.get('/api/openapi.json', {
    //   preHandler: [],
    //   config: {
    //     // @ts-ignore - skipAuth is a custom property
    //     skipAuth: true
    //   }
    // }, async () => {
    //   return openApiSchema;
    // });
    // C0 Backend Readiness - Health check endpoint
    // app.get('/health', {
    //   preHandler: [],
    //   config: {
    //     // @ts-ignore - skipAuth is a custom property
    //     skipAuth: true
    //   }
    // }, healthCheckMiddleware);
    // C0 Backend Readiness - Metrics endpoint
    // app.get('/metrics', {
    //   preHandler: [],
    //   config: {
    //     // @ts-ignore - skipAuth is a custom property
    //     skipAuth: true
    //   }
    // }, metricsEndpointMiddleware);
    // Register core plugins
    // await app.register(cachePlugin);
    // await app.register(cacheHeadersPlugin);
    // await app.register(idempotencyPlugin);
    // await app.register(payloadGuardPlugin);
    // Register modules
    // await app.register(filesModule);
    // await app.register(jobsModule);
    // await app.register(allocationModule);
    // await app.register(approvalModule);
    // await app.register(portalModule);
    // await app.register(reportsModule);
    // await app.register(referenceDataModule);
    // await app.register(xeroIntegrationModule);
}
//# sourceMappingURL=plugins.js.map