import { Type, FormatRegistry } from '@sinclair/typebox';
import type { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

// Configure TypeBox format validators
FormatRegistry.Set('uuid', (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
});

FormatRegistry.Set('email', (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof value === 'string' && emailRegex.test(value);
});

FormatRegistry.Set('date-time', (value) => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  
  // Check if it's a valid ISO 8601 date-time string
  // Accept formats like: 2024-12-31T23:59:59Z, 2024-12-31T23:59:59.000Z, 2024-12-31T23:59:59+00:00
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
  return iso8601Regex.test(value);
});

FormatRegistry.Set('date', (value) => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString().split('T')[0];
});

FormatRegistry.Set('time', (value) => {
  if (typeof value !== 'string') return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?$/;
  return timeRegex.test(value);
});

FormatRegistry.Set('uri', (value) => {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
});

FormatRegistry.Set('hostname', (value) => {
  if (typeof value !== 'string') return false;
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(value) && value.length <= 253;
});

FormatRegistry.Set('ipv4', (value) => {
  if (typeof value !== 'string') return false;
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(value);
});

FormatRegistry.Set('ipv6', (value) => {
  if (typeof value !== 'string') return false;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(value);
});

// Base schemas for common types
export const BaseSchemas = {
  // Common field schemas
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  
  // Timestamp schemas
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  
  // Pagination schemas
  paginationQuery: Type.Object({
    page: Type.Number({ minimum: 1, default: 1 }),
    limit: Type.Number({ minimum: 1, maximum: 100, default: 20 }),
    sort: Type.Optional(Type.String()),
    order: Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' }),
  }),
  
  paginationResponse: Type.Object({
    page: Type.Number({ minimum: 1 }),
    limit: Type.Number({ minimum: 1 }),
    total: Type.Number({ minimum: 0 }),
    totalPages: Type.Number({ minimum: 0 }),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
  
  // Error response schema
  errorResponse: Type.Object({
    error: Type.String(),
    message: Type.String(),
    statusCode: Type.Number(),
    timestamp: Type.String({ format: 'date-time' }),
    path: Type.String(),
  }),
};

// User schemas
const UserRoleSchema = Type.Union([
  Type.Literal('admin'),
  Type.Literal('manager'),
  Type.Literal('user'),
  Type.Literal('customer')
]);

const UserSchema = Type.Object({
  id: BaseSchemas.id,
  email: BaseSchemas.email,
  name: BaseSchemas.name,
  role: UserRoleSchema,
  isActive: Type.Boolean(),
  createdAt: BaseSchemas.createdAt,
  updatedAt: BaseSchemas.updatedAt,
});

export const UserSchemas = {
  user: UserSchema,
  
  createUser: Type.Object({
    email: BaseSchemas.email,
    name: BaseSchemas.name,
    password: BaseSchemas.password,
    role: Type.Union([UserRoleSchema], { default: 'user' }),
  }),
  
  updateUser: Type.Object({
    name: Type.Optional(BaseSchemas.name),
    email: Type.Optional(BaseSchemas.email),
    role: Type.Optional(UserRoleSchema),
    isActive: Type.Optional(Type.Boolean()),
  }),
  
  loginRequest: Type.Object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
  }),
  
  loginResponse: Type.Object({
    user: UserSchema,
    accessToken: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.Number(),
  }),
};

// Quote schemas
export const QuoteSchemas = {
  quote: Type.Object({
    id: BaseSchemas.id,
    quoteNumber: Type.String(),
    customerId: BaseSchemas.id,
    projectId: Type.Optional(BaseSchemas.id),
    status: Type.Union([
      Type.Literal('draft'),
      Type.Literal('sent'),
      Type.Literal('approved'),
      Type.Literal('rejected'),
      Type.Literal('accepted')
    ]),
    totalAmount: Type.Number({ exclusiveMinimum: 0 }),
    currency: Type.String({ minLength: 3, maxLength: 3, default: 'USD' }),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
    notes: BaseSchemas.description,
    createdAt: BaseSchemas.createdAt,
    updatedAt: BaseSchemas.updatedAt,
  }),
  
  quoteLineItem: Type.Object({
    id: BaseSchemas.id,
    quoteId: BaseSchemas.id,
    description: Type.String({ minLength: 1 }),
    quantity: Type.Number({ exclusiveMinimum: 0 }),
    unitPrice: Type.Number({ exclusiveMinimum: 0 }),
    totalPrice: Type.Number({ exclusiveMinimum: 0 }),
    serviceCategoryId: Type.Optional(BaseSchemas.id),
    createdAt: BaseSchemas.createdAt,
    updatedAt: BaseSchemas.updatedAt,
  }),
  
  createQuote: Type.Object({
    customerId: BaseSchemas.id,
    projectId: Type.Optional(BaseSchemas.id),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
    notes: BaseSchemas.description,
    lineItems: Type.Array(Type.Object({
      description: Type.String({ minLength: 1 }),
      quantity: Type.Number({ exclusiveMinimum: 0 }),
      unitPrice: Type.Number({ exclusiveMinimum: 0 }),
      serviceCategoryId: Type.Optional(BaseSchemas.id),
    }), { minItems: 1 }),
  }),
  
  updateQuote: Type.Object({
    status: Type.Optional(Type.Union([
      Type.Literal('draft'),
      Type.Literal('sent'),
      Type.Literal('approved'),
      Type.Literal('rejected'),
      Type.Literal('accepted')
    ])),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
    notes: Type.Optional(BaseSchemas.description),
  }),
};

// Rate Card schemas
export const RateCardSchemas = {
  rateCard: Type.Object({
    id: BaseSchemas.id,
    name: Type.String({ minLength: 1 }),
    description: BaseSchemas.description,
    isActive: Type.Boolean(),
    effectiveFrom: Type.String({ format: 'date-time' }),
    effectiveUntil: Type.Optional(Type.String({ format: 'date-time' })),
    createdAt: BaseSchemas.createdAt,
    updatedAt: BaseSchemas.updatedAt,
  }),
  
  rateCardItem: Type.Object({
    id: BaseSchemas.id,
    rateCardId: BaseSchemas.id,
    serviceCategoryId: BaseSchemas.id,
    itemCode: Type.String({ minLength: 1 }),
    unit: Type.String({ minLength: 1 }),
    baseRate: Type.Number({ exclusiveMinimum: 0 }),
    currency: Type.String({ minLength: 3, maxLength: 3, default: 'USD' }),
    taxClass: Type.String({ default: 'standard' }),
    isActive: Type.Boolean(),
    createdAt: BaseSchemas.createdAt,
    updatedAt: BaseSchemas.updatedAt,
  }),
  
  createRateCard: Type.Object({
    name: Type.String({ minLength: 1 }),
    description: BaseSchemas.description,
    effectiveFrom: Type.String({ format: 'date-time' }),
    effectiveUntil: Type.Optional(Type.String({ format: 'date-time' })),
  }),
};

// Service Category schemas
export const ServiceCategorySchemas = {
  serviceCategory: Type.Object({
    id: BaseSchemas.id,
    name: Type.String({ minLength: 1 }),
    description: BaseSchemas.description,
    isActive: Type.Boolean(),
    createdAt: BaseSchemas.createdAt,
    updatedAt: BaseSchemas.updatedAt,
  }),
  
  createServiceCategory: Type.Object({
    name: Type.String({ minLength: 1 }),
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
    response: Type.Object({
      accessToken: Type.String(),
      expiresIn: Type.Number(),
    }),
    body: Type.Object({
      refreshToken: Type.String(),
    }),
  },
  {
    method: 'post',
    path: '/api/v1/auth/logout',
    parameters: [],
    response: Type.Object({
      message: Type.String(),
    }),
    body: Type.Object({}),
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
    response: Type.Object({
      data: Type.Array(UserSchemas.user),
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
        schema: Type.Intersect([
          BaseSchemas.paginationQuery,
          Type.Object({
            status: Type.Optional(Type.Union([
              Type.Literal('draft'),
              Type.Literal('sent'),
              Type.Literal('approved'),
              Type.Literal('rejected'),
              Type.Literal('accepted')
            ])),
            customerId: Type.Optional(BaseSchemas.id),
          })
        ]),
      },
    ],
    response: Type.Object({
      data: Type.Array(QuoteSchemas.quote),
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
    response: Type.Intersect([
      QuoteSchemas.quote,
      Type.Object({
        lineItems: Type.Array(QuoteSchemas.quoteLineItem),
      })
    ]),
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
        schema: Type.Intersect([
          BaseSchemas.paginationQuery,
          Type.Object({
            isActive: Type.Optional(Type.Boolean()),
          })
        ]),
      },
    ],
    response: Type.Object({
      data: Type.Array(RateCardSchemas.rateCard),
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
    response: Type.Intersect([
      RateCardSchemas.rateCard,
      Type.Object({
        items: Type.Array(RateCardSchemas.rateCardItem),
      })
    ]),
  },
  
  // Service Category endpoints
  {
    method: 'get',
    path: '/api/v1/service-categories',
    parameters: [
      {
        name: 'query',
        schema: Type.Intersect([
          BaseSchemas.paginationQuery,
          Type.Object({
            isActive: Type.Optional(Type.Boolean()),
          })
        ]),
      },
    ],
    response: Type.Object({
      data: Type.Array(ServiceCategorySchemas.serviceCategory),
      pagination: BaseSchemas.paginationResponse,
    }),
  },
] as const;

// Contract validation utilities
export const ContractValidator = {
  // Validate a single API response
  validateResponse: <T extends TSchema>(schema: T, data: unknown): Static<T> => {
    const result = Value.Check(schema, data);
    if (!result) {
      const errors = [...Value.Errors(schema, data)];
      throw new Error(`Contract validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    return data as Static<T>;
  },
  
  // Validate a single API request
  validateRequest: <T extends TSchema>(schema: T, data: unknown): Static<T> => {
    const result = Value.Check(schema, data);
    if (!result) {
      const errors = [...Value.Errors(schema, data)];
      throw new Error(`Contract validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    return data as Static<T>;
  },
  
  // Check if data matches schema (non-throwing)
  isValid: <T extends TSchema>(schema: T, data: unknown): data is Static<T> => {
    return Value.Check(schema, data);
  },
  
  // Get validation errors (non-throwing)
  getErrors: <T extends TSchema>(schema: T, data: unknown): string[] | null => {
    const result = Value.Check(schema, data);
    if (result) return null;
    
    const errors = [...Value.Errors(schema, data)];
    return errors.map(e => e.message);
  },
  
  // Convert TypeBox schema to JSON Schema
  toJsonSchema: <T extends TSchema>(schema: T) => {
    return Value.Create(schema);
  },
};

export default ContractValidator;
