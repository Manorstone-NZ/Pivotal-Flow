import { Type, type Static } from '@sinclair/typebox';

// F2 Service Rate Cards - Simplified Services-Only Implementation

// Unit of Measure enum
export const UnitOfMeasureSchema = Type.Union([
  Type.Literal('hour'),
  Type.Literal('day'),
  Type.Literal('fixed')
]);

export type UnitOfMeasure = Static<typeof UnitOfMeasureSchema>;

// Rate Card Schemas (F2)
export const CreateRateCardSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  currency: Type.String({ minLength: 3, maxLength: 3, default: 'NZD' }),
  isActive: Type.Boolean({ default: true })
});

export type CreateRateCard = Static<typeof CreateRateCardSchema>;

export const UpdateRateCardSchema = Type.Partial(CreateRateCardSchema);
export type UpdateRateCard = Static<typeof UpdateRateCardSchema>;

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

export type CreateService = Static<typeof CreateServiceSchema>;

export const UpdateServiceSchema = Type.Partial(CreateServiceSchema);
export type UpdateService = Static<typeof UpdateServiceSchema>;

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

export type ServiceResponse = Static<typeof ServiceResponseSchema>;

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

export type RateCardResponse = Static<typeof RateCardResponseSchema>;

// List Response Schemas
export const RateCardListResponseSchema = Type.Object({
  rateCards: Type.Array(RateCardResponseSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number()
});

export type RateCardListResponse = Static<typeof RateCardListResponseSchema>;

// Query Parameters
export const RateCardListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  search: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean())
});

export type RateCardListQuery = Static<typeof RateCardListQuerySchema>;

// Error Response Schema
export const RateCardErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

export type RateCardError = Static<typeof RateCardErrorSchema>;
