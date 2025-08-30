import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { logger } from './lib/logger.js';
import { config } from './lib/config.js';

import { errorHandler } from './lib/error-handler.js';
import { requestLogger } from './lib/request-logger.js';
import { register, collectDefaultMetrics } from 'prom-client';
import { authPlugin, loginRoute, refreshRoute, logoutRoute, meRoute } from './modules/auth/index.js';
import {
  listUsersRoute,
  createUserRoute,
  getUserRoute,
  updateUserRoute,
  assignRoleRoute,
  removeRoleRoute,
  updateUserStatusRoute
} from './modules/users/index.js';

// Enable default metrics collection
collectDefaultMetrics({ register });

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

  // Authentication plugin
  await app.register(authPlugin);

  // Register authentication routes
  await app.register(loginRoute, { prefix: '/v1/auth' });
  await app.register(refreshRoute, { prefix: '/v1/auth' });
  await app.register(logoutRoute, { prefix: '/v1/auth' });
  await app.register(meRoute, { prefix: '/v1/auth' });

  // Register users routes
  await app.register(listUsersRoute);
  await app.register(createUserRoute);
  await app.register(getUserRoute);
  await app.register(updateUserRoute);
  await app.register(assignRoleRoute);
  await app.register(removeRoleRoute);
  await app.register(updateUserStatusRoute);

  // Hooks
  app.addHook('onRequest', requestLogger);
  app.setErrorHandler(errorHandler);

  // Swagger (register after routes to ensure discovery)
  logger.info({ step: 'swagger:register' }, 'Registering Swagger plugin');
  await app.register(swagger as any, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Pivotal Flow API',
        description: 'Business Management Platform API',
        version: '0.1.0',
      },
      // omit servers to use browser origin and avoid 0.0.0.0 in UI
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'health', description: 'Health and monitoring endpoints' },
        { name: 'Users', description: 'User management endpoints' },
      ],
      paths: {
        '/v1/auth/login': {
          post: {
            tags: ['auth'],
            summary: 'User login',
            description: 'Authenticate user with email and password',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string', minLength: 12 }
                    },
                    required: ['email', 'password']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            displayName: { type: 'string' },
                            roles: { type: 'array', items: { type: 'string' } },
                            organizationId: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Authentication failed',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
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
            summary: 'Refresh access token',
            description: 'Refresh access token using refresh token from cookie or body',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      refreshToken: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Token refreshed successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Refresh failed',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
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
            description: 'Logout user and revoke refresh token',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': {
                description: 'Logout successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/v1/auth/me': {
          get: {
            tags: ['auth'],
            summary: 'Get current user profile',
            description: 'Retrieve current user profile information',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': {
                description: 'User profile retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        displayName: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                        organizationId: { type: 'string' }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
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
    // Enable automatic route discovery
    exposeRoute: true,
    routePrefix: '/docs',
  });
  logger.info({ step: 'swagger:registered' }, 'Swagger plugin registered');

  logger.info({ step: 'swagger-ui:register' }, 'Registering Swagger UI plugin');
  await app.register(swaggerUi as any, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
  logger.info({ step: 'swagger-ui:registered' }, 'Swagger UI plugin registered');
}

// Routes
app.get('/', async () => {
  return {
    message: 'Pivotal Flow API',
    version: '0.1.0',
    status: 'running',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      docs: '/docs',
      auth: '/v1/auth',
    },
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

    logger.info({}, 'Calling app.listen');
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });
    logger.info({}, 'app.listen completed');

    try {
      // Generate OpenAPI specification
      const spec = (app as any).swagger();
      logger.info({ hasSpec: Boolean(spec) }, 'OpenAPI specification generated');
    } catch (swaggerError) {
      logger.warn({ err: swaggerError }, 'Swagger generation failed');
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
