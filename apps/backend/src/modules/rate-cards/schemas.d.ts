import { z } from 'zod';
export declare const CreateRateCardSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    effectiveFrom: z.ZodString;
    effectiveUntil: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    metadata: Record<string, unknown>;
    isActive: boolean;
    currency: string;
    effectiveFrom: string;
    isDefault: boolean;
    description?: string | undefined;
    effectiveUntil?: string | undefined;
}, {
    name: string;
    effectiveFrom: string;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveUntil?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const UpdateRateCardSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveUntil: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isDefault: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const CreateRateCardItemSchema: z.ZodObject<{
    rateCardId: z.ZodString;
    serviceCategoryId: z.ZodString;
    roleId: z.ZodOptional<z.ZodString>;
    baseRate: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    effectiveFrom: z.ZodString;
    effectiveUntil: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    serviceCategoryId: string;
    rateCardId: string;
    metadata: Record<string, unknown>;
    isActive: boolean;
    currency: string;
    effectiveFrom: string;
    baseRate: number;
    roleId?: string | undefined;
    effectiveUntil?: string | undefined;
}, {
    serviceCategoryId: string;
    rateCardId: string;
    effectiveFrom: string;
    baseRate: number;
    metadata?: Record<string, unknown> | undefined;
    roleId?: string | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveUntil?: string | undefined;
}>;
export declare const UpdateRateCardItemSchema: z.ZodObject<{
    rateCardId: z.ZodOptional<z.ZodString>;
    serviceCategoryId: z.ZodOptional<z.ZodString>;
    roleId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    baseRate: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveUntil: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    serviceCategoryId?: string | undefined;
    rateCardId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    roleId?: string | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    baseRate?: number | undefined;
}, {
    serviceCategoryId?: string | undefined;
    rateCardId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    roleId?: string | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveUntil?: string | undefined;
    baseRate?: number | undefined;
}>;
export declare function validateRateCardData(data: z.infer<typeof CreateRateCardSchema>): {
    isValid: boolean;
    errors: string[];
};
export declare function validateRateCardItemData(data: z.infer<typeof CreateRateCardItemSchema>): {
    isValid: boolean;
    errors: string[];
};
export type CreateRateCardSchema = z.infer<typeof CreateRateCardSchema>;
export type UpdateRateCardSchema = z.infer<typeof UpdateRateCardSchema>;
export type CreateRateCardItemSchema = z.infer<typeof CreateRateCardItemSchema>;
export type UpdateRateCardItemSchema = z.infer<typeof UpdateRateCardItemSchema>;
//# sourceMappingURL=schemas.d.ts.map