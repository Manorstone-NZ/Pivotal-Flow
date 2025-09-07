/**
 * Swagger Plugin Configuration
 * Provides OpenAPI documentation and Swagger UI
 */
import { config } from '../config/index.js';
export async function registerSwaggerPlugin(app) {
    // Register Swagger for OpenAPI JSON generation
    await app.register(require('@fastify/swagger'), {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Pivotal Flow API',
                version: '1.0.0',
                description: 'Professional services management API for project tracking, time management, and billing',
                contact: {
                    name: 'Pivotal Flow Team',
                    email: 'support@pivotalflow.com'
                },
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT'
                }
            },
            servers: [
                {
                    url: `http://${config.server.HOST}:${config.server.PORT}`,
                    description: 'Development Server'
                },
                {
                    url: 'https://api-staging.pivotalflow.com',
                    description: 'Staging Server'
                },
                {
                    url: 'https://api.pivotalflow.com',
                    description: 'Production Server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'JWT Bearer token for API authentication'
                    }
                },
                responses: {
                    ValidationError: {
                        description: 'Request validation failed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'VALIDATION_ERROR' },
                                                message: { type: 'string', example: 'Request validation failed' },
                                                details: { type: 'string', example: 'Invalid email format' },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    },
                    AuthenticationError: {
                        description: 'Authentication failed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'AUTHENTICATION_ERROR' },
                                                message: { type: 'string', example: 'Invalid or expired token' },
                                                details: { type: 'string', example: 'Bearer token required' },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    },
                    AuthorizationError: {
                        description: 'Insufficient permissions',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'AUTHORIZATION_ERROR' },
                                                message: { type: 'string', example: 'Insufficient permissions' },
                                                details: { type: 'string', example: 'Required permission: users.create_users' },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    },
                    NotFoundError: {
                        description: 'Resource not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'NOT_FOUND_ERROR' },
                                                message: { type: 'string', example: 'Resource not found' },
                                                details: { type: 'string', example: 'User with ID 123 not found' },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    },
                    RateLimitError: {
                        description: 'Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'RATE_LIMIT_ERROR' },
                                                message: { type: 'string', example: 'Rate limit exceeded' },
                                                details: { type: 'object', example: { retry_after: 60 } },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    },
                    InternalError: {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'object',
                                            properties: {
                                                code: { type: 'string', example: 'INTERNAL_ERROR' },
                                                message: { type: 'string', example: 'An unexpected error occurred' },
                                                details: { type: 'string', example: 'Database connection failed' },
                                                timestamp: { type: 'string', format: 'date-time' },
                                                request_id: { type: 'string', example: 'req_1234567890_abcdef123' }
                                            },
                                            required: ['code', 'message', 'timestamp', 'request_id']
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                api_version: { type: 'string', example: '1.0.0' },
                                                documentation_url: { type: 'string', example: 'https://api.pivotalflow.com/docs' }
                                            },
                                            required: ['api_version', 'documentation_url']
                                        }
                                    },
                                    required: ['error', 'meta']
                                }
                            }
                        }
                    }
                }
            },
            tags: [
                { name: 'Authentication', description: 'User authentication and session management' },
                { name: 'Users', description: 'User management and profile operations' },
                { name: 'Quotes', description: 'Quote creation, management, and tracking' },
                { name: 'Rate Cards', description: 'Rate card management and pricing' },
                { name: 'Currencies', description: 'Currency management and exchange rates' },
                { name: 'Payments', description: 'Payment processing and tracking' },
                { name: 'Permissions', description: 'Permission and role management' },
                { name: 'Health', description: 'System health and monitoring endpoints' }
            ]
        }
    });
    // Register Swagger UI
    await app.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject) => {
            return swaggerObject;
        },
        transformSpecificationClone: true
    });
    // Add OpenAPI JSON endpoint
    app.get('/openapi.json', async () => {
        return app.swagger();
    });
}
//# sourceMappingURL=swagger.js.map