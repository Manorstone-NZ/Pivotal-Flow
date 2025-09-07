import { z } from 'zod';
import { Zodios } from '@zodios/core';
import { ZodiosPlugin } from '@zodios/core';
// Base schemas for common types
export const BaseSchemas = {
    // Common field schemas
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    description: z.string().optional(),
    // Timestamp schemas
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    // Pagination schemas
    paginationQuery: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        sort: z.string().optional(),
        order: z.enum(['asc', 'desc']).default('desc'),
    }),
    paginationResponse: z.object({
        page: z.number().int().min(1),
        limit: z.number().int().min(1),
        total: z.number().int().min(0),
        totalPages: z.number().int().min(0),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
    // Error response schema
    errorResponse: z.object({
        error: z.string(),
        message: z.string(),
        statusCode: z.number().int(),
        timestamp: z.string().datetime(),
        path: z.string(),
    }),
};
// User schemas
export const UserSchemas = {
    user: z.object({
        id: BaseSchemas.id,
        email: BaseSchemas.email,
        name: BaseSchemas.name,
        role: z.enum(['admin', 'manager', 'user', 'customer']),
        isActive: z.boolean(),
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    createUser: z.object({
        email: BaseSchemas.email,
        name: BaseSchemas.name,
        password: BaseSchemas.password,
        role: z.enum(['admin', 'manager', 'user', 'customer']).default('user'),
    }),
    updateUser: z.object({
        name: BaseSchemas.name.optional(),
        email: BaseSchemas.email.optional(),
        role: z.enum(['admin', 'manager', 'user', 'customer']).optional(),
        isActive: z.boolean().optional(),
    }),
    loginRequest: z.object({
        email: BaseSchemas.email,
        password: BaseSchemas.password,
    }),
    loginResponse: z.object({
        user: UserSchemas.user,
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number().int(),
    }),
};
// Quote schemas
export const QuoteSchemas = {
    quote: z.object({
        id: BaseSchemas.id,
        quoteNumber: z.string(),
        customerId: BaseSchemas.id,
        projectId: BaseSchemas.id.optional(),
        status: z.enum(['draft', 'sent', 'approved', 'rejected', 'accepted']),
        totalAmount: z.number().positive(),
        currency: z.string().length(3).default('USD'),
        validUntil: z.string().datetime().optional(),
        notes: BaseSchemas.description,
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    quoteLineItem: z.object({
        id: BaseSchemas.id,
        quoteId: BaseSchemas.id,
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        totalPrice: z.number().positive(),
        serviceCategoryId: BaseSchemas.id.optional(),
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    createQuote: z.object({
        customerId: BaseSchemas.id,
        projectId: BaseSchemas.id.optional(),
        validUntil: z.string().datetime().optional(),
        notes: BaseSchemas.description,
        lineItems: z.array(z.object({
            description: z.string().min(1),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            serviceCategoryId: BaseSchemas.id.optional(),
        })).min(1),
    }),
    updateQuote: z.object({
        status: z.enum(['draft', 'sent', 'approved', 'rejected', 'accepted']).optional(),
        validUntil: z.string().datetime().optional(),
        notes: BaseSchemas.description.optional(),
    }),
};
// Rate Card schemas
export const RateCardSchemas = {
    rateCard: z.object({
        id: BaseSchemas.id,
        name: z.string().min(1),
        description: BaseSchemas.description,
        isActive: z.boolean(),
        effectiveFrom: z.string().datetime(),
        effectiveUntil: z.string().datetime().optional(),
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    rateCardItem: z.object({
        id: BaseSchemas.id,
        rateCardId: BaseSchemas.id,
        serviceCategoryId: BaseSchemas.id,
        itemCode: z.string().min(1),
        unit: z.string().min(1),
        baseRate: z.number().positive(),
        currency: z.string().length(3).default('USD'),
        taxClass: z.string().default('standard'),
        isActive: z.boolean(),
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    createRateCard: z.object({
        name: z.string().min(1),
        description: BaseSchemas.description,
        effectiveFrom: z.string().datetime(),
        effectiveUntil: z.string().datetime().optional(),
    }),
};
// Service Category schemas
export const ServiceCategorySchemas = {
    serviceCategory: z.object({
        id: BaseSchemas.id,
        name: z.string().min(1),
        description: BaseSchemas.description,
        isActive: z.boolean(),
        createdAt: BaseSchemas.createdAt,
        updatedAt: BaseSchemas.updatedAt,
    }),
    createServiceCategory: z.object({
        name: z.string().min(1),
        description: BaseSchemas.description,
    }),
};
// API endpoint definitions for contract validation
export const ApiEndpoints = [
    // Auth endpoints
    {
        method: 'post',
        path: '/api/v1/auth/login',
        parameters: [],
        response: UserSchemas.loginResponse,
        body: UserSchemas.loginRequest,
    },
    {
        method: 'post',
        path: '/api/v1/auth/refresh',
        parameters: [],
        response: z.object({
            accessToken: z.string(),
            expiresIn: z.number().int(),
        }),
        body: z.object({
            refreshToken: z.string(),
        }),
    },
    {
        method: 'post',
        path: '/api/v1/auth/logout',
        parameters: [],
        response: z.object({
            message: z.string(),
        }),
        body: z.object({}),
    },
    // User endpoints
    {
        method: 'get',
        path: '/api/v1/users',
        parameters: [
            {
                name: 'query',
                schema: BaseSchemas.paginationQuery,
            },
        ],
        response: z.object({
            data: z.array(UserSchemas.user),
            pagination: BaseSchemas.paginationResponse,
        }),
    },
    {
        method: 'get',
        path: '/api/v1/users/:id',
        parameters: [
            {
                name: 'id',
                schema: BaseSchemas.id,
            },
        ],
        response: UserSchemas.user,
    },
    {
        method: 'post',
        path: '/api/v1/users',
        parameters: [],
        response: UserSchemas.user,
        body: UserSchemas.createUser,
    },
    {
        method: 'put',
        path: '/api/v1/users/:id',
        parameters: [
            {
                name: 'id',
                schema: BaseSchemas.id,
            },
        ],
        response: UserSchemas.user,
        body: UserSchemas.updateUser,
    },
    // Quote endpoints
    {
        method: 'get',
        path: '/api/v1/quotes',
        parameters: [
            {
                name: 'query',
                schema: BaseSchemas.paginationQuery.extend({
                    status: z.enum(['draft', 'sent', 'approved', 'rejected', 'accepted']).optional(),
                    customerId: BaseSchemas.id.optional(),
                }),
            },
        ],
        response: z.object({
            data: z.array(QuoteSchemas.quote),
            pagination: BaseSchemas.paginationResponse,
        }),
    },
    {
        method: 'get',
        path: '/api/v1/quotes/:id',
        parameters: [
            {
                name: 'id',
                schema: BaseSchemas.id,
            },
        ],
        response: QuoteSchemas.quote.extend({
            lineItems: z.array(QuoteSchemas.quoteLineItem),
        }),
    },
    {
        method: 'post',
        path: '/api/v1/quotes',
        parameters: [],
        response: QuoteSchemas.quote,
        body: QuoteSchemas.createQuote,
    },
    {
        method: 'put',
        path: '/api/v1/quotes/:id',
        parameters: [
            {
                name: 'id',
                schema: BaseSchemas.id,
            },
        ],
        response: QuoteSchemas.quote,
        body: QuoteSchemas.updateQuote,
    },
    // Rate Card endpoints
    {
        method: 'get',
        path: '/api/v1/rate-cards',
        parameters: [
            {
                name: 'query',
                schema: BaseSchemas.paginationQuery.extend({
                    isActive: z.boolean().optional(),
                }),
            },
        ],
        response: z.object({
            data: z.array(RateCardSchemas.rateCard),
            pagination: BaseSchemas.paginationResponse,
        }),
    },
    {
        method: 'get',
        path: '/api/v1/rate-cards/:id',
        parameters: [
            {
                name: 'id',
                schema: BaseSchemas.id,
            },
        ],
        response: RateCardSchemas.rateCard.extend({
            items: z.array(RateCardSchemas.rateCardItem),
        }),
    },
    // Service Category endpoints
    {
        method: 'get',
        path: '/api/v1/service-categories',
        parameters: [
            {
                name: 'query',
                schema: BaseSchemas.paginationQuery.extend({
                    isActive: z.boolean().optional(),
                }),
            },
        ],
        response: z.object({
            data: z.array(ServiceCategorySchemas.serviceCategory),
            pagination: BaseSchemas.paginationResponse,
        }),
    },
];
// Create Zodios instance for contract validation
export const createContractValidator = (baseURL) => {
    const api = new Zodios(baseURL, ApiEndpoints);
    // Add validation plugin
    const validationPlugin = {
        name: 'contract-validation',
        request: async (config, next) => {
            // Validate request parameters and body
            try {
                const endpoint = api.findEndpoint(config.method, config.url);
                if (endpoint) {
                    // Validate parameters
                    if (endpoint.parameters) {
                        for (const param of endpoint.parameters) {
                            if (param.schema) {
                                param.schema.parse(config.params?.[param.name]);
                            }
                        }
                    }
                    // Validate body
                    if (endpoint.body && config.data) {
                        endpoint.body.parse(config.data);
                    }
                }
            }
            catch (error) {
                throw new Error(`Contract validation failed for request: ${error}`);
            }
            return next(config);
        },
        response: async (config, response, next) => {
            // Validate response
            try {
                const endpoint = api.findEndpoint(config.method, config.url);
                if (endpoint && endpoint.response) {
                    endpoint.response.parse(response.data);
                }
            }
            catch (error) {
                console.warn(`Contract validation failed for response: ${error}`);
                // Don't throw in production, just log warning
                if (process.env.NODE_ENV === 'development') {
                    throw new Error(`Contract validation failed for response: ${error}`);
                }
            }
            return next(config, response);
        },
    };
    api.use(validationPlugin);
    return api;
};
// Contract validation utilities
export const ContractValidator = {
    // Validate a single API response
    validateResponse: (schema, data) => {
        return schema.parse(data);
    },
    // Validate a single API request
    validateRequest: (schema, data) => {
        return schema.parse(data);
    },
    // Check if data matches schema (non-throwing)
    isValid: (schema, data) => {
        return schema.safeParse(data).success;
    },
    // Get validation errors (non-throwing)
    getErrors: (schema, data) => {
        const result = schema.safeParse(data);
        return result.success ? null : result.error;
    },
};
export default ContractValidator;
//# sourceMappingURL=validation.js.map