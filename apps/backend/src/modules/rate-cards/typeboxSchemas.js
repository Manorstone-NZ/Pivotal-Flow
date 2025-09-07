import { Type } from '@sinclair/typebox';
// Rate Card Schemas
export const CreateRateCardSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 255 }),
    description: Type.Optional(Type.String()),
    currency: Type.String({ minLength: 3, maxLength: 3, default: 'NZD' }),
    effectiveFrom: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    effectiveUntil: Type.Optional(Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
    isDefault: Type.Boolean({ default: false }),
    isActive: Type.Boolean({ default: true }),
    metadata: Type.Record(Type.String(), Type.Unknown(), { default: {} })
});
export const UpdateRateCardSchema = Type.Partial(CreateRateCardSchema);
// Rate Card Item Schemas
export const CreateRateCardItemSchema = Type.Object({
    rateCardId: Type.String({ format: 'uuid' }),
    serviceCategoryId: Type.String({ format: 'uuid' }),
    roleId: Type.Optional(Type.String({ format: 'uuid' })),
    baseRate: Type.Number({ minimum: 0, maximum: 999999.9999 }),
    currency: Type.String({ minLength: 3, maxLength: 3, default: 'NZD' }),
    effectiveFrom: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    effectiveUntil: Type.Optional(Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
    isActive: Type.Boolean({ default: true }),
    metadata: Type.Record(Type.String(), Type.Unknown(), { default: {} })
});
export const UpdateRateCardItemSchema = Type.Partial(CreateRateCardItemSchema);
// Response Schemas
export const RateCardResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    currency: Type.String(),
    effectiveFrom: Type.String(),
    effectiveUntil: Type.Optional(Type.String()),
    isDefault: Type.Boolean(),
    isActive: Type.Boolean(),
    metadata: Type.Record(Type.String(), Type.Unknown()),
    organizationId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    items: Type.Array(Type.Object({
        id: Type.String(),
        serviceCategoryId: Type.String(),
        roleId: Type.Optional(Type.String()),
        baseRate: Type.Number(),
        currency: Type.String(),
        effectiveFrom: Type.String(),
        effectiveUntil: Type.Optional(Type.String()),
        isActive: Type.Boolean(),
        metadata: Type.Record(Type.String(), Type.Unknown()),
        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' })
    }))
});
export const RateCardItemResponseSchema = Type.Object({
    id: Type.String(),
    rateCardId: Type.String(),
    serviceCategoryId: Type.String(),
    roleId: Type.Optional(Type.String()),
    baseRate: Type.Number(),
    currency: Type.String(),
    effectiveFrom: Type.String(),
    effectiveUntil: Type.Optional(Type.String()),
    isActive: Type.Boolean(),
    metadata: Type.Record(Type.String(), Type.Unknown()),
    organizationId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
});
// Error response schema
export const RateCardErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=typeboxSchemas.js.map