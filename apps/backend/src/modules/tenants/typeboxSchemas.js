/**
 * F1 Tenant Administration - TypeBox Schemas
 * TypeBox schemas for tenant CRUD and membership management
 */
import { Type } from '@sinclair/typebox';
// ============================================================================
// TENANT SCHEMAS
// ============================================================================
export const TenantStatus = Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
]);
export const TenantSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ minLength: 1, maxLength: 255 }),
    slug: Type.String({ minLength: 1, maxLength: 100, pattern: '^[a-z0-9-]+$' }),
    billingEmail: Type.String({ format: 'email', maxLength: 255 }),
    defaultCurrency: Type.String({ minLength: 3, maxLength: 3, pattern: '^[A-Z]{3}$' }),
    timezone: Type.String({ maxLength: 50 }),
    status: TenantStatus,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});
export const CreateTenantSchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    slug: Type.String({ minLength: 1, maxLength: 100, pattern: '^[a-z0-9-]+$' }),
    billingEmail: Type.String({ format: 'email', maxLength: 255 }),
    defaultCurrency: Type.Optional(Type.String({ minLength: 3, maxLength: 3, pattern: '^[A-Z]{3}$', default: 'USD' })),
    timezone: Type.Optional(Type.String({ maxLength: 50, default: 'UTC' })),
});
export const UpdateTenantSchema = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    billingEmail: Type.Optional(Type.String({ format: 'email', maxLength: 255 })),
    defaultCurrency: Type.Optional(Type.String({ minLength: 3, maxLength: 3, pattern: '^[A-Z]{3}$' })),
    timezone: Type.Optional(Type.String({ maxLength: 50 })),
    status: Type.Optional(TenantStatus),
});
// ============================================================================
// MEMBERSHIP SCHEMAS
// ============================================================================
export const MembershipRole = Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
]);
export const MembershipSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' }),
    tenantId: Type.String({ format: 'uuid' }),
    role: MembershipRole,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    // Populated fields
    user: Type.Optional(Type.Object({
        id: Type.String({ format: 'uuid' }),
        email: Type.String({ format: 'email' }),
        firstName: Type.String(),
        lastName: Type.String(),
    })),
});
export const CreateMembershipSchema = Type.Object({
    userId: Type.String({ format: 'uuid' }),
    role: MembershipRole,
});
export const UpdateMembershipSchema = Type.Object({
    role: MembershipRole,
});
// ============================================================================
// TENANT FEATURES SCHEMAS
// ============================================================================
export const TenantFeatureSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    tenantId: Type.String({ format: 'uuid' }),
    featureCode: Type.String({ minLength: 1, maxLength: 50 }),
    enabled: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});
export const UpdateTenantFeaturesSchema = Type.Object({
    features: Type.Array(Type.Object({
        featureCode: Type.String({ minLength: 1, maxLength: 50 }),
        enabled: Type.Boolean(),
    })),
});
// ============================================================================
// TENANT SWITCHING SCHEMAS
// ============================================================================
export const TenantSwitchSchema = Type.Object({
    tenantId: Type.String({ format: 'uuid' }),
});
export const TenantSwitchResponseSchema = Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String(),
    tenant: TenantSchema,
    membership: MembershipSchema,
});
// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================
export const TenantListResponseSchema = Type.Object({
    tenants: Type.Array(TenantSchema),
    pagination: Type.Object({
        page: Type.Number(),
        limit: Type.Number(),
        total: Type.Number(),
        totalPages: Type.Number(),
    }),
});
export const MembershipListResponseSchema = Type.Object({
    memberships: Type.Array(MembershipSchema),
    pagination: Type.Object({
        page: Type.Number(),
        limit: Type.Number(),
        total: Type.Number(),
        totalPages: Type.Number(),
    }),
});
export const TenantFeatureListResponseSchema = Type.Object({
    features: Type.Array(TenantFeatureSchema),
});
// ============================================================================
// ERROR SCHEMAS
// ============================================================================
export const TenantErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.Union([
        Type.Literal('TENANT_NOT_FOUND'),
        Type.Literal('TENANT_SLUG_EXISTS'),
        Type.Literal('MEMBERSHIP_NOT_FOUND'),
        Type.Literal('MEMBERSHIP_EXISTS'),
        Type.Literal('INVALID_TENANT_MEMBERSHIP'),
        Type.Literal('INSUFFICIENT_PERMISSIONS'),
        Type.Literal('FEATURE_NOT_FOUND'),
    ]),
});
//# sourceMappingURL=typeboxSchemas.js.map