import { type Static } from '@sinclair/typebox';
export declare const TenantRoleEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
export declare const TenantStatusEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
export declare const CreateTenantSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    billingEmail: import("@sinclair/typebox").TString;
    defaultCurrency: import("@sinclair/typebox").TString;
    timezone: import("@sinclair/typebox").TString;
}>;
export declare const UpdateTenantSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    billingEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    defaultCurrency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>>;
}>;
export declare const CreateMembershipSchema: import("@sinclair/typebox").TObject<{
    userEmail: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
}>;
export declare const TenantListQuerySchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name">, import("@sinclair/typebox").TLiteral<"slug">, import("@sinclair/typebox").TLiteral<"createdAt">, import("@sinclair/typebox").TLiteral<"status">]>>;
    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>>;
}>;
export declare const TenantResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    billingEmail: import("@sinclair/typebox").TString;
    defaultCurrency: import("@sinclair/typebox").TString;
    timezone: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    membershipCount: import("@sinclair/typebox").TInteger;
}>;
export declare const MembershipResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    userId: import("@sinclair/typebox").TString;
    userEmail: import("@sinclair/typebox").TString;
    userFirstName: import("@sinclair/typebox").TString;
    userLastName: import("@sinclair/typebox").TString;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
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
        membershipCount: import("@sinclair/typebox").TInteger;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TInteger;
        limit: import("@sinclair/typebox").TInteger;
        total: import("@sinclair/typebox").TInteger;
        pages: import("@sinclair/typebox").TInteger;
    }>;
}>;
export declare const TenantDetailResponseSchema: import("@sinclair/typebox").TObject<{
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
        membershipCount: import("@sinclair/typebox").TInteger;
    }>;
    memberships: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        userEmail: import("@sinclair/typebox").TString;
        userFirstName: import("@sinclair/typebox").TString;
        userLastName: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
}>;
export declare const ErrorResponseSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnknown>;
}>;
export type CreateTenant = Static<typeof CreateTenantSchema>;
export type UpdateTenant = Static<typeof UpdateTenantSchema>;
export type CreateMembership = Static<typeof CreateMembershipSchema>;
export type TenantListQuery = Static<typeof TenantListQuerySchema>;
export type TenantResponse = Static<typeof TenantResponseSchema>;
export type MembershipResponse = Static<typeof MembershipResponseSchema>;
export type TenantListResponse = Static<typeof TenantListResponseSchema>;
export type TenantDetailResponse = Static<typeof TenantDetailResponseSchema>;
export type TenantRole = Static<typeof TenantRoleEnum>;
export type TenantStatus = Static<typeof TenantStatusEnum>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map