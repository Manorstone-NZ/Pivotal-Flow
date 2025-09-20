/**
 * F1 Tenant Administration - TypeBox Schemas
 * TypeBox schemas for tenant CRUD and membership management
 */
export declare const TenantStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
export declare const TenantSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    billingEmail: import("@sinclair/typebox").TString;
    defaultCurrency: import("@sinclair/typebox").TString;
    timezone: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export declare const CreateTenantSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    billingEmail: import("@sinclair/typebox").TString;
    defaultCurrency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const UpdateTenantSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    billingEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    defaultCurrency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>>;
}>;
export declare const MembershipRole: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
export declare const MembershipSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    userId: import("@sinclair/typebox").TString;
    tenantId: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    user: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        firstName: import("@sinclair/typebox").TString;
        lastName: import("@sinclair/typebox").TString;
    }>>;
}>;
export declare const CreateMembershipSchema: import("@sinclair/typebox").TObject<{
    userId: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
}>;
export declare const UpdateMembershipSchema: import("@sinclair/typebox").TObject<{
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
}>;
export declare const TenantFeatureSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    tenantId: import("@sinclair/typebox").TString;
    featureCode: import("@sinclair/typebox").TString;
    enabled: import("@sinclair/typebox").TBoolean;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export declare const UpdateTenantFeaturesSchema: import("@sinclair/typebox").TObject<{
    features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        featureCode: import("@sinclair/typebox").TString;
        enabled: import("@sinclair/typebox").TBoolean;
    }>>;
}>;
export declare const TenantSwitchSchema: import("@sinclair/typebox").TObject<{
    tenantId: import("@sinclair/typebox").TString;
}>;
export declare const TenantSwitchResponseSchema: import("@sinclair/typebox").TObject<{
    accessToken: import("@sinclair/typebox").TString;
    refreshToken: import("@sinclair/typebox").TString;
    tenant: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        billingEmail: import("@sinclair/typebox").TString;
        defaultCurrency: import("@sinclair/typebox").TString;
        timezone: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    membership: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        tenantId: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        user: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            firstName: import("@sinclair/typebox").TString;
            lastName: import("@sinclair/typebox").TString;
        }>>;
    }>;
}>;
export declare const TenantListResponseSchema: import("@sinclair/typebox").TObject<{
    tenants: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        billingEmail: import("@sinclair/typebox").TString;
        defaultCurrency: import("@sinclair/typebox").TString;
        timezone: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const MembershipListResponseSchema: import("@sinclair/typebox").TObject<{
    memberships: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        tenantId: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        user: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            firstName: import("@sinclair/typebox").TString;
            lastName: import("@sinclair/typebox").TString;
        }>>;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const TenantFeatureListResponseSchema: import("@sinclair/typebox").TObject<{
    features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        tenantId: import("@sinclair/typebox").TString;
        featureCode: import("@sinclair/typebox").TString;
        enabled: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
}>;
export declare const TenantErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"TENANT_NOT_FOUND">, import("@sinclair/typebox").TLiteral<"TENANT_SLUG_EXISTS">, import("@sinclair/typebox").TLiteral<"MEMBERSHIP_NOT_FOUND">, import("@sinclair/typebox").TLiteral<"MEMBERSHIP_EXISTS">, import("@sinclair/typebox").TLiteral<"INVALID_TENANT_MEMBERSHIP">, import("@sinclair/typebox").TLiteral<"INSUFFICIENT_PERMISSIONS">, import("@sinclair/typebox").TLiteral<"FEATURE_NOT_FOUND">]>;
}>;
//# sourceMappingURL=typeboxSchemas.d.ts.map