/**
 * F1A Tenant Admin Portal - TypeBox Schemas
 * Comprehensive validation schemas for tenant management operations
 */
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
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">, import("@sinclair/typebox").TLiteral<"ALL">]>>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name">, import("@sinclair/typebox").TLiteral<"createdAt">, import("@sinclair/typebox").TLiteral<"membershipCount">]>>;
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
    membershipCount: import("@sinclair/typebox").TNumber;
}>;
export declare const MembershipResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    userId: import("@sinclair/typebox").TString;
    userEmail: import("@sinclair/typebox").TString;
    userFirstName: import("@sinclair/typebox").TString;
    userLastName: import("@sinclair/typebox").TString;
    userDisplayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
    createdAt: import("@sinclair/typebox").TString;
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
        membershipCount: import("@sinclair/typebox").TNumber;
    }>;
    memberships: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        userEmail: import("@sinclair/typebox").TString;
        userFirstName: import("@sinclair/typebox").TString;
        userLastName: import("@sinclair/typebox").TString;
        userDisplayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        createdAt: import("@sinclair/typebox").TString;
    }>>;
    stats: import("@sinclair/typebox").TObject<{
        totalUsers: import("@sinclair/typebox").TNumber;
        activeUsers: import("@sinclair/typebox").TNumber;
        totalQuotes: import("@sinclair/typebox").TNumber;
        totalInvoices: import("@sinclair/typebox").TNumber;
        totalRevenue: import("@sinclair/typebox").TString;
    }>;
}>;
export declare const TenantListResponseSchema: import("@sinclair/typebox").TObject<{
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        billingEmail: import("@sinclair/typebox").TString;
        defaultCurrency: import("@sinclair/typebox").TString;
        timezone: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        membershipCount: import("@sinclair/typebox").TNumber;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
        hasNext: import("@sinclair/typebox").TBoolean;
        hasPrevious: import("@sinclair/typebox").TBoolean;
    }>;
    meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        searchQuery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        statusFilter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export declare const CreateTenantResponseSchema: import("@sinclair/typebox").TObject<{
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
        membershipCount: import("@sinclair/typebox").TNumber;
    }>;
    message: import("@sinclair/typebox").TString;
}>;
export declare const UpdateTenantResponseSchema: import("@sinclair/typebox").TObject<{
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
        membershipCount: import("@sinclair/typebox").TNumber;
    }>;
    message: import("@sinclair/typebox").TString;
}>;
export declare const CreateMembershipResponseSchema: import("@sinclair/typebox").TObject<{
    membership: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        userEmail: import("@sinclair/typebox").TString;
        userFirstName: import("@sinclair/typebox").TString;
        userLastName: import("@sinclair/typebox").TString;
        userDisplayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        createdAt: import("@sinclair/typebox").TString;
    }>;
    message: import("@sinclair/typebox").TString;
}>;
export declare const AdminTenantRouteSchemas: {
    listTenants: {
        querystring: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">, import("@sinclair/typebox").TLiteral<"ALL">]>>;
            sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name">, import("@sinclair/typebox").TLiteral<"createdAt">, import("@sinclair/typebox").TLiteral<"membershipCount">]>>;
            sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>>;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            200: import("@sinclair/typebox").TObject<{
                data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                    id: import("@sinclair/typebox").TString;
                    name: import("@sinclair/typebox").TString;
                    slug: import("@sinclair/typebox").TString;
                    billingEmail: import("@sinclair/typebox").TString;
                    defaultCurrency: import("@sinclair/typebox").TString;
                    timezone: import("@sinclair/typebox").TString;
                    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>;
                    createdAt: import("@sinclair/typebox").TString;
                    updatedAt: import("@sinclair/typebox").TString;
                    membershipCount: import("@sinclair/typebox").TNumber;
                }>>;
                pagination: import("@sinclair/typebox").TObject<{
                    page: import("@sinclair/typebox").TNumber;
                    limit: import("@sinclair/typebox").TNumber;
                    total: import("@sinclair/typebox").TNumber;
                    totalPages: import("@sinclair/typebox").TNumber;
                    hasNext: import("@sinclair/typebox").TBoolean;
                    hasPrevious: import("@sinclair/typebox").TBoolean;
                }>;
                meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                    searchQuery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                    statusFilter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                }>>;
            }>;
        };
    };
    createTenant: {
        body: import("@sinclair/typebox").TObject<{
            name: import("@sinclair/typebox").TString;
            slug: import("@sinclair/typebox").TString;
            billingEmail: import("@sinclair/typebox").TString;
            defaultCurrency: import("@sinclair/typebox").TString;
            timezone: import("@sinclair/typebox").TString;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            201: import("@sinclair/typebox").TObject<{
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
                    membershipCount: import("@sinclair/typebox").TNumber;
                }>;
                message: import("@sinclair/typebox").TString;
            }>;
        };
    };
    getTenant: {
        params: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            200: import("@sinclair/typebox").TObject<{
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
                    membershipCount: import("@sinclair/typebox").TNumber;
                }>;
                memberships: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                    id: import("@sinclair/typebox").TString;
                    userId: import("@sinclair/typebox").TString;
                    userEmail: import("@sinclair/typebox").TString;
                    userFirstName: import("@sinclair/typebox").TString;
                    userLastName: import("@sinclair/typebox").TString;
                    userDisplayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
                    createdAt: import("@sinclair/typebox").TString;
                }>>;
                stats: import("@sinclair/typebox").TObject<{
                    totalUsers: import("@sinclair/typebox").TNumber;
                    activeUsers: import("@sinclair/typebox").TNumber;
                    totalQuotes: import("@sinclair/typebox").TNumber;
                    totalInvoices: import("@sinclair/typebox").TNumber;
                    totalRevenue: import("@sinclair/typebox").TString;
                }>;
            }>;
        };
    };
    updateTenant: {
        params: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
        }>;
        body: import("@sinclair/typebox").TObject<{
            name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            billingEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            defaultCurrency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"ACTIVE">, import("@sinclair/typebox").TLiteral<"SUSPENDED">]>>;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            200: import("@sinclair/typebox").TObject<{
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
                    membershipCount: import("@sinclair/typebox").TNumber;
                }>;
                message: import("@sinclair/typebox").TString;
            }>;
        };
    };
    addMembership: {
        params: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
        }>;
        body: import("@sinclair/typebox").TObject<{
            userEmail: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            201: import("@sinclair/typebox").TObject<{
                membership: import("@sinclair/typebox").TObject<{
                    id: import("@sinclair/typebox").TString;
                    userId: import("@sinclair/typebox").TString;
                    userEmail: import("@sinclair/typebox").TString;
                    userFirstName: import("@sinclair/typebox").TString;
                    userLastName: import("@sinclair/typebox").TString;
                    userDisplayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                    role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"OWNER">, import("@sinclair/typebox").TLiteral<"ADMIN">, import("@sinclair/typebox").TLiteral<"STAFF">, import("@sinclair/typebox").TLiteral<"VIEWER">]>;
                    createdAt: import("@sinclair/typebox").TString;
                }>;
                message: import("@sinclair/typebox").TString;
            }>;
        };
    };
    removeMembership: {
        params: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            membershipId: import("@sinclair/typebox").TString;
        }>;
        response: {
            400: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            401: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            403: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            404: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            409: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            500: import("@sinclair/typebox").TObject<{
                error: import("@sinclair/typebox").TObject<{
                    code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
                    message: import("@sinclair/typebox").TString;
                    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
                }>;
            }>;
            200: import("@sinclair/typebox").TObject<{
                message: import("@sinclair/typebox").TString;
            }>;
        };
    };
};
export type CreateTenant = typeof CreateTenantSchema.static;
export type UpdateTenant = typeof UpdateTenantSchema.static;
export type CreateMembership = typeof CreateMembershipSchema.static;
export type TenantListQuery = typeof TenantListQuerySchema.static;
export type TenantResponse = typeof TenantResponseSchema.static;
export type MembershipResponse = typeof MembershipResponseSchema.static;
export type TenantDetailResponse = typeof TenantDetailResponseSchema.static;
export type TenantListResponse = typeof TenantListResponseSchema.static;
//# sourceMappingURL=schemas.d.ts.map