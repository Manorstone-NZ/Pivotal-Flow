import { z } from 'zod';
// Rate Card Schemas
export const CreateRateCardSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be less than 255 characters'),
    description: z.string().optional(),
    currency: z.string().length(3, 'Currency must be 3 characters').default('NZD'),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be a valid date (YYYY-MM-DD)'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be a valid date (YYYY-MM-DD)').optional(),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    metadata: z.record(z.unknown()).default({}),
});
export const UpdateRateCardSchema = CreateRateCardSchema.partial();
// Rate Card Item Schemas
export const CreateRateCardItemSchema = z.object({
    rateCardId: z.string().uuid('Rate card ID must be a valid UUID'),
    serviceCategoryId: z.string().uuid('Service category ID must be a valid UUID'),
    roleId: z.string().uuid('Role ID must be a valid UUID').optional(),
    baseRate: z.number().positive('Base rate must be positive').max(999999.9999, 'Base rate must be less than 1,000,000'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('NZD'),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from must be a valid date (YYYY-MM-DD)'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective until must be a valid date (YYYY-MM-DD)').optional(),
    isActive: z.boolean().default(true),
    metadata: z.record(z.unknown()).default({}),
});
export const UpdateRateCardItemSchema = CreateRateCardItemSchema.partial();
// Validation functions
export function validateRateCardData(data) {
    const result = CreateRateCardSchema.safeParse(data);
    if (!result.success) {
        return {
            isValid: false,
            errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
    }
    // Additional business logic validation
    const errors = [];
    if (data.effectiveUntil && new Date(data.effectiveFrom) >= new Date(data.effectiveUntil)) {
        errors.push('Effective from date must be before effective until date');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
export function validateRateCardItemData(data) {
    const result = CreateRateCardItemSchema.safeParse(data);
    if (!result.success) {
        return {
            isValid: false,
            errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
    }
    // Additional business logic validation
    const errors = [];
    if (data.effectiveUntil && new Date(data.effectiveFrom) >= new Date(data.effectiveUntil)) {
        errors.push('Effective from date must be before effective until date');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=schemas.js.map