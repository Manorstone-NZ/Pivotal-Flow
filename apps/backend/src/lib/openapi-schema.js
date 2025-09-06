/**
 * OpenAPI Schema for Pivotal Flow API
 * C0 Backend Readiness - Complete API documentation
 */
export const openApiSchema = {
    openapi: '3.0.3',
    info: {
        title: 'Pivotal Flow API',
        description: 'Enterprise business management API for quotations, projects, time tracking, and reporting',
        version: '1.0.0',
        contact: {
            name: 'API Support',
            email: 'api-support@pivotalflow.com',
            url: 'https://support.pivotalflow.com'
        },
        license: {
            name: 'Proprietary',
            url: 'https://pivotalflow.com/license'
        }
    },
    servers: [
        {
            url: 'https://api.pivotalflow.com/api/v1',
            description: 'Production server'
        },
        {
            url: 'https://staging-api.pivotalflow.com/api/v1',
            description: 'Staging server'
        },
        {
            url: 'http://localhost:3000/api/v1',
            description: 'Local development server'
        }
    ],
    security: [
        { bearerAuth: [] }
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and authorization endpoints'
        },
        {
            name: 'Users',
            description: 'User management operations'
        },
        {
            name: 'Quotes',
            description: 'Quote creation, management, and approval workflows'
        },
        {
            name: 'Projects',
            description: 'Project management and tracking'
        },
        {
            name: 'Time Tracking',
            description: 'Time entry and approval workflows'
        },
        {
            name: 'Payments',
            description: 'Payment processing and management'
        },
        {
            name: 'Reports',
            description: 'Reporting and analytics endpoints'
        },
        {
            name: 'Portal',
            description: 'Customer portal endpoints'
        },
        {
            name: 'Permissions',
            description: 'Role-based access control'
        },
        {
            name: 'Currencies',
            description: 'Currency and exchange rate management'
        },
        {
            name: 'Rate Cards',
            description: 'Service rate card management'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token for authentication'
            }
        },
        schemas: {
            // Global Error Model
            ErrorResponse: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: {
                        type: 'object',
                        required: ['code', 'message', 'timestamp', 'request_id'],
                        properties: {
                            code: {
                                type: 'string',
                                description: 'Error code for programmatic handling',
                                example: 'VALIDATION_ERROR'
                            },
                            message: {
                                type: 'string',
                                description: 'Human-readable error message',
                                example: 'Request validation failed'
                            },
                            details: {
                                type: 'object',
                                description: 'Additional error details',
                                example: {
                                    field: 'email',
                                    message: 'Invalid email format',
                                    value: 'invalid-email'
                                }
                            },
                            timestamp: {
                                type: 'string',
                                format: 'date-time',
                                description: 'ISO 8601 timestamp of when the error occurred',
                                example: '2025-01-15T15:30:00Z'
                            },
                            request_id: {
                                type: 'string',
                                description: 'Unique request identifier for tracking',
                                example: 'req_123456789'
                            }
                        }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            api_version: {
                                type: 'string',
                                example: '1.0.0'
                            },
                            documentation_url: {
                                type: 'string',
                                example: 'https://api.pivotalflow.com/docs'
                            }
                        }
                    }
                }
            },
            // Standard Pagination Envelope
            PaginationEnvelope: {
                type: 'object',
                required: ['items', 'pagination'],
                properties: {
                    items: {
                        type: 'array',
                        description: 'Array of items for the current page'
                    },
                    pagination: {
                        type: 'object',
                        required: ['page', 'pageSize', 'total', 'totalPages'],
                        properties: {
                            page: {
                                type: 'integer',
                                minimum: 1,
                                description: 'Current page number',
                                example: 1
                            },
                            pageSize: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 1000,
                                description: 'Number of items per page',
                                example: 25
                            },
                            total: {
                                type: 'integer',
                                minimum: 0,
                                description: 'Total number of items',
                                example: 150
                            },
                            totalPages: {
                                type: 'integer',
                                minimum: 0,
                                description: 'Total number of pages',
                                example: 6
                            },
                            hasNext: {
                                type: 'boolean',
                                description: 'Whether there is a next page',
                                example: true
                            },
                            hasPrev: {
                                type: 'boolean',
                                description: 'Whether there is a previous page',
                                example: false
                            }
                        }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            organization_id: {
                                type: 'string',
                                format: 'uuid',
                                description: 'Organization ID for the request'
                            },
                            filtered_count: {
                                type: 'integer',
                                description: 'Number of items after filtering'
                            }
                        }
                    }
                }
            },
            // Common Filter Parameters
            CommonFilters: {
                type: 'object',
                properties: {
                    page: {
                        type: 'integer',
                        minimum: 1,
                        default: 1,
                        description: 'Page number'
                    },
                    pageSize: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 1000,
                        default: 25,
                        description: 'Number of items per page'
                    },
                    search: {
                        type: 'string',
                        description: 'Search term for text-based filtering'
                    },
                    sortBy: {
                        type: 'string',
                        description: 'Field to sort by'
                    },
                    sortOrder: {
                        type: 'string',
                        enum: ['asc', 'desc'],
                        default: 'desc',
                        description: 'Sort order'
                    }
                }
            },
            // User Schemas
            User: {
                type: 'object',
                required: ['id', 'email', 'firstName', 'lastName', 'role', 'organizationId', 'status'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Unique user identifier'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    firstName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User first name'
                    },
                    lastName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User last name'
                    },
                    role: {
                        type: 'string',
                        description: 'User role'
                    },
                    organizationId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Organization identifier'
                    },
                    status: {
                        type: 'string',
                        enum: ['active', 'inactive', 'suspended'],
                        description: 'User status'
                    },
                    phoneNumber: {
                        type: 'string',
                        description: 'User phone number'
                    },
                    timezone: {
                        type: 'string',
                        description: 'User timezone'
                    },
                    locale: {
                        type: 'string',
                        description: 'User locale'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User creation timestamp'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User last update timestamp'
                    }
                }
            },
            CreateUserRequest: {
                type: 'object',
                required: ['email', 'firstName', 'lastName', 'password', 'roleId', 'organizationId'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    firstName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User first name'
                    },
                    lastName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User last name'
                    },
                    password: {
                        type: 'string',
                        minLength: 8,
                        description: 'User password'
                    },
                    roleId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Role identifier'
                    },
                    organizationId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Organization identifier'
                    },
                    phoneNumber: {
                        type: 'string',
                        description: 'User phone number'
                    },
                    timezone: {
                        type: 'string',
                        description: 'User timezone'
                    },
                    locale: {
                        type: 'string',
                        description: 'User locale'
                    }
                }
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    firstName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User first name'
                    },
                    lastName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 100,
                        description: 'User last name'
                    },
                    phoneNumber: {
                        type: 'string',
                        description: 'User phone number'
                    },
                    timezone: {
                        type: 'string',
                        description: 'User timezone'
                    },
                    locale: {
                        type: 'string',
                        description: 'User locale'
                    },
                    status: {
                        type: 'string',
                        enum: ['active', 'inactive', 'suspended'],
                        description: 'User status'
                    }
                }
            },
            // Quote Schemas
            Quote: {
                type: 'object',
                required: ['id', 'quoteNumber', 'title', 'status', 'totalAmount', 'currency', 'createdAt'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Unique quote identifier'
                    },
                    quoteNumber: {
                        type: 'string',
                        description: 'Quote number'
                    },
                    title: {
                        type: 'string',
                        description: 'Quote title'
                    },
                    description: {
                        type: 'string',
                        description: 'Quote description'
                    },
                    customerId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Customer identifier'
                    },
                    projectId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Project identifier'
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled'],
                        description: 'Quote status'
                    },
                    validFrom: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote validity start date'
                    },
                    validUntil: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote validity end date'
                    },
                    currency: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 3,
                        description: 'Currency code'
                    },
                    totalAmount: {
                        type: 'number',
                        minimum: 0,
                        description: 'Total quote amount'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote creation timestamp'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote last update timestamp'
                    }
                }
            },
            CreateQuoteRequest: {
                type: 'object',
                required: ['title', 'customerId', 'validFrom', 'validUntil', 'currency', 'lineItems'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 255,
                        description: 'Quote title'
                    },
                    description: {
                        type: 'string',
                        description: 'Quote description'
                    },
                    customerId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Customer identifier'
                    },
                    projectId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Project identifier'
                    },
                    validFrom: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote validity start date'
                    },
                    validUntil: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Quote validity end date'
                    },
                    currency: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 3,
                        description: 'Currency code'
                    },
                    lineItems: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            $ref: '#/components/schemas/QuoteLineItem'
                        },
                        description: 'Quote line items'
                    },
                    termsConditions: {
                        type: 'string',
                        description: 'Terms and conditions'
                    },
                    notes: {
                        type: 'string',
                        description: 'Notes'
                    },
                    internalNotes: {
                        type: 'string',
                        description: 'Internal notes'
                    }
                }
            },
            QuoteLineItem: {
                type: 'object',
                required: ['description', 'quantity', 'unitPrice'],
                properties: {
                    description: {
                        type: 'string',
                        minLength: 1,
                        description: 'Line item description'
                    },
                    quantity: {
                        type: 'number',
                        minimum: 0,
                        description: 'Quantity'
                    },
                    unitPrice: {
                        type: 'number',
                        minimum: 0,
                        description: 'Unit price'
                    },
                    serviceCategoryId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Service category identifier'
                    },
                    rateCardId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Rate card identifier'
                    }
                }
            },
            // Authentication Schemas
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    password: {
                        type: 'string',
                        minLength: 8,
                        description: 'User password'
                    },
                    mfaCode: {
                        type: 'string',
                        description: 'Multi-factor authentication code'
                    },
                    rememberMe: {
                        type: 'boolean',
                        default: false,
                        description: 'Remember user session'
                    }
                }
            },
            LoginResponse: {
                type: 'object',
                required: ['accessToken', 'tokenType', 'expiresIn', 'user'],
                properties: {
                    accessToken: {
                        type: 'string',
                        description: 'JWT access token'
                    },
                    refreshToken: {
                        type: 'string',
                        description: 'JWT refresh token'
                    },
                    tokenType: {
                        type: 'string',
                        enum: ['Bearer'],
                        default: 'Bearer',
                        description: 'Token type'
                    },
                    expiresIn: {
                        type: 'integer',
                        description: 'Token expiration time in seconds'
                    },
                    user: {
                        $ref: '#/components/schemas/User'
                    },
                    mfaRequired: {
                        type: 'boolean',
                        description: 'Whether MFA is required'
                    }
                }
            },
            // Permission Schemas
            Permission: {
                type: 'object',
                required: ['id', 'name', 'resource', 'action'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Permission identifier'
                    },
                    name: {
                        type: 'string',
                        description: 'Permission name'
                    },
                    resource: {
                        type: 'string',
                        description: 'Resource name'
                    },
                    action: {
                        type: 'string',
                        description: 'Action name'
                    },
                    description: {
                        type: 'string',
                        description: 'Permission description'
                    }
                }
            },
            Role: {
                type: 'object',
                required: ['id', 'name', 'description'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Role identifier'
                    },
                    name: {
                        type: 'string',
                        description: 'Role name'
                    },
                    description: {
                        type: 'string',
                        description: 'Role description'
                    },
                    permissions: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Permission'
                        },
                        description: 'Role permissions'
                    }
                }
            },
            // Report Schemas
            ExportJob: {
                type: 'object',
                required: ['id', 'organizationId', 'userId', 'reportType', 'format', 'status', 'fileName'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Export job identifier'
                    },
                    organizationId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Organization identifier'
                    },
                    userId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'User identifier'
                    },
                    reportType: {
                        type: 'string',
                        enum: ['quote_cycle_time', 'invoice_settlement_time', 'time_approvals', 'payments_received'],
                        description: 'Report type'
                    },
                    format: {
                        type: 'string',
                        enum: ['csv', 'json'],
                        description: 'Export format'
                    },
                    status: {
                        type: 'string',
                        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
                        description: 'Export job status'
                    },
                    filters: {
                        type: 'object',
                        description: 'Export filters'
                    },
                    fileName: {
                        type: 'string',
                        description: 'Export file name'
                    },
                    totalRows: {
                        type: 'integer',
                        description: 'Total number of rows'
                    },
                    processedRows: {
                        type: 'integer',
                        description: 'Number of processed rows'
                    },
                    downloadUrl: {
                        type: 'string',
                        description: 'Download URL'
                    },
                    errorMessage: {
                        type: 'string',
                        description: 'Error message if failed'
                    },
                    startedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Job start timestamp'
                    },
                    completedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Job completion timestamp'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Job creation timestamp'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Job last update timestamp'
                    }
                }
            },
            CreateExportJobRequest: {
                type: 'object',
                required: ['reportType', 'format', 'filters'],
                properties: {
                    reportType: {
                        type: 'string',
                        enum: ['quote_cycle_time', 'invoice_settlement_time', 'time_approvals', 'payments_received'],
                        description: 'Report type'
                    },
                    format: {
                        type: 'string',
                        enum: ['csv', 'json'],
                        description: 'Export format'
                    },
                    filters: {
                        type: 'object',
                        description: 'Export filters'
                    },
                    fileName: {
                        type: 'string',
                        description: 'Export file name'
                    }
                }
            },
            // Portal Schemas
            PortalQuote: {
                type: 'object',
                required: ['id', 'quoteNumber', 'title', 'status', 'totalAmount', 'currency'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Quote identifier'
                    },
                    quoteNumber: {
                        type: 'string',
                        description: 'Quote number'
                    },
                    title: {
                        type: 'string',
                        description: 'Quote title'
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
                        description: 'Quote status'
                    },
                    totalAmount: {
                        type: 'number',
                        description: 'Total amount'
                    },
                    currency: {
                        type: 'string',
                        description: 'Currency code'
                    },
                    validFrom: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Valid from date'
                    },
                    validUntil: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Valid until date'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp'
                    }
                }
            }
        },
        parameters: {
            // Common Parameters
            PageParam: {
                name: 'page',
                in: 'query',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    default: 1
                },
                description: 'Page number'
            },
            PageSizeParam: {
                name: 'pageSize',
                in: 'query',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 1000,
                    default: 25
                },
                description: 'Number of items per page'
            },
            SearchParam: {
                name: 'search',
                in: 'query',
                schema: {
                    type: 'string'
                },
                description: 'Search term'
            },
            SortByParam: {
                name: 'sortBy',
                in: 'query',
                schema: {
                    type: 'string'
                },
                description: 'Field to sort by'
            },
            SortOrderParam: {
                name: 'sortOrder',
                in: 'query',
                schema: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    default: 'desc'
                },
                description: 'Sort order'
            },
            OrganizationIdParam: {
                name: 'organizationId',
                in: 'query',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid'
                },
                description: 'Organization identifier'
            },
            IdParam: {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid'
                },
                description: 'Resource identifier'
            }
        },
        responses: {
            // Common Responses
            BadRequest: {
                description: 'Bad Request',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            Unauthorized: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            Forbidden: {
                description: 'Forbidden',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Not Found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            TooManyRequests: {
                description: 'Too Many Requests',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                },
                headers: {
                    'X-RateLimit-Limit': {
                        schema: {
                            type: 'integer'
                        },
                        description: 'Rate limit limit'
                    },
                    'X-RateLimit-Remaining': {
                        schema: {
                            type: 'integer'
                        },
                        description: 'Rate limit remaining'
                    },
                    'X-RateLimit-Reset': {
                        schema: {
                            type: 'integer'
                        },
                        description: 'Rate limit reset time'
                    }
                }
            },
            InternalServerError: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            }
        }
    },
    paths: {
        // Health Check
        '/health': {
            get: {
                tags: ['System'],
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
                                        status: {
                                            type: 'string',
                                            example: 'ok'
                                        },
                                        timestamp: {
                                            type: 'string',
                                            format: 'date-time'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Server is healthy'
                                        },
                                        version: {
                                            type: 'string',
                                            example: '1.0.0'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        // Authentication
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'User login',
                description: 'Authenticate user with email and password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Successful login',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginResponse'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    429: {
                        $ref: '#/components/responses/TooManyRequests'
                    }
                }
            }
        },
        '/auth/refresh': {
            post: {
                tags: ['Authentication'],
                summary: 'Refresh token',
                description: 'Refresh access token using refresh token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: {
                                        type: 'string',
                                        description: 'Refresh token'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Token refreshed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        accessToken: {
                                            type: 'string'
                                        },
                                        tokenType: {
                                            type: 'string',
                                            enum: ['Bearer']
                                        },
                                        expiresIn: {
                                            type: 'integer'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'User logout',
                description: 'Logout user and invalidate tokens',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: {
                                        type: 'string',
                                        description: 'Refresh token to invalidate'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Logout successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Successfully logged out'
                                        },
                                        success: {
                                            type: 'boolean',
                                            example: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    }
                }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Get current user',
                description: 'Get current authenticated user information',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Current user information',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    }
                }
            }
        },
        // Users
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'List users',
                description: 'Retrieve a paginated list of users',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/PageSizeParam' },
                    { $ref: '#/components/parameters/SearchParam' },
                    { $ref: '#/components/parameters/SortByParam' },
                    { $ref: '#/components/parameters/SortOrderParam' },
                    {
                        name: 'role',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Filter by role'
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['active', 'inactive', 'suspended']
                        },
                        description: 'Filter by status'
                    }
                ],
                responses: {
                    200: {
                        description: 'List of users',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginationEnvelope'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            },
            post: {
                tags: ['Users'],
                summary: 'Create user',
                description: 'Create a new user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateUserRequest'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: {
                                            $ref: '#/components/schemas/User'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'User created successfully'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    409: {
                        description: 'User already exists',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user',
                description: 'Get user by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' }
                ],
                responses: {
                    200: {
                        description: 'User information',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    }
                }
            },
            put: {
                tags: ['Users'],
                summary: 'Update user',
                description: 'Update user information',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateUserRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'User updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: {
                                            $ref: '#/components/schemas/User'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'User updated successfully'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    }
                }
            }
        },
        // Quotes
        '/quotes': {
            get: {
                tags: ['Quotes'],
                summary: 'List quotes',
                description: 'Retrieve a paginated list of quotes',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/PageSizeParam' },
                    { $ref: '#/components/parameters/SearchParam' },
                    { $ref: '#/components/parameters/SortByParam' },
                    { $ref: '#/components/parameters/SortOrderParam' },
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled']
                        },
                        description: 'Filter by status'
                    },
                    {
                        name: 'customerId',
                        in: 'query',
                        schema: {
                            type: 'string',
                            format: 'uuid'
                        },
                        description: 'Filter by customer'
                    },
                    {
                        name: 'projectId',
                        in: 'query',
                        schema: {
                            type: 'string',
                            format: 'uuid'
                        },
                        description: 'Filter by project'
                    }
                ],
                responses: {
                    200: {
                        description: 'List of quotes',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginationEnvelope'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            },
            post: {
                tags: ['Quotes'],
                summary: 'Create quote',
                description: 'Create a new quote',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateQuoteRequest'
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
                                        quote: {
                                            $ref: '#/components/schemas/Quote'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Quote created successfully'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            }
        },
        '/quotes/{id}': {
            get: {
                tags: ['Quotes'],
                summary: 'Get quote',
                description: 'Get quote by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' }
                ],
                responses: {
                    200: {
                        description: 'Quote information',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Quote'
                                }
                            }
                        }
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    }
                }
            }
        },
        // Reports
        '/reports/export': {
            post: {
                tags: ['Reports'],
                summary: 'Create export job',
                description: 'Start an async export job for reports',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateExportJobRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Export job created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        jobId: {
                                            type: 'string',
                                            format: 'uuid'
                                        },
                                        status: {
                                            type: 'string',
                                            example: 'pending'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Export job created successfully'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            }
        },
        '/reports/export/{id}': {
            get: {
                tags: ['Reports'],
                summary: 'Get export job status',
                description: 'Get the status and progress of an export job',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' }
                ],
                responses: {
                    200: {
                        description: 'Export job status',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        job: {
                                            $ref: '#/components/schemas/ExportJob'
                                        },
                                        progress: {
                                            type: 'object',
                                            properties: {
                                                percentage: {
                                                    type: 'number'
                                                },
                                                status: {
                                                    type: 'string'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    }
                }
            }
        },
        '/reports/summary/quote-cycle-time': {
            get: {
                tags: ['Reports'],
                summary: 'Quote cycle time summary',
                description: 'Get summary statistics for quote cycle times',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/OrganizationIdParam' },
                    {
                        name: 'fromDate',
                        in: 'query',
                        schema: {
                            type: 'string',
                            format: 'date-time'
                        },
                        description: 'Start date for filtering'
                    },
                    {
                        name: 'toDate',
                        in: 'query',
                        schema: {
                            type: 'string',
                            format: 'date-time'
                        },
                        description: 'End date for filtering'
                    }
                ],
                responses: {
                    200: {
                        description: 'Quote cycle time summary',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        reportType: {
                                            type: 'string',
                                            example: 'quote_cycle_time'
                                        },
                                        filters: {
                                            type: 'object'
                                        },
                                        summary: {
                                            type: 'object'
                                        },
                                        generatedAt: {
                                            type: 'string',
                                            format: 'date-time'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            }
        },
        // Portal
        '/portal/quotes': {
            get: {
                tags: ['Portal'],
                summary: 'List portal quotes',
                description: 'Retrieve quotes for customer portal',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/PageSizeParam' },
                    { $ref: '#/components/parameters/SearchParam' },
                    { $ref: '#/components/parameters/SortByParam' },
                    { $ref: '#/components/parameters/SortOrderParam' },
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['draft', 'sent', 'accepted', 'rejected', 'expired']
                        },
                        description: 'Filter by status'
                    }
                ],
                responses: {
                    200: {
                        description: 'List of portal quotes',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginationEnvelope'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    }
                }
            }
        },
        '/portal/quotes/{id}': {
            get: {
                tags: ['Portal'],
                summary: 'Get portal quote',
                description: 'Get quote details for customer portal',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' }
                ],
                responses: {
                    200: {
                        description: 'Portal quote information',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PortalQuote'
                                }
                            }
                        }
                    },
                    401: {
                        $ref: '#/components/responses/Unauthorized'
                    },
                    403: {
                        $ref: '#/components/responses/Forbidden'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=openapi-schema.js.map