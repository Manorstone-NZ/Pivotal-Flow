import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { app } from './server.js';

// Import auth plugin
import { authPlugin } from './modules/auth/index.js';

// Import database plugin
import databasePlugin from './plugins/database.js';

// Import cache plugin
import { cachePlugin } from './plugins/cache.plugin.js';

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID']
  };
  
  await app.register(cors as any, simpleCorsConfig);

  // Authentication plugin (includes cookie and JWT support)
  await app.register(authPlugin);

  // C0 Backend Readiness - Security headers
  await app.register(helmet as any, {
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
  await app.register(rateLimit as any, {
    max: 1000,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1'],
    keyGenerator: (request: any) => (request).user?.sub || request.ip,
    errorResponseBuilder: (_request: any, context: any) => ({
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
              bearerFormat: 'JWT',
              description: 'JWT Bearer token authentication',
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
