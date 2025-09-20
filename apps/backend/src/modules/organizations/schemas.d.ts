/**
 * Organization module TypeBox schemas
 * Request/response validation schemas for organization endpoints
 */
export declare const OrganizationResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TString;
    currency: import("@sinclair/typebox").TString;
    taxId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    settings: import("@sinclair/typebox").TAny;
    subscriptionPlan: import("@sinclair/typebox").TString;
    subscriptionStatus: import("@sinclair/typebox").TString;
    trialEndsAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const CreateOrganizationBodySchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    taxId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
    settings: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    subscriptionPlan: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const UpdateOrganizationBodySchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    taxId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
    settings: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    subscriptionPlan: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const InviteUserBodySchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString;
    roleIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    firstName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lastName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const OrganizationSettingsBodySchema: import("@sinclair/typebox").TObject<{
    settings: import("@sinclair/typebox").TAny;
}>;
export declare const StandardSuccessResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const ErrorResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TLiteral<false>;
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
export declare const OrganizationIdParamSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
}>;
export declare const OrganizationQuerystringSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    subscriptionPlan: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    subscriptionStatus: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"inactive">, import("@sinclair/typebox").TLiteral<"trial">, import("@sinclair/typebox").TLiteral<"expired">]>>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>>;
}>;
export declare const OrganizationListResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timezone: import("@sinclair/typebox").TString;
        currency: import("@sinclair/typebox").TString;
        taxId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
        contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        settings: import("@sinclair/typebox").TAny;
        subscriptionPlan: import("@sinclair/typebox").TString;
        subscriptionStatus: import("@sinclair/typebox").TString;
        trialEndsAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const OrganizationDetailResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        domain: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timezone: import("@sinclair/typebox").TString;
        currency: import("@sinclair/typebox").TString;
        taxId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
        contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        settings: import("@sinclair/typebox").TAny;
        subscriptionPlan: import("@sinclair/typebox").TString;
        subscriptionStatus: import("@sinclair/typebox").TString;
        trialEndsAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
}>;
export declare const OrganizationSettingsResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TAny;
}>;
export declare const InviteUserResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    message: import("@sinclair/typebox").TString;
    data: import("@sinclair/typebox").TObject<{
        inviteId: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
    }>;
}>;
//# sourceMappingURL=schemas.d.ts.map