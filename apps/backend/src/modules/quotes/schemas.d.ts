import { Decimal } from 'decimal.js';
import { z } from 'zod';
export declare const QuoteStatus: {
    readonly DRAFT: "draft";
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly SENT: "sent";
    readonly ACCEPTED: "accepted";
    readonly REJECTED: "rejected";
    readonly CANCELLED: "cancelled";
};
export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus];
export declare const QuoteType: {
    readonly PROJECT: "project";
    readonly SERVICE: "service";
    readonly PRODUCT: "product";
    readonly RECURRING: "recurring";
    readonly ONE_TIME: "one_time";
};
export type QuoteType = typeof QuoteType[keyof typeof QuoteType];
export declare const LineItemType: {
    readonly SERVICE: "service";
    readonly PRODUCT: "product";
    readonly MATERIAL: "material";
    readonly TRAVEL: "travel";
    readonly EXPENSE: "expense";
    readonly DISCOUNT: "discount";
    readonly TAX: "tax";
};
export type LineItemType = typeof LineItemType[keyof typeof LineItemType];
export declare const DiscountType: {
    readonly PERCENTAGE: "percentage";
    readonly FIXED_AMOUNT: "fixed_amount";
    readonly PER_UNIT: "per_unit";
};
export type DiscountType = typeof DiscountType[keyof typeof DiscountType];
export declare const QuoteLineItemSchema: z.ZodObject<{
    lineNumber: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
    description: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    unitPrice: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    unitCost: z.ZodOptional<z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>>;
    unit: z.ZodDefault<z.ZodString>;
    taxInclusive: z.ZodDefault<z.ZodBoolean>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    percentageDiscount: z.ZodOptional<z.ZodNumber>;
    fixedDiscount: z.ZodOptional<z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>>;
    serviceCategoryId: z.ZodOptional<z.ZodString>;
    rateCardId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    lineNumber: number;
    type: string;
    description: string;
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    taxRate: number;
    metadata: Record<string, any>;
    unit: string;
    taxInclusive: boolean;
    unitCost?: {
        currency: string;
        amount: Decimal;
    } | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    serviceCategoryId?: string | undefined;
    rateCardId?: string | undefined;
    sku?: string | undefined;
    percentageDiscount?: number | undefined;
    fixedDiscount?: {
        currency: string;
        amount: Decimal;
    } | undefined;
}, {
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    type?: string | undefined;
    unitCost?: {
        currency: string;
        amount: Decimal;
    } | undefined;
    taxRate?: number | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    serviceCategoryId?: string | undefined;
    rateCardId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    sku?: string | undefined;
    unit?: string | undefined;
    taxInclusive?: boolean | undefined;
    percentageDiscount?: number | undefined;
    fixedDiscount?: {
        currency: string;
        amount: Decimal;
    } | undefined;
}>;
export declare const CreateQuoteSchema: z.ZodObject<{
    customerId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
    validFrom: z.ZodString;
    validUntil: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    exchangeRate: z.ZodDefault<z.ZodNumber>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    termsConditions: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
    lineItems: z.ZodArray<z.ZodObject<{
        lineNumber: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
        description: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        unitCost: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
        unit: z.ZodDefault<z.ZodString>;
        taxInclusive: z.ZodDefault<z.ZodBoolean>;
        taxRate: z.ZodDefault<z.ZodNumber>;
        discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        percentageDiscount: z.ZodOptional<z.ZodNumber>;
        fixedDiscount: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
        serviceCategoryId: z.ZodOptional<z.ZodString>;
        rateCardId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxRate: number;
        metadata: Record<string, any>;
        unit: string;
        taxInclusive: boolean;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        sku?: string | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }, {
        lineNumber: number;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        type?: string | undefined;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        taxRate?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        metadata?: Record<string, any> | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    taxRate: number;
    currency: string;
    customerId: string;
    title: string;
    validFrom: string;
    validUntil: string;
    exchangeRate: number;
    lineItems: {
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxRate: number;
        metadata: Record<string, any>;
        unit: string;
        taxInclusive: boolean;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        sku?: string | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }[];
    description?: string | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    projectId?: string | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
}, {
    customerId: string;
    title: string;
    validFrom: string;
    validUntil: string;
    lineItems: {
        lineNumber: number;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        type?: string | undefined;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        taxRate?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        metadata?: Record<string, any> | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }[];
    type?: string | undefined;
    description?: string | undefined;
    taxRate?: number | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    currency?: string | undefined;
    projectId?: string | undefined;
    exchangeRate?: number | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
}>;
export declare const UpdateQuoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    exchangeRate: z.ZodOptional<z.ZodNumber>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    termsConditions: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
    lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        lineNumber: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
        description: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        unitCost: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
        unit: z.ZodDefault<z.ZodString>;
        taxInclusive: z.ZodDefault<z.ZodBoolean>;
        taxRate: z.ZodDefault<z.ZodNumber>;
        discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        percentageDiscount: z.ZodOptional<z.ZodNumber>;
        fixedDiscount: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
        serviceCategoryId: z.ZodOptional<z.ZodString>;
        rateCardId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxRate: number;
        metadata: Record<string, any>;
        unit: string;
        taxInclusive: boolean;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        sku?: string | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }, {
        lineNumber: number;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        type?: string | undefined;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        taxRate?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        metadata?: Record<string, any> | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    description?: string | undefined;
    taxRate?: number | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    currency?: string | undefined;
    title?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    exchangeRate?: number | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    lineItems?: {
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxRate: number;
        metadata: Record<string, any>;
        unit: string;
        taxInclusive: boolean;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        sku?: string | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }[] | undefined;
}, {
    type?: string | undefined;
    description?: string | undefined;
    taxRate?: number | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    currency?: string | undefined;
    title?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    exchangeRate?: number | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    lineItems?: {
        lineNumber: number;
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        type?: string | undefined;
        unitCost?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        taxRate?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
        metadata?: Record<string, any> | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
    }[] | undefined;
}>;
export declare const QuoteStatusTransitionSchema: z.ZodObject<{
    status: z.ZodEnum<[string, ...string[]]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    notes?: string | undefined;
}, {
    status: string;
    notes?: string | undefined;
}>;
export declare const QuoteListFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    customerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    q: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    status?: string | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    createdBy?: string | undefined;
    q?: string | undefined;
}, {
    type?: string | undefined;
    status?: string | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    createdBy?: string | undefined;
    q?: string | undefined;
}>;
export declare const QuoteListPaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "title", "status", "totalAmount", "validUntil"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "totalAmount" | "createdAt" | "updatedAt" | "status" | "title" | "validUntil";
    sortOrder: "asc" | "desc";
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "totalAmount" | "createdAt" | "updatedAt" | "status" | "title" | "validUntil" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const QuoteResponseSchema: z.ZodObject<{
    id: z.ZodString;
    quoteNumber: z.ZodString;
    customerId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<[string, ...string[]]>;
    type: z.ZodEnum<[string, ...string[]]>;
    validFrom: z.ZodString;
    validUntil: z.ZodString;
    currency: z.ZodString;
    exchangeRate: z.ZodNumber;
    subtotal: z.ZodNumber;
    taxRate: z.ZodNumber;
    taxAmount: z.ZodNumber;
    discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodNumber;
    totalAmount: z.ZodNumber;
    termsConditions: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodString;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    sentAt: z.ZodOptional<z.ZodString>;
    acceptedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lineItems: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        lineNumber: z.ZodNumber;
        type: z.ZodEnum<[string, ...string[]]>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        unitCost: z.ZodOptional<z.ZodNumber>;
        taxRate: z.ZodNumber;
        taxAmount: z.ZodNumber;
        discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        discountAmount: z.ZodNumber;
        subtotal: z.ZodNumber;
        totalAmount: z.ZodNumber;
        serviceCategoryId: z.ZodOptional<z.ZodString>;
        rateCardId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        unitCost?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
    }, {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        unitCost?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    subtotal: number;
    totalAmount: number;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    customerId: string;
    title: string;
    validFrom: string;
    validUntil: string;
    exchangeRate: number;
    createdBy: string;
    quoteNumber: string;
    lineItems: {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        unitCost?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
    }[];
    description?: string | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    expiresAt?: string | undefined;
    projectId?: string | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    sentAt?: string | undefined;
    acceptedAt?: string | undefined;
}, {
    id: string;
    type: string;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    subtotal: number;
    totalAmount: number;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    status: string;
    currency: string;
    customerId: string;
    title: string;
    validFrom: string;
    validUntil: string;
    exchangeRate: number;
    createdBy: string;
    quoteNumber: string;
    lineItems: {
        id: string;
        lineNumber: number;
        type: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        unitCost?: number | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        serviceCategoryId?: string | undefined;
        rateCardId?: string | undefined;
    }[];
    description?: string | undefined;
    discountType?: string | undefined;
    discountValue?: number | undefined;
    expiresAt?: string | undefined;
    projectId?: string | undefined;
    termsConditions?: string | undefined;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    sentAt?: string | undefined;
    acceptedAt?: string | undefined;
}>;
export declare const QuoteListResponseSchema: z.ZodObject<{
    quotes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quoteNumber: z.ZodString;
        customerId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<[string, ...string[]]>;
        type: z.ZodEnum<[string, ...string[]]>;
        validFrom: z.ZodString;
        validUntil: z.ZodString;
        currency: z.ZodString;
        exchangeRate: z.ZodNumber;
        subtotal: z.ZodNumber;
        taxRate: z.ZodNumber;
        taxAmount: z.ZodNumber;
        discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        discountAmount: z.ZodNumber;
        totalAmount: z.ZodNumber;
        termsConditions: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        internalNotes: z.ZodOptional<z.ZodString>;
        createdBy: z.ZodString;
        approvedBy: z.ZodOptional<z.ZodString>;
        approvedAt: z.ZodOptional<z.ZodString>;
        sentAt: z.ZodOptional<z.ZodString>;
        acceptedAt: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lineItems: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            lineNumber: z.ZodNumber;
            type: z.ZodEnum<[string, ...string[]]>;
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
            unitCost: z.ZodOptional<z.ZodNumber>;
            taxRate: z.ZodNumber;
            taxAmount: z.ZodNumber;
            discountType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
            discountValue: z.ZodOptional<z.ZodNumber>;
            discountAmount: z.ZodNumber;
            subtotal: z.ZodNumber;
            totalAmount: z.ZodNumber;
            serviceCategoryId: z.ZodOptional<z.ZodString>;
            rateCardId: z.ZodOptional<z.ZodString>;
            metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }, {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        customerId: string;
        title: string;
        validFrom: string;
        validUntil: string;
        exchangeRate: number;
        createdBy: string;
        quoteNumber: string;
        lineItems: {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }[];
        description?: string | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        expiresAt?: string | undefined;
        projectId?: string | undefined;
        termsConditions?: string | undefined;
        notes?: string | undefined;
        internalNotes?: string | undefined;
        approvedBy?: string | undefined;
        approvedAt?: string | undefined;
        sentAt?: string | undefined;
        acceptedAt?: string | undefined;
    }, {
        id: string;
        type: string;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        customerId: string;
        title: string;
        validFrom: string;
        validUntil: string;
        exchangeRate: number;
        createdBy: string;
        quoteNumber: string;
        lineItems: {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }[];
        description?: string | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        expiresAt?: string | undefined;
        projectId?: string | undefined;
        termsConditions?: string | undefined;
        notes?: string | undefined;
        internalNotes?: string | undefined;
        approvedBy?: string | undefined;
        approvedAt?: string | undefined;
        sentAt?: string | undefined;
        acceptedAt?: string | undefined;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    quotes: {
        id: string;
        type: string;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        customerId: string;
        title: string;
        validFrom: string;
        validUntil: string;
        exchangeRate: number;
        createdBy: string;
        quoteNumber: string;
        lineItems: {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }[];
        description?: string | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        expiresAt?: string | undefined;
        projectId?: string | undefined;
        termsConditions?: string | undefined;
        notes?: string | undefined;
        internalNotes?: string | undefined;
        approvedBy?: string | undefined;
        approvedAt?: string | undefined;
        sentAt?: string | undefined;
        acceptedAt?: string | undefined;
    }[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}, {
    quotes: {
        id: string;
        type: string;
        taxRate: number;
        taxAmount: number;
        discountAmount: number;
        subtotal: number;
        totalAmount: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        status: string;
        currency: string;
        customerId: string;
        title: string;
        validFrom: string;
        validUntil: string;
        exchangeRate: number;
        createdBy: string;
        quoteNumber: string;
        lineItems: {
            id: string;
            lineNumber: number;
            type: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate: number;
            taxAmount: number;
            discountAmount: number;
            subtotal: number;
            totalAmount: number;
            metadata: Record<string, any>;
            createdAt: string;
            updatedAt: string;
            unitCost?: number | undefined;
            discountType?: string | undefined;
            discountValue?: number | undefined;
            serviceCategoryId?: string | undefined;
            rateCardId?: string | undefined;
        }[];
        description?: string | undefined;
        discountType?: string | undefined;
        discountValue?: number | undefined;
        expiresAt?: string | undefined;
        projectId?: string | undefined;
        termsConditions?: string | undefined;
        notes?: string | undefined;
        internalNotes?: string | undefined;
        approvedBy?: string | undefined;
        approvedAt?: string | undefined;
        sentAt?: string | undefined;
        acceptedAt?: string | undefined;
    }[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const QuoteErrorResponseSchema: z.ZodObject<{
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
export declare const STATUS_TRANSITIONS: {
    readonly draft: readonly ["pending", "cancelled"];
    readonly pending: readonly ["approved", "rejected", "cancelled"];
    readonly approved: readonly ["sent"];
    readonly sent: readonly ["accepted", "rejected"];
    readonly accepted: readonly [];
    readonly rejected: readonly [];
    readonly cancelled: readonly [];
};
export declare function isValidStatusTransition(fromStatus: QuoteStatus, toStatus: QuoteStatus): boolean;
export declare function validateQuoteData(data: z.infer<typeof CreateQuoteSchema>): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=schemas.d.ts.map