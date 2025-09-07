import { z } from 'zod';
export declare const BaseSchemas: {
    id: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    paginationQuery: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sort: z.ZodOptional<z.ZodString>;
        order: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
    paginationResponse: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, z.core.$strip>;
    errorResponse: z.ZodObject<{
        error: z.ZodString;
        message: z.ZodString;
        statusCode: z.ZodNumber;
        timestamp: z.ZodString;
        path: z.ZodString;
    }, z.core.$strip>;
};
export declare const UserSchemas: any;
export declare const QuoteSchemas: {
    quote: z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>;
        totalAmount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    quoteLineItem: z.ZodObject<{
        id: z.ZodString;
        quoteId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
        serviceCategoryId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    createQuote: z.ZodObject<{
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        lineItems: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            serviceCategoryId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    updateQuote: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
};
export declare const RateCardSchemas: {
    rateCard: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
        effectiveFrom: z.ZodString;
        effectiveUntil: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    rateCardItem: z.ZodObject<{
        id: z.ZodString;
        rateCardId: z.ZodString;
        serviceCategoryId: z.ZodString;
        itemCode: z.ZodString;
        unit: z.ZodString;
        baseRate: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        taxClass: z.ZodDefault<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    createRateCard: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        effectiveFrom: z.ZodString;
        effectiveUntil: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const ServiceCategorySchemas: {
    serviceCategory: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    createServiceCategory: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const ApiEndpoints: readonly [{
    readonly method: "post";
    readonly path: "/api/v1/auth/login";
    readonly parameters: readonly [];
    readonly response: any;
    readonly body: any;
}, {
    readonly method: "post";
    readonly path: "/api/v1/auth/refresh";
    readonly parameters: readonly [];
    readonly response: z.ZodObject<{
        accessToken: z.ZodString;
        expiresIn: z.ZodNumber;
    }, z.core.$strip>;
    readonly body: z.ZodObject<{
        refreshToken: z.ZodString;
    }, z.core.$strip>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/auth/logout";
    readonly parameters: readonly [];
    readonly response: z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>;
    readonly body: z.ZodObject<{}, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/users";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            sort: z.ZodOptional<z.ZodString>;
            order: z.ZodDefault<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>;
        }, z.core.$strip>;
    }];
    readonly response: z.ZodObject<{
        data: z.ZodArray<any>;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/users/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: z.ZodString;
    }];
    readonly response: any;
}, {
    readonly method: "post";
    readonly path: "/api/v1/users";
    readonly parameters: readonly [];
    readonly response: any;
    readonly body: any;
}, {
    readonly method: "put";
    readonly path: "/api/v1/users/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: z.ZodString;
    }];
    readonly response: any;
    readonly body: any;
}, {
    readonly method: "get";
    readonly path: "/api/v1/quotes";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            sort: z.ZodOptional<z.ZodString>;
            order: z.ZodDefault<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>;
            status: z.ZodOptional<z.ZodEnum<{
                draft: "draft";
                sent: "sent";
                approved: "approved";
                accepted: "accepted";
                rejected: "rejected";
            }>>;
            customerId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }];
    readonly response: z.ZodObject<{
        data: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            quoteNumber: z.ZodString;
            customerId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            status: z.ZodEnum<{
                draft: "draft";
                sent: "sent";
                approved: "approved";
                accepted: "accepted";
                rejected: "rejected";
            }>;
            totalAmount: z.ZodNumber;
            currency: z.ZodDefault<z.ZodString>;
            validUntil: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/quotes/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: z.ZodString;
    }];
    readonly response: z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>;
        totalAmount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lineItems: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            quoteId: z.ZodString;
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            totalPrice: z.ZodNumber;
            serviceCategoryId: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, {
    readonly method: "post";
    readonly path: "/api/v1/quotes";
    readonly parameters: readonly [];
    readonly response: z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>;
        totalAmount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    readonly body: z.ZodObject<{
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        lineItems: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            serviceCategoryId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, {
    readonly method: "put";
    readonly path: "/api/v1/quotes/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: z.ZodString;
    }];
    readonly response: z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>;
        totalAmount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    readonly body: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<{
            draft: "draft";
            sent: "sent";
            approved: "approved";
            accepted: "accepted";
            rejected: "rejected";
        }>>;
        validUntil: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/rate-cards";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            sort: z.ZodOptional<z.ZodString>;
            order: z.ZodDefault<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>;
            isActive: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
    }];
    readonly response: z.ZodObject<{
        data: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            isActive: z.ZodBoolean;
            effectiveFrom: z.ZodString;
            effectiveUntil: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/rate-cards/:id";
    readonly parameters: readonly [{
        readonly name: "id";
        readonly schema: z.ZodString;
    }];
    readonly response: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
        effectiveFrom: z.ZodString;
        effectiveUntil: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            rateCardId: z.ZodString;
            serviceCategoryId: z.ZodString;
            itemCode: z.ZodString;
            unit: z.ZodString;
            baseRate: z.ZodNumber;
            currency: z.ZodDefault<z.ZodString>;
            taxClass: z.ZodDefault<z.ZodString>;
            isActive: z.ZodBoolean;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, {
    readonly method: "get";
    readonly path: "/api/v1/service-categories";
    readonly parameters: readonly [{
        readonly name: "query";
        readonly schema: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            sort: z.ZodOptional<z.ZodString>;
            order: z.ZodDefault<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>;
            isActive: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
    }];
    readonly response: z.ZodObject<{
        data: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            isActive: z.ZodBoolean;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
}];
export declare const createContractValidator: (baseURL: string) => any;
export declare const ContractValidator: {
    validateResponse: <T>(schema: z.ZodSchema<T>, data: unknown) => T;
    validateRequest: <T>(schema: z.ZodSchema<T>, data: unknown) => T;
    isValid: <T>(schema: z.ZodSchema<T>, data: unknown) => data is T;
    getErrors: <T>(schema: z.ZodSchema<T>, data: unknown) => z.ZodError | null;
};
export default ContractValidator;
//# sourceMappingURL=validation.d.ts.map