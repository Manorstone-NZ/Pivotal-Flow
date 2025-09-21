import { Type } from '@sinclair/typebox';
// Tenant role enum
export const TenantRoleEnum = Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
]);
// Tenant status enum
export const TenantStatusEnum = Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
]);
// Create Tenant Schema
export const CreateTenantSchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    slug: Type.String({
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-z0-9-]+$',
        description: 'URL-safe tenant identifier (lowercase letters, numbers, and hyphens only)'
    }),
    billingEmail: Type.String({
        format: 'email',
        maxLength: 255
    }),
    defaultCurrency: Type.String({
        minLength: 3,
        maxLength: 3,
        pattern: '^[A-Z]{3}$',
        default: 'USD',
        description: 'ISO 4217 currency code (e.g., USD, EUR, GBP)'
    }),
    timezone: Type.String({
        default: 'UTC',
        maxLength: 50,
        description: 'IANA timezone identifier (e.g., America/New_York, UTC)'
    })
}, {
    additionalProperties: false,
    description: 'Schema for creating a new tenant'
});
// Update Tenant Schema
export const UpdateTenantSchema = Type.Partial(Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    slug: Type.String({
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-z0-9-]+$',
        description: 'URL-safe tenant identifier (lowercase letters, numbers, and hyphens only)'
    }),
    billingEmail: Type.String({
        format: 'email',
        maxLength: 255
    }),
    defaultCurrency: Type.String({
        minLength: 3,
        maxLength: 3,
        pattern: '^[A-Z]{3}$',
        description: 'ISO 4217 currency code (e.g., USD, EUR, GBP)'
    }),
    timezone: Type.String({
        maxLength: 50,
        description: 'IANA timezone identifier (e.g., America/New_York, UTC)'
    }),
    status: TenantStatusEnum
}), {
    additionalProperties: false,
    description: 'Schema for updating tenant properties'
});
// Create Membership Schema
export const CreateMembershipSchema = Type.Object({
    userEmail: Type.String({
        format: 'email',
        maxLength: 255,
        description: 'Email address of the user to add to the tenant'
    }),
    role: TenantRoleEnum
}, {
    additionalProperties: false,
    description: 'Schema for adding a user to a tenant'
});
// Tenant List Query Schema
export const TenantListQuerySchema = Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
    search: Type.Optional(Type.String({
        maxLength: 255,
        description: 'Search term to filter tenants by name, slug, or billing email'
    })),
    status: Type.Optional(TenantStatusEnum),
    sortBy: Type.Optional(Type.Union([
        Type.Literal('name'),
        Type.Literal('slug'),
        Type.Literal('createdAt'),
        Type.Literal('status')
    ], { default: 'createdAt' })),
    sortOrder: Type.Optional(Type.Union([
        Type.Literal('asc'),
        Type.Literal('desc')
    ], { default: 'desc' }))
}, {
    additionalProperties: false,
    description: 'Query parameters for tenant list endpoint'
});
// Response Schemas
export const TenantResponseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    slug: Type.String(),
    billingEmail: Type.String({ format: 'email' }),
    defaultCurrency: Type.String(),
    timezone: Type.String(),
    status: TenantStatusEnum,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    membershipCount: Type.Integer({ minimum: 0 })
}, {
    additionalProperties: false,
    description: 'Tenant response object'
});
export const MembershipResponseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' }),
    userEmail: Type.String({ format: 'email' }),
    userFirstName: Type.String(),
    userLastName: Type.String(),
    role: TenantRoleEnum,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
}, {
    additionalProperties: false,
    description: 'Membership response object'
});
export const TenantListResponseSchema = Type.Object({
    tenants: Type.Array(TenantResponseSchema),
    pagination: Type.Object({
        page: Type.Integer({ minimum: 1 }),
        limit: Type.Integer({ minimum: 1 }),
        total: Type.Integer({ minimum: 0 }),
        pages: Type.Integer({ minimum: 0 })
    })
}, {
    additionalProperties: false,
    description: 'Paginated tenant list response'
});
export const TenantDetailResponseSchema = Type.Object({
    tenant: TenantResponseSchema,
    memberships: Type.Array(MembershipResponseSchema)
}, {
    additionalProperties: false,
    description: 'Detailed tenant response with memberships'
});
// Error Response Schema
export const ErrorResponseSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String(),
    details: Type.Optional(Type.Unknown())
}, {
    additionalProperties: false,
    description: 'Standard error response'
});
//# sourceMappingURL=typeboxSchemas.js.map