import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { logger } from './lib/logger.js';
import { config } from './lib/config.js';

import { errorHandler } from './lib/error-handler.js';
import { requestLogger } from './lib/request-logger.js';
import { register, collectDefaultMetrics } from 'prom-client';
import { metricsRoutes } from './routes/metrics.js';
import { performanceRoutes } from './routes/perf.js';
// Test auth route removed - no longer needed
import { authPlugin, loginRoute, refreshRoute, logoutRoute, meRoute } from './modules/auth/index.js';
import databasePlugin from './plugins/database.js';
// import {
//   listUsersRoute,
//   createUserRoute,
//   getUserRoute,
//   updateUserRoute,
//   assignRoleRoute,
//   removeRoleRoute,
//   updateUserStatusRoute
// } from './modules/users/index.js';
import { registerQuoteRoutes } from './modules/quotes/index.js';

// Enable default metrics collection (once per process)
const g = globalThis as any;
if (!g.__metricsInit) {
  try {
    collectDefaultMetrics({ register });
    g.__metricsInit = true;
  } catch (error) {
    // Metrics already registered, continue
    logger.warn('Default metrics already registered, skipping');
  }
}

const app = Fastify({
  logger: false,
  trustProxy: true,
});

async function registerPlugins() {
  // Core plugins
  await app.register(cors as any, {
    origin: config.cors.origin,
    credentials: true,
  });

  await app.register(helmet as any, {
    contentSecurityPolicy: false, // ok for development
  });

  await app.register(rateLimit as any, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.window, // number or string eg '1 minute'
  });

  // Database plugin (register early for database access)
  await app.register(databasePlugin);

  // Register manual OpenAPI documentation route BEFORE any Swagger plugins
  app.get('/api/quotes-openapi.json', {
    preHandler: [],
    config: {
      skipAuth: true
    }
  }, async () => {
    // Return a complete manual OpenAPI specification with quote routes
    return {
      openapi: '3.0.0',
      info: {
        title: 'Pivotal Flow API',
        description: 'Business Management Platform API',
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
          }
        }
      },
      paths: {
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
          }
        }
      },
      tags: [
        { name: 'quotes', description: 'Quote management endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'health', description: 'Health and monitoring endpoints' },
        { name: 'Users', description: 'User management endpoints' }
      ]
    };
  });

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
        description: 'Business Management Platform API',
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
          }
        }
      },
      paths: {
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
          }
        }
      },
      tags: [
        { name: 'quotes', description: 'Quote management endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'health', description: 'Health and monitoring endpoints' },
        { name: 'Users', description: 'User management endpoints' }
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
    </style>
</head>
<body>
    <h1>Pivotal Flow API Documentation</h1>
    <p>Version: ${openApiSpec.info.version}</p>
    
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
    
    <h3>Authentication</h3>
    <p>All endpoints require Bearer JWT authentication.</p>
    
    <h3>OpenAPI Specification</h3>
    <p><a href="/api/quotes-openapi.json">Download OpenAPI JSON</a></p>
</body>
</html>`;

    reply.type('text/html').send(html);
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
  app.register(loginRoute, { prefix: '/v1/auth' });
  app.register(refreshRoute, { prefix: '/v1/auth' });
  app.register(logoutRoute, { prefix: '/v1/auth' });
  app.register(meRoute, { prefix: '/v1/auth' });
  
  // Test routes removed - no longer needed

  // Hooks before routes
  app.addHook('onRequest', requestLogger);
  app.setErrorHandler(errorHandler);

  // Register users routes
  // Temporarily disabled to focus on quotes module
  // app.register(listUsersRoute);
  // app.register(createUserRoute);
  // app.register(getUserRoute);
  // app.register(updateUserRoute);
  // app.register(assignRoleRoute);
  // app.register(removeRoleRoute);
  // app.register(updateUserStatusRoute);

  // Register quotes routes
  registerQuoteRoutes(app);

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
      quote_endpoints: {
        'GET /v1/quotes': 'List all quotes with pagination and filtering',
        'POST /v1/quotes': 'Create a new quote with status "draft"',
        'GET /v1/quotes/{id}': 'Get specific quote by ID',
        'PATCH /v1/quotes/{id}': 'Update quote (draft status only)',
        'POST /v1/quotes/{id}/status': 'Transition quote status (draft→pending→approved→sent→accepted)'
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
        }
      },
      authentication: {
        type: 'Bearer JWT',
        header: 'Authorization: Bearer <token>',
        login: 'POST /v1/auth/login'
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
    await (req.server as any).db.query`SELECT 1`;
    return reply.send({ status: "ok" });
  } catch {
    return reply.code(500).send({ status: "db_error" });
  }
});

// Top-level metrics endpoint (gated by config)
if (config.metrics.enabled) {
  app.get('/metrics', async (_request, reply) => {
    try {
      const metrics = await register.metrics();
      reply.header('Content-Type', register.contentType);
      return reply.status(200).send(metrics);
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate metrics');
      return reply.status(500).send('Failed to generate metrics');
    }
  });
}

app.get('/metrics/info', async () => {
  return {
    enabled: config.metrics.enabled,
    path: config.metrics.path,
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
      port: config.server.port, 
      host: config.server.host,
      startupTime: new Date().toISOString(),
      message: '🚀 BACKEND STARTUP - NEW INSTANCE - FILE WATCHING TEST'
    }, 'Starting server');

    // Probe prom client early
    try {
      const testMetrics = await register.metrics();
      logger.info({ length: testMetrics.length }, 'Prometheus metrics test ok');
    } catch (promError) {
      logger.warn({ err: promError }, 'Prometheus metrics test failed');
    }

    await registerPlugins();

    logger.info({}, 'Ensuring plugins are ready');
    await app.ready();
    
    // Fail loud in dev if boot fails - check after listen

    logger.info({}, 'Calling app.listen');
    await app.listen({
      port: Number(process.env['PORT']) || config.server.port,
      host: config.server.host,
    });
    logger.info({}, 'app.listen completed');

    // Fail loud in dev if boot fails - check after listen
    if (config.isDevelopment) {
      try {
        // Check if app is properly configured and listening
        if (!app.server || !app.server.listening) {
          logger.error({}, "Boot failed after listen - app not properly configured");
          process.exit(1);
        }
        logger.info({}, "App is properly configured and listening");
      } catch (error) {
        logger.error({ err: error }, "Boot failed after listen - error in configuration check");
        process.exit(1);
      }
    }

    logger.info({ url: `http://${config.server.host}:${config.server.port}` }, 'Server running');
  } catch (err) {
    if (err instanceof Error) {
      logger.error(
        {
          name: err.name,
          message: err.message,
          stack: err.stack,
          code: (err as any)?.code,
          errno: (err as any)?.errno,
          syscall: (err as any)?.syscall,
          address: (err as any)?.address,
          port: (err as any)?.port,
          cause: err.cause,
        },
        'Failed to start server',
      );

      if (
        (err as any).code === 'EADDRINUSE' ||
        (err as any).code === 'EACCES' ||
        (err as any).code === 'EADDRNOTAVAIL'
      ) {
        logger.error({}, 'Critical server error - exiting');
        process.exit(1);
      }
    } else {
      logger.error({ err: err as unknown }, 'Failed to start server with unknown error');
    }

    if (config.isDevelopment) {
      logger.warn({}, 'Server failed to start, continuing in development mode');
    } else {
      process.exit(1);
    }
  }
}

// Single start guard to prevent accidental double starts during watch reloads
if ((globalThis as any).__appStarted) {
  logger.warn({}, "App already started in this process");
  setTimeout(() => process.exit(0), 50); // Give time for logs to flush
}
(globalThis as any).__appStarted = true;

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
