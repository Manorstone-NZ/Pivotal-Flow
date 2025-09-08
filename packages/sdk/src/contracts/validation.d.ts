import type { Static, TSchema } from '@sinclair/typebox';
export declare const BaseSchemas: {
    id: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TString;
    password: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    paginationQuery: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        order: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
    }>;
    paginationResponse: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
        hasNext: import("@sinclair/typebox").TBoolean;
        hasPrev: import("@sinclair/typebox").TBoolean;
    }>;
    errorResponse: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TString;
        message: import("@sinclair/typebox").TString;
        statusCode: import("@sinclair/typebox").TNumber;
        timestamp: import("@sinclair/typebox").TString;
        path: import("@sinclair/typebox").TString;
    }>;
};
export declare const UserSchemas: {
    user: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    createUser: import("@sinclair/typebox").TObject<{
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        password: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
    }>;
    updateUser: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>>;
        isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    loginRequest: import("@sinclair/typebox").TObject<{
        email: import("@sinclair/typebox").TString;
        password: import("@sinclair/typebox").TString;
    }>;
    loginResponse: import("@sinclair/typebox").TObject<{
        user: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
            isActive: import("@sinclair/typebox").TBoolean;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>;
        accessToken: import("@sinclair/typebox").TString;
        refreshToken: import("@sinclair/typebox").TString;
        expiresIn: import("@sinclair/typebox").TNumber;
    }>;
};
export declare const QuoteSchemas: {
    quote: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        quoteNumber: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>;
        totalAmount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    quoteLineItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        quoteId: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        quantity: import("@sinclair/typebox").TNumber;
        unitPrice: import("@sinclair/typebox").TNumber;
        totalPrice: import("@sinclair/typebox").TNumber;
        serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    createQuote: import("@sinclair/typebox").TObject<{
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        lineItems: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            description: import("@sinclair/typebox").TString;
            quantity: import("@sinclair/typebox").TNumber;
            unitPrice: import("@sinclair/typebox").TNumber;
            serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
    }>;
    updateQuote: import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>>;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
};
export declare const RateCardSchemas: {
    rateCard: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isActive: import("@sinclair/typebox").TBoolean;
        effectiveFrom: import("@sinclair/typebox").TString;
        effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    rateCardItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        rateCardId: import("@sinclair/typebox").TString;
        serviceCategoryId: import("@sinclair/typebox").TString;
        itemCode: import("@sinclair/typebox").TString;
        unit: import("@sinclair/typebox").TString;
        baseRate: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        taxClass: import("@sinclair/typebox").TString;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    createRateCard: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        effectiveFrom: import("@sinclair/typebox").TString;
        effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
};
export declare const ServiceCategorySchemas: {
    serviceCategory: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    createServiceCategory: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
};
export declare const ApiEndpoints: readonly [{
    readonly method: "post";
    readonly path: "/api/v1/auth/login";
    readonly parameters: readonly [];
    readonly response: import("@sinclair/typebox").TObject<{
        user: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
            isActive: import("@sinclair/typebox").TBoolean;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>;
        accessToken: import("@sinclair/typebox").TString;
        refreshToken: import("@sinclair/typebox").TString;
        expiresIn: import("@sinclair/typebox").TNumber;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        email: import("@sinclair/typebox").TString;
        password: import("@sinclair/typebox").TString;
    }>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/auth/refresh";
    readonly parameters: readonly [];
    readonly response: import("@sinclair/typebox").TObject<{
        accessToken: import("@sinclair/typebox").TString;
        expiresIn: import("@sinclair/typebox").TNumber;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        refreshToken: import("@sinclair/typebox").TString;
    }>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/auth/logout";
    readonly parameters: readonly [];
    readonly response: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{}>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/users";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            order: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
        }>;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
            isActive: import("@sinclair/typebox").TBoolean;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
        pagination: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            total: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/users/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: import("@sinclair/typebox").TString;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/users";
    readonly parameters: readonly [];
    readonly response: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        password: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
    }>;
}, {
    readonly method: "put";
    readonly path: "/api/v1/users/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: import("@sinclair/typebox").TString;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"admin">, import("@sinclair/typebox").TLiteral<"manager">, import("@sinclair/typebox").TLiteral<"user">, import("@sinclair/typebox").TLiteral<"customer">]>>;
        isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/quotes";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            order: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
        }>, import("@sinclair/typebox").TObject<{
            status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>>;
            customerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>]>;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            quoteNumber: import("@sinclair/typebox").TString;
            customerId: import("@sinclair/typebox").TString;
            projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>;
            totalAmount: import("@sinclair/typebox").TNumber;
            currency: import("@sinclair/typebox").TString;
            validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
        pagination: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            total: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/quotes/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: import("@sinclair/typebox").TString;
    }];
    readonly response: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        quoteNumber: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>;
        totalAmount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        lineItems: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            quoteId: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TString;
            quantity: import("@sinclair/typebox").TNumber;
            unitPrice: import("@sinclair/typebox").TNumber;
            totalPrice: import("@sinclair/typebox").TNumber;
            serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
    }>]>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/quotes";
    readonly parameters: readonly [];
    readonly response: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        quoteNumber: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>;
        totalAmount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        lineItems: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            description: import("@sinclair/typebox").TString;
            quantity: import("@sinclair/typebox").TNumber;
            unitPrice: import("@sinclair/typebox").TNumber;
            serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
    }>;
}, {
    readonly method: "put";
    readonly path: "/api/v1/quotes/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: import("@sinclair/typebox").TString;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        quoteNumber: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>;
        totalAmount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>;
    readonly body: import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"accepted">]>>;
        validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/rate-cards";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            order: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
        }>, import("@sinclair/typebox").TObject<{
            isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>]>;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            isActive: import("@sinclair/typebox").TBoolean;
            effectiveFrom: import("@sinclair/typebox").TString;
            effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
        pagination: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            total: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/rate-cards/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: import("@sinclair/typebox").TString;
    }];
    readonly response: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isActive: import("@sinclair/typebox").TBoolean;
        effectiveFrom: import("@sinclair/typebox").TString;
        effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            rateCardId: import("@sinclair/typebox").TString;
            serviceCategoryId: import("@sinclair/typebox").TString;
            itemCode: import("@sinclair/typebox").TString;
            unit: import("@sinclair/typebox").TString;
            baseRate: import("@sinclair/typebox").TNumber;
            currency: import("@sinclair/typebox").TString;
            taxClass: import("@sinclair/typebox").TString;
            isActive: import("@sinclair/typebox").TBoolean;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
    }>]>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/service-categories";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            order: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
        }>, import("@sinclair/typebox").TObject<{
            isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>]>;
    }];
    readonly response: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            isActive: import("@sinclair/typebox").TBoolean;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
        pagination: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            total: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
}];
export declare const ContractValidator: {
    validateResponse: <T extends TSchema>(schema: T, data: unknown) => Static<T>;
    validateRequest: <T extends TSchema>(schema: T, data: unknown) => Static<T>;
    isValid: <T extends TSchema>(schema: T, data: unknown) => data is Static<T>;
    getErrors: <T extends TSchema>(schema: T, data: unknown) => string[] | null;
    toJsonSchema: <T extends TSchema>(schema: T) => (T & {
        params: [];
    })["static"];
};
export default ContractValidator;
//# sourceMappingURL=validation.d.ts.map