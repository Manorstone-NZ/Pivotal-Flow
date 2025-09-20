/**
 * Organization module TypeBox schemas
 * Request/response validation schemas for organization endpoints
 */
import { Type } from '@sinclair/typebox';
// Core organization schemas
export const OrganizationResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    slug: Type.String(),
    domain: Type.Optional(Type.String()),
    industry: Type.Optional(Type.String()),
    size: Type.Optional(Type.String()),
    timezone: Type.String(),
    currency: Type.String(),
    taxId: Type.Optional(Type.String()),
    // Address fields
    street: Type.Optional(Type.String()),
    suburb: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    postcode: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    // Contact fields
    phone: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    website: Type.Optional(Type.Union([
        Type.String({ format: 'uri' }),
        Type.String({ maxLength: 0 }) // Allow empty string
    ])),
    // Metadata
    contactExtras: Type.Optional(Type.Any()),
    settings: Type.Any(),
    subscriptionPlan: Type.String(),
    subscriptionStatus: Type.String(),
    trialEndsAt: Type.Optional(Type.String()),
    createdAt: Type.String(),
    updatedAt: Type.String(),
    deletedAt: Type.Optional(Type.String()),
});
// Request schemas
export const CreateOrganizationBodySchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    slug: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    domain: Type.Optional(Type.String({ maxLength: 255 })),
    industry: Type.Optional(Type.String({ maxLength: 100 })),
    size: Type.Optional(Type.String({ maxLength: 50 })),
    timezone: Type.Optional(Type.String({ maxLength: 50 })),
    currency: Type.Optional(Type.String({ minLength: 3, maxLength: 3 })),
    taxId: Type.Optional(Type.String({ maxLength: 100 })),
    // Address fields
    street: Type.Optional(Type.String()),
    suburb: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    postcode: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    // Contact fields
    phone: Type.Optional(Type.String({ maxLength: 20 })),
    email: Type.Optional(Type.String({ format: 'email', maxLength: 255 })),
    website: Type.Optional(Type.Union([
        Type.String({ format: 'uri' }),
        Type.String({ maxLength: 0 }) // Allow empty string
    ])),
    // Settings
    settings: Type.Optional(Type.Any()),
    subscriptionPlan: Type.Optional(Type.String({ maxLength: 50 })),
});
export const UpdateOrganizationBodySchema = Type.Partial(CreateOrganizationBodySchema);
export const InviteUserBodySchema = Type.Object({
    email: Type.String({ format: 'email' }),
    roleIds: Type.Array(Type.String()),
    firstName: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    lastName: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});
export const OrganizationSettingsBodySchema = Type.Object({
    settings: Type.Any(),
});
// Response schemas
export const StandardSuccessResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.Optional(Type.String()),
});
export const ErrorResponseSchema = Type.Object({
    success: Type.Literal(false),
    error: Type.String(),
    message: Type.String(),
    code: Type.Optional(Type.String()),
    details: Type.Optional(Type.Any()),
});
// Parameter schemas
export const OrganizationIdParamSchema = Type.Object({
    id: Type.String(),
});
export const OrganizationQuerystringSchema = Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    search: Type.Optional(Type.String()),
    industry: Type.Optional(Type.String()),
    size: Type.Optional(Type.String()),
    subscriptionPlan: Type.Optional(Type.String()),
    subscriptionStatus: Type.Optional(Type.Union([
        Type.Literal('active'),
        Type.Literal('inactive'),
        Type.Literal('trial'),
        Type.Literal('expired'),
    ])),
    sortBy: Type.Optional(Type.String()),
    sortOrder: Type.Optional(Type.Union([
        Type.Literal('asc'),
        Type.Literal('desc'),
    ])),
});
// List response schema
export const OrganizationListResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Array(OrganizationResponseSchema),
    pagination: Type.Object({
        page: Type.Number(),
        limit: Type.Number(),
        total: Type.Number(),
        totalPages: Type.Number(),
    }),
});
// Detail response schema
export const OrganizationDetailResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: OrganizationResponseSchema,
});
// Settings response schema
export const OrganizationSettingsResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Any(),
});
// Invite response schema
export const InviteUserResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        inviteId: Type.String(),
        email: Type.String(),
    }),
});
//# sourceMappingURL=schemas.js.map