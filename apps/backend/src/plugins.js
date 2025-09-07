import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { app } from './server.js';
// C0 Backend Readiness imports
import { getCorsConfig } from './lib/cors-rate-limit.js';
import { globalErrorHandler, requestIdMiddleware, requestLoggingMiddleware } from './lib/error-handler.js';
import { requestLoggingMiddleware as observabilityRequestLogging, metricsEndpointMiddleware, healthCheckMiddleware } from './lib/observability.js';
import { openApiSchema } from './lib/openapi-schema.js';
// Module imports
import { filesModule } from './files/index.js';
import { allocationModule } from './modules/allocations/index.js';
import { approvalModule } from './modules/approvals/index.js';
import { portalModule } from './modules/portal/index.js';
import { reportsModule } from './modules/reports/index.js';
import { jobsModule } from './modules/jobs/index.js';
import { referenceDataModule } from './modules/reference-data/index.js';
import { xeroIntegrationModule } from './modules/integrations/xero/index.js';
// Plugin imports
import { cachePlugin } from './plugins/cache.plugin.js';
import { cacheHeadersPlugin } from './plugins/cache-headers.js';
import databasePlugin from './plugins/database.js';
import { idempotencyPlugin } from './plugins/idempotency.js';
import { payloadGuardPlugin } from './plugins/payloadGuard.js';
export async function registerPlugins() {
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
    // Swagger/OpenAPI configuration
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
        },
        transform: jsonSchemaTransform,
    });
    // Swagger UI (only if enabled)
    if (process.env['OPENAPI_ENABLE'] === 'true') {
        await app.register(swaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false,
            },
            uiHooks: {
                onRequest: function (_request, _reply, next) {
                    next();
                },
                preHandler: function (_request, _reply, next) {
                    next();
                },
            },
            staticCSP: true,
            transformStaticCSP: (header) => header,
            transformSpecification: (swaggerObject, _request, _reply) => {
                return swaggerObject;
            },
            transformSpecificationClone: true,
        });
    }
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
    // Register core plugins
    await app.register(cachePlugin);
    await app.register(cacheHeadersPlugin);
    await app.register(idempotencyPlugin);
    await app.register(payloadGuardPlugin);
    // Register modules
    await app.register(filesModule);
    await app.register(jobsModule);
    await app.register(allocationModule);
    await app.register(approvalModule);
    await app.register(portalModule);
    await app.register(reportsModule);
    await app.register(referenceDataModule);
    await app.register(xeroIntegrationModule);
}
//# sourceMappingURL=plugins.js.map