/**
 * OpenAPI Schema for Pivotal Flow API
 * C0 Backend Readiness - Complete API documentation
 */
export declare const openApiSchema: {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
        contact: {
            name: string;
            email: string;
            url: string;
        };
        license: {
            name: string;
            url: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    security: {
        bearerAuth: never[];
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
                description: string;
            };
        };
        schemas: {
            ErrorResponse: {
                type: string;
                required: string[];
                properties: {
                    error: {
                        type: string;
                        required: string[];
                        properties: {
                            code: {
                                type: string;
                                description: string;
                                example: string;
                            };
                            message: {
                                type: string;
                                description: string;
                                example: string;
                            };
                            details: {
                                type: string;
                                description: string;
                                example: {
                                    field: string;
                                    message: string;
                                    value: string;
                                };
                            };
                            timestamp: {
                                type: string;
                                format: string;
                                description: string;
                                example: string;
                            };
                            request_id: {
                                type: string;
                                description: string;
                                example: string;
                            };
                        };
                    };
                    meta: {
                        type: string;
                        properties: {
                            api_version: {
                                type: string;
                                example: string;
                            };
                            documentation_url: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                };
            };
            PaginationEnvelope: {
                type: string;
                required: string[];
                properties: {
                    items: {
                        type: string;
                        description: string;
                    };
                    pagination: {
                        type: string;
                        required: string[];
                        properties: {
                            page: {
                                type: string;
                                minimum: number;
                                description: string;
                                example: number;
                            };
                            pageSize: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                                example: number;
                            };
                            total: {
                                type: string;
                                minimum: number;
                                description: string;
                                example: number;
                            };
                            totalPages: {
                                type: string;
                                minimum: number;
                                description: string;
                                example: number;
                            };
                            hasNext: {
                                type: string;
                                description: string;
                                example: boolean;
                            };
                            hasPrev: {
                                type: string;
                                description: string;
                                example: boolean;
                            };
                        };
                    };
                    meta: {
                        type: string;
                        properties: {
                            organization_id: {
                                type: string;
                                format: string;
                                description: string;
                            };
                            filtered_count: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                };
            };
            CommonFilters: {
                type: string;
                properties: {
                    page: {
                        type: string;
                        minimum: number;
                        default: number;
                        description: string;
                    };
                    pageSize: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    search: {
                        type: string;
                        description: string;
                    };
                    sortBy: {
                        type: string;
                        description: string;
                    };
                    sortOrder: {
                        type: string;
                        enum: string[];
                        default: string;
                        description: string;
                    };
                };
            };
            User: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    firstName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    lastName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    role: {
                        type: string;
                        description: string;
                    };
                    organizationId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    phoneNumber: {
                        type: string;
                        description: string;
                    };
                    timezone: {
                        type: string;
                        description: string;
                    };
                    locale: {
                        type: string;
                        description: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
            CreateUserRequest: {
                type: string;
                required: string[];
                properties: {
                    email: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    firstName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    lastName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    password: {
                        type: string;
                        minLength: number;
                        description: string;
                    };
                    roleId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    organizationId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    phoneNumber: {
                        type: string;
                        description: string;
                    };
                    timezone: {
                        type: string;
                        description: string;
                    };
                    locale: {
                        type: string;
                        description: string;
                    };
                };
            };
            UpdateUserRequest: {
                type: string;
                properties: {
                    firstName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    lastName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    phoneNumber: {
                        type: string;
                        description: string;
                    };
                    timezone: {
                        type: string;
                        description: string;
                    };
                    locale: {
                        type: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                };
            };
            Quote: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    quoteNumber: {
                        type: string;
                        description: string;
                    };
                    title: {
                        type: string;
                        description: string;
                    };
                    description: {
                        type: string;
                        description: string;
                    };
                    customerId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    projectId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    validFrom: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    validUntil: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    currency: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    totalAmount: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
            CreateQuoteRequest: {
                type: string;
                required: string[];
                properties: {
                    title: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    description: {
                        type: string;
                        description: string;
                    };
                    customerId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    projectId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    validFrom: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    validUntil: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    currency: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    lineItems: {
                        type: string;
                        minItems: number;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    termsConditions: {
                        type: string;
                        description: string;
                    };
                    notes: {
                        type: string;
                        description: string;
                    };
                    internalNotes: {
                        type: string;
                        description: string;
                    };
                };
            };
            QuoteLineItem: {
                type: string;
                required: string[];
                properties: {
                    description: {
                        type: string;
                        minLength: number;
                        description: string;
                    };
                    quantity: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    unitPrice: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    serviceCategoryId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    rateCardId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
            LoginRequest: {
                type: string;
                required: string[];
                properties: {
                    email: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    password: {
                        type: string;
                        minLength: number;
                        description: string;
                    };
                    mfaCode: {
                        type: string;
                        description: string;
                    };
                    rememberMe: {
                        type: string;
                        default: boolean;
                        description: string;
                    };
                };
            };
            LoginResponse: {
                type: string;
                required: string[];
                properties: {
                    accessToken: {
                        type: string;
                        description: string;
                    };
                    refreshToken: {
                        type: string;
                        description: string;
                    };
                    tokenType: {
                        type: string;
                        enum: string[];
                        default: string;
                        description: string;
                    };
                    expiresIn: {
                        type: string;
                        description: string;
                    };
                    user: {
                        $ref: string;
                    };
                    mfaRequired: {
                        type: string;
                        description: string;
                    };
                };
            };
            Permission: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    name: {
                        type: string;
                        description: string;
                    };
                    resource: {
                        type: string;
                        description: string;
                    };
                    action: {
                        type: string;
                        description: string;
                    };
                    description: {
                        type: string;
                        description: string;
                    };
                };
            };
            Role: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    name: {
                        type: string;
                        description: string;
                    };
                    description: {
                        type: string;
                        description: string;
                    };
                    permissions: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                };
            };
            ExportJob: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    organizationId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    userId: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    reportType: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    format: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    filters: {
                        type: string;
                        description: string;
                    };
                    fileName: {
                        type: string;
                        description: string;
                    };
                    totalRows: {
                        type: string;
                        description: string;
                    };
                    processedRows: {
                        type: string;
                        description: string;
                    };
                    downloadUrl: {
                        type: string;
                        description: string;
                    };
                    errorMessage: {
                        type: string;
                        description: string;
                    };
                    startedAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    completedAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
            CreateExportJobRequest: {
                type: string;
                required: string[];
                properties: {
                    reportType: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    format: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    filters: {
                        type: string;
                        description: string;
                    };
                    fileName: {
                        type: string;
                        description: string;
                    };
                };
            };
            PortalQuote: {
                type: string;
                required: string[];
                properties: {
                    id: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    quoteNumber: {
                        type: string;
                        description: string;
                    };
                    title: {
                        type: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    totalAmount: {
                        type: string;
                        description: string;
                    };
                    currency: {
                        type: string;
                        description: string;
                    };
                    validFrom: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    validUntil: {
                        type: string;
                        format: string;
                        description: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
        };
        parameters: {
            PageParam: {
                name: string;
                in: string;
                schema: {
                    type: string;
                    minimum: number;
                    default: number;
                };
                description: string;
            };
            PageSizeParam: {
                name: string;
                in: string;
                schema: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                description: string;
            };
            SearchParam: {
                name: string;
                in: string;
                schema: {
                    type: string;
                };
                description: string;
            };
            SortByParam: {
                name: string;
                in: string;
                schema: {
                    type: string;
                };
                description: string;
            };
            SortOrderParam: {
                name: string;
                in: string;
                schema: {
                    type: string;
                    enum: string[];
                    default: string;
                };
                description: string;
            };
            OrganizationIdParam: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    format: string;
                };
                description: string;
            };
            IdParam: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    format: string;
                };
                description: string;
            };
        };
        responses: {
            BadRequest: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            Unauthorized: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            Forbidden: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            NotFound: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            TooManyRequests: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
                headers: {
                    'X-RateLimit-Limit': {
                        schema: {
                            type: string;
                        };
                        description: string;
                    };
                    'X-RateLimit-Remaining': {
                        schema: {
                            type: string;
                        };
                        description: string;
                    };
                    'X-RateLimit-Reset': {
                        schema: {
                            type: string;
                        };
                        description: string;
                    };
                };
            };
            InternalServerError: {
                description: string;
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
        };
    };
    paths: {
        '/health': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        status: {
                                            type: string;
                                            example: string;
                                        };
                                        timestamp: {
                                            type: string;
                                            format: string;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                        version: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/auth/login': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    429: {
                        $ref: string;
                    };
                };
            };
        };
        '/auth/refresh': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    refreshToken: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        accessToken: {
                                            type: string;
                                        };
                                        tokenType: {
                                            type: string;
                                            enum: string[];
                                        };
                                        expiresIn: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                };
            };
        };
        '/auth/logout': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    refreshToken: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                        success: {
                                            type: string;
                                            example: boolean;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                };
            };
        };
        '/auth/me': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    401: {
                        $ref: string;
                    };
                };
            };
        };
        '/users': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    $ref: string;
                    name?: never;
                    in?: never;
                    schema?: never;
                    description?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum?: never;
                    };
                    description: string;
                    $ref?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                    };
                    description: string;
                    $ref?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        user: {
                                            $ref: string;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    409: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/users/{id}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    $ref: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    404: {
                        $ref: string;
                    };
                };
            };
            put: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    $ref: string;
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        user: {
                                            $ref: string;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    404: {
                        $ref: string;
                    };
                };
            };
        };
        '/quotes': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    $ref: string;
                    name?: never;
                    in?: never;
                    schema?: never;
                    description?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                        format?: never;
                    };
                    description: string;
                    $ref?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        enum?: never;
                    };
                    description: string;
                    $ref?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        quote: {
                                            $ref: string;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
        };
        '/quotes/{id}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    $ref: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    404: {
                        $ref: string;
                    };
                };
            };
        };
        '/reports/export': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        jobId: {
                                            type: string;
                                            format: string;
                                        };
                                        status: {
                                            type: string;
                                            example: string;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
        };
        '/reports/export/{id}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    $ref: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        job: {
                                            $ref: string;
                                        };
                                        progress: {
                                            type: string;
                                            properties: {
                                                percentage: {
                                                    type: string;
                                                };
                                                status: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    404: {
                        $ref: string;
                    };
                };
            };
        };
        '/reports/summary/quote-cycle-time': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    $ref: string;
                    name?: never;
                    in?: never;
                    schema?: never;
                    description?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                    };
                    description: string;
                    $ref?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        reportType: {
                                            type: string;
                                            example: string;
                                        };
                                        filters: {
                                            type: string;
                                        };
                                        summary: {
                                            type: string;
                                        };
                                        generatedAt: {
                                            type: string;
                                            format: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
        };
        '/portal/quotes': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    $ref: string;
                    name?: never;
                    in?: never;
                    schema?: never;
                    description?: never;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                    };
                    description: string;
                    $ref?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        $ref: string;
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                };
            };
        };
        '/portal/quotes/{id}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    $ref: string;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    401: {
                        $ref: string;
                    };
                    403: {
                        $ref: string;
                    };
                    404: {
                        $ref: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=openapi-schema.d.ts.map