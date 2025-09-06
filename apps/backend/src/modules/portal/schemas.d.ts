/**
 * Portal Module Schemas
 *
 * Zod validation schemas for portal API requests and responses
 */
import { z } from 'zod';
export declare const PortalQuoteFiltersSchema: z.ZodEffects<z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<[string, ...string[]]>, z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: string | string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>, {
    page: number;
    limit: number;
    status?: string | string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const PortalInvoiceFiltersSchema: z.ZodEffects<z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<[string, ...string[]]>, z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: string | string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>, {
    page: number;
    limit: number;
    status?: string | string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const PortalTimeEntryFiltersSchema: z.ZodEffects<z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    fromMonth: z.ZodOptional<z.ZodString>;
    toMonth: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    projectId?: string | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}, {
    projectId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}>, {
    page: number;
    limit: number;
    projectId?: string | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}, {
    projectId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}>;
export declare const PortalQuoteQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<[string, ...string[]]>, z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const PortalInvoiceQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<[string, ...string[]]>, z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: string | string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const PortalTimeEntryQuerySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    fromMonth: z.ZodOptional<z.ZodString>;
    toMonth: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    projectId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}, {
    projectId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fromMonth?: string | undefined;
    toMonth?: string | undefined;
}>;
export declare const PortalUserContextSchema: z.ZodObject<{
    userId: z.ZodString;
    organizationId: z.ZodString;
    customerId: z.ZodString;
    userType: z.ZodLiteral<"external_customer">;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    email: string;
    userId: string;
    firstName: string;
    lastName: string;
    customerId: string;
    userType: "external_customer";
}, {
    organizationId: string;
    email: string;
    userId: string;
    firstName: string;
    lastName: string;
    customerId: string;
    userType: "external_customer";
}>;
export declare const PortalQuoteLineItemSchema: z.ZodObject<{
    id: z.ZodString;
    lineNumber: z.ZodNumber;
    type: z.ZodString;
    sku: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    quantity: z.ZodString;
    unitPrice: z.ZodString;
    discountPercent: z.ZodString;
    discountAmount: z.ZodString;
    taxPercent: z.ZodString;
    taxAmount: z.ZodString;
    subtotal: z.ZodString;
    total: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    lineNumber: number;
    type: string;
    description: string;
    quantity: string;
    unitPrice: string;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    sku: string | null;
    total: string;
    discountPercent: string;
    taxPercent: string;
}, {
    id: string;
    lineNumber: number;
    type: string;
    description: string;
    quantity: string;
    unitPrice: string;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    sku: string | null;
    total: string;
    discountPercent: string;
    taxPercent: string;
}>;
export declare const PortalQuoteSchema: z.ZodObject<{
    id: z.ZodString;
    quoteNumber: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<[string, ...string[]]>;
    type: z.ZodString;
    validFrom: z.ZodString;
    validUntil: z.ZodString;
    currency: z.ZodString;
    subtotal: z.ZodString;
    taxAmount: z.ZodString;
    discountAmount: z.ZodString;
    totalAmount: z.ZodString;
    notes: z.ZodNullable<z.ZodString>;
    approvedAt: z.ZodNullable<z.ZodString>;
    sentAt: z.ZodNullable<z.ZodString>;
    acceptedAt: z.ZodNullable<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    expiresAt: string | null;
    title: string;
    validFrom: string;
    validUntil: string;
    notes: string | null;
    approvedAt: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
    quoteNumber: string;
}, {
    id: string;
    type: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    expiresAt: string | null;
    title: string;
    validFrom: string;
    validUntil: string;
    notes: string | null;
    approvedAt: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
    quoteNumber: string;
}>;
export declare const PortalQuoteDetailSchema: z.ZodObject<{
    id: z.ZodString;
    quoteNumber: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<[string, ...string[]]>;
    type: z.ZodString;
    validFrom: z.ZodString;
    validUntil: z.ZodString;
    currency: z.ZodString;
    subtotal: z.ZodString;
    taxAmount: z.ZodString;
    discountAmount: z.ZodString;
    totalAmount: z.ZodString;
    notes: z.ZodNullable<z.ZodString>;
    approvedAt: z.ZodNullable<z.ZodString>;
    sentAt: z.ZodNullable<z.ZodString>;
    acceptedAt: z.ZodNullable<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    lineItems: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        lineNumber: z.ZodNumber;
        type: z.ZodString;
        sku: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        quantity: z.ZodString;
        unitPrice: z.ZodString;
        discountPercent: z.ZodString;
        discountAmount: z.ZodString;
        taxPercent: z.ZodString;
        taxAmount: z.ZodString;
        subtotal: z.ZodString;
        total: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        sku: string | null;
        total: string;
        discountPercent: string;
        taxPercent: string;
    }, {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        sku: string | null;
        total: string;
        discountPercent: string;
        taxPercent: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    expiresAt: string | null;
    title: string;
    validFrom: string;
    validUntil: string;
    notes: string | null;
    approvedAt: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
    quoteNumber: string;
    lineItems: {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        sku: string | null;
        total: string;
        discountPercent: string;
        taxPercent: string;
    }[];
}, {
    id: string;
    type: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    expiresAt: string | null;
    title: string;
    validFrom: string;
    validUntil: string;
    notes: string | null;
    approvedAt: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
    quoteNumber: string;
    lineItems: {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        sku: string | null;
        total: string;
        discountPercent: string;
        taxPercent: string;
    }[];
}>;
export declare const PortalInvoiceLineItemSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodString;
    unitPrice: z.ZodString;
    subtotal: z.ZodString;
    taxAmount: z.ZodString;
    discountAmount: z.ZodString;
    totalAmount: z.ZodString;
    unit: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    unit: string;
}, {
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    unit: string;
}>;
export declare const PortalInvoiceSchema: z.ZodObject<{
    id: z.ZodString;
    invoiceNumber: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<[string, ...string[]]>;
    currency: z.ZodString;
    subtotal: z.ZodString;
    taxAmount: z.ZodString;
    discountAmount: z.ZodString;
    totalAmount: z.ZodString;
    paidAmount: z.ZodString;
    balanceAmount: z.ZodString;
    issuedAt: z.ZodNullable<z.ZodString>;
    dueAt: z.ZodNullable<z.ZodString>;
    paidAt: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    title: string;
    notes: string | null;
    invoiceNumber: string;
    paidAmount: string;
    balanceAmount: string;
    issuedAt: string | null;
    dueAt: string | null;
    paidAt: string | null;
}, {
    id: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    title: string;
    notes: string | null;
    invoiceNumber: string;
    paidAmount: string;
    balanceAmount: string;
    issuedAt: string | null;
    dueAt: string | null;
    paidAt: string | null;
}>;
export declare const PortalInvoiceDetailSchema: z.ZodObject<{
    id: z.ZodString;
    invoiceNumber: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<[string, ...string[]]>;
    currency: z.ZodString;
    subtotal: z.ZodString;
    taxAmount: z.ZodString;
    discountAmount: z.ZodString;
    totalAmount: z.ZodString;
    paidAmount: z.ZodString;
    balanceAmount: z.ZodString;
    issuedAt: z.ZodNullable<z.ZodString>;
    dueAt: z.ZodNullable<z.ZodString>;
    paidAt: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    lineItems: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodString;
        unitPrice: z.ZodString;
        subtotal: z.ZodString;
        taxAmount: z.ZodString;
        discountAmount: z.ZodString;
        totalAmount: z.ZodString;
        unit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        unit: string;
    }, {
        id: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        unit: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    title: string;
    notes: string | null;
    invoiceNumber: string;
    paidAmount: string;
    balanceAmount: string;
    issuedAt: string | null;
    dueAt: string | null;
    paidAt: string | null;
    lineItems: {
        id: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        unit: string;
    }[];
}, {
    id: string;
    description: string | null;
    taxAmount: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    title: string;
    notes: string | null;
    invoiceNumber: string;
    paidAmount: string;
    balanceAmount: string;
    issuedAt: string | null;
    dueAt: string | null;
    paidAt: string | null;
    lineItems: {
        id: string;
        description: string;
        quantity: string;
        unitPrice: string;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        unit: string;
    }[];
}>;
export declare const PortalTimeEntrySummarySchema: z.ZodObject<{
    projectId: z.ZodString;
    projectName: z.ZodString;
    month: z.ZodString;
    totalHours: z.ZodString;
    totalAmount: z.ZodString;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    totalAmount: string;
    currency: string;
    projectId: string;
    projectName: string;
    month: string;
    totalHours: string;
}, {
    totalAmount: string;
    currency: string;
    projectId: string;
    projectName: string;
    month: string;
    totalHours: string;
}>;
export declare const PortalQuoteListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<[string, ...string[]]>;
        type: z.ZodString;
        validFrom: z.ZodString;
        validUntil: z.ZodString;
        currency: z.ZodString;
        subtotal: z.ZodString;
        taxAmount: z.ZodString;
        discountAmount: z.ZodString;
        totalAmount: z.ZodString;
        notes: z.ZodNullable<z.ZodString>;
        approvedAt: z.ZodNullable<z.ZodString>;
        sentAt: z.ZodNullable<z.ZodString>;
        acceptedAt: z.ZodNullable<z.ZodString>;
        expiresAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        expiresAt: string | null;
        title: string;
        validFrom: string;
        validUntil: string;
        notes: string | null;
        approvedAt: string | null;
        sentAt: string | null;
        acceptedAt: string | null;
        quoteNumber: string;
    }, {
        id: string;
        type: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        expiresAt: string | null;
        title: string;
        validFrom: string;
        validUntil: string;
        notes: string | null;
        approvedAt: string | null;
        sentAt: string | null;
        acceptedAt: string | null;
        quoteNumber: string;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        type: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        expiresAt: string | null;
        title: string;
        validFrom: string;
        validUntil: string;
        notes: string | null;
        approvedAt: string | null;
        sentAt: string | null;
        acceptedAt: string | null;
        quoteNumber: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}, {
    data: {
        id: string;
        type: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        expiresAt: string | null;
        title: string;
        validFrom: string;
        validUntil: string;
        notes: string | null;
        approvedAt: string | null;
        sentAt: string | null;
        acceptedAt: string | null;
        quoteNumber: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const PortalInvoiceListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        invoiceNumber: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<[string, ...string[]]>;
        currency: z.ZodString;
        subtotal: z.ZodString;
        taxAmount: z.ZodString;
        discountAmount: z.ZodString;
        totalAmount: z.ZodString;
        paidAmount: z.ZodString;
        balanceAmount: z.ZodString;
        issuedAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        paidAt: z.ZodNullable<z.ZodString>;
        notes: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        title: string;
        notes: string | null;
        invoiceNumber: string;
        paidAmount: string;
        balanceAmount: string;
        issuedAt: string | null;
        dueAt: string | null;
        paidAt: string | null;
    }, {
        id: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        title: string;
        notes: string | null;
        invoiceNumber: string;
        paidAmount: string;
        balanceAmount: string;
        issuedAt: string | null;
        dueAt: string | null;
        paidAt: string | null;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        title: string;
        notes: string | null;
        invoiceNumber: string;
        paidAmount: string;
        balanceAmount: string;
        issuedAt: string | null;
        dueAt: string | null;
        paidAt: string | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}, {
    data: {
        id: string;
        description: string | null;
        taxAmount: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        title: string;
        notes: string | null;
        invoiceNumber: string;
        paidAmount: string;
        balanceAmount: string;
        issuedAt: string | null;
        dueAt: string | null;
        paidAt: string | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const PortalTimeEntryListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        projectName: z.ZodString;
        month: z.ZodString;
        totalHours: z.ZodString;
        totalAmount: z.ZodString;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        totalAmount: string;
        currency: string;
        projectId: string;
        projectName: string;
        month: string;
        totalHours: string;
    }, {
        totalAmount: string;
        currency: string;
        projectId: string;
        projectName: string;
        month: string;
        totalHours: string;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        totalAmount: string;
        currency: string;
        projectId: string;
        projectName: string;
        month: string;
        totalHours: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}, {
    data: {
        totalAmount: string;
        currency: string;
        projectId: string;
        projectName: string;
        month: string;
        totalHours: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const PortalErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    error: string;
    message: string;
    code?: string | undefined;
    details?: Record<string, any> | undefined;
}, {
    error: string;
    message: string;
    code?: string | undefined;
    details?: Record<string, any> | undefined;
}>;
export declare const RateLimitHeadersSchema: z.ZodObject<{
    'X-RateLimit-Limit': z.ZodString;
    'X-RateLimit-Remaining': z.ZodString;
    'X-RateLimit-Reset': z.ZodString;
    'X-RateLimit-Window': z.ZodString;
}, "strip", z.ZodTypeAny, {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'X-RateLimit-Window': string;
}, {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'X-RateLimit-Window': string;
}>;
//# sourceMappingURL=schemas.d.ts.map