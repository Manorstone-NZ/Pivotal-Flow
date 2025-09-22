import { Type } from '@sinclair/typebox';
// F2 Service Rate Cards - Simplified Services-Only Implementation
// Unit of Measure enum
export const UnitOfMeasureSchema = Type.Union([
    Type.Literal('hour'),
    Type.Literal('day'),
    Type.Literal('fixed')
]);
// Rate Card Schemas (F2)
export const CreateRateCardSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 255 }),
    description: Type.Optional(Type.String()),
    currency: Type.String({ minLength: 3, maxLength: 3, default: 'NZD' }),
    isActive: Type.Boolean({ default: true })
});
export const UpdateRateCardSchema = Type.Partial(CreateRateCardSchema);
// Service Schemas (F2)
export const CreateServiceSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 255 }),
    description: Type.Optional(Type.String()),
    unitOfMeasure: UnitOfMeasureSchema,
    buyPrice: Type.Number({ minimum: 0, multipleOf: 0.01 }), // Cost
    sellPrice: Type.Number({ minimum: 0, multipleOf: 0.01 }), // Revenue
    taxClass: Type.String({ default: 'standard' }),
    isActive: Type.Boolean({ default: true }),
    sortOrder: Type.Number({ minimum: 0, default: 0 })
});
export const UpdateServiceSchema = Type.Partial(CreateServiceSchema);
// Response Schemas (F2)
export const ServiceResponseSchema = Type.Object({
    id: Type.String(),
    rateCardId: Type.String(),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    unitOfMeasure: UnitOfMeasureSchema,
    buyPrice: Type.Number(),
    sellPrice: Type.Number(),
    taxClass: Type.String(),
    isActive: Type.Boolean(),
    sortOrder: Type.Number(),
    createdAt: Type.String(),
    updatedAt: Type.String()
});
export const RateCardResponseSchema = Type.Object({
    id: Type.String(),
    organizationId: Type.String(),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    currency: Type.String(),
    isActive: Type.Boolean(),
    services: Type.Array(ServiceResponseSchema),
    createdAt: Type.String(),
    updatedAt: Type.String()
});
// List Response Schemas
export const RateCardListResponseSchema = Type.Object({
    rateCards: Type.Array(RateCardResponseSchema),
    total: Type.Number(),
    page: Type.Number(),
    limit: Type.Number()
});
// Query Parameters
export const RateCardListQuerySchema = Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
    search: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean())
});
// Error Response Schema
export const RateCardErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=f2Schemas.js.map