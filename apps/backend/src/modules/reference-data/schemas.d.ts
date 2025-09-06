/**
 * Reference data schemas
 * Zod validation schemas for reference data responses
 */
import { z } from 'zod';
export declare const ReferenceDataItemSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    code: string;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    code: string;
    displayOrder?: number | undefined;
}>;
export declare const CurrencyReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    symbol: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    symbol?: string | undefined;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    symbol?: string | undefined;
    displayOrder?: number | undefined;
}>;
export declare const TaxClassReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    rate: z.ZodNumber;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    rate: number;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    rate: number;
    displayOrder?: number | undefined;
}>;
export declare const RoleReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    description: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}>;
export declare const PermissionSummaryReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    category: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    code: string;
    category: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    code: string;
    category: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}>;
export declare const ServiceCategoryReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    description: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    description?: string | undefined;
    displayOrder?: number | undefined;
}>;
export declare const RateCardReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    displayOrder: z.ZodOptional<z.ZodNumber>;
} & {
    version: z.ZodString;
    isDefault: z.ZodBoolean;
    isActive: z.ZodBoolean;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    version: string;
    isDefault: boolean;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    displayOrder?: number | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    code: string;
    version: string;
    isDefault: boolean;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    displayOrder?: number | undefined;
}>;
export declare const ReferenceDataResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        code: string;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        code: string;
        displayOrder?: number | undefined;
    }>, "many">;
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        code: string;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        code: string;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const CurrenciesResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        symbol: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        symbol?: string | undefined;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        symbol?: string | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        symbol?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        symbol?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const TaxClassesResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        rate: z.ZodNumber;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        rate: number;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        rate: number;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        rate: number;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        rate: number;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const RolesResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const PermissionsResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        category: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        code: string;
        category: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        code: string;
        category: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        code: string;
        category: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        code: string;
        category: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const ServiceCategoriesResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        description?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export declare const RateCardsResponseSchema: z.ZodObject<{
    total: z.ZodNumber;
    cached: z.ZodBoolean;
    cacheKey: z.ZodString;
} & {
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
    } & {
        version: z.ZodString;
        isDefault: z.ZodBoolean;
        isActive: z.ZodBoolean;
        effectiveFrom: z.ZodOptional<z.ZodString>;
        effectiveUntil: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        version: string;
        isDefault: boolean;
        effectiveFrom?: string | undefined;
        effectiveUntil?: string | undefined;
        displayOrder?: number | undefined;
    }, {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        version: string;
        isDefault: boolean;
        effectiveFrom?: string | undefined;
        effectiveUntil?: string | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        version: string;
        isDefault: boolean;
        effectiveFrom?: string | undefined;
        effectiveUntil?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}, {
    data: {
        id: string;
        name: string;
        isActive: boolean;
        code: string;
        version: string;
        isDefault: boolean;
        effectiveFrom?: string | undefined;
        effectiveUntil?: string | undefined;
        displayOrder?: number | undefined;
    }[];
    total: number;
    cached: boolean;
    cacheKey: string;
}>;
export type CurrencyReference = z.infer<typeof CurrencyReferenceSchema>;
export type TaxClassReference = z.infer<typeof TaxClassReferenceSchema>;
export type RoleReference = z.infer<typeof RoleReferenceSchema>;
export type PermissionSummaryReference = z.infer<typeof PermissionSummaryReferenceSchema>;
export type ServiceCategoryReference = z.infer<typeof ServiceCategoryReferenceSchema>;
export type RateCardReference = z.infer<typeof RateCardReferenceSchema>;
export type ReferenceDataResponse = z.infer<typeof ReferenceDataResponseSchema>;
//# sourceMappingURL=schemas.d.ts.map