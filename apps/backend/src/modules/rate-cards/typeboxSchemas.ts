import { Type, type Static } from '@sinclair/typebox';

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

export type CreateRateCard = Static<typeof CreateRateCardSchema>;

export const UpdateRateCardSchema = Type.Partial(CreateRateCardSchema);

export type UpdateRateCard = Static<typeof UpdateRateCardSchema>;

// Rate Card Item Schemas
export const CreateRateCardItemSchema = Type.Object({
  serviceCategoryId: Type.String(),
  roleId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  itemCode: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  unit: Type.String({ default: 'hour' }),
  baseRate: Type.String(), // Accept as string for precision
  currency: Type.String({ minLength: 3, maxLength: 3, default: 'NZD' }),
  taxClass: Type.String({ default: 'standard' }),
  tieringModelId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  effectiveFrom: Type.String(),
  effectiveUntil: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  isActive: Type.Optional(Type.Boolean({ default: true })),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { default: {} }))
});

export type CreateRateCardItem = Static<typeof CreateRateCardItemSchema>;

export const UpdateRateCardItemSchema = Type.Partial(CreateRateCardItemSchema);

export type UpdateRateCardItem = Static<typeof UpdateRateCardItemSchema>;

// Response Schemas
export const RateCardResponseSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  version: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  currency: Type.String(),
  effectiveFrom: Type.String(),
  effectiveUntil: Type.Union([Type.String(), Type.Null()]),
  isDefault: Type.Boolean(),
  isActive: Type.Boolean(),
  metadata: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type RateCardResponse = Static<typeof RateCardResponseSchema>;

export const RateCardItemResponseSchema = Type.Object({
  id: Type.String(),
  rateCardId: Type.String(),
  serviceCategoryId: Type.String(),
  roleId: Type.Union([Type.String(), Type.Null()]),
  itemCode: Type.Union([Type.String(), Type.Null()]),
  unit: Type.String(),
  baseRate: Type.String(), // Stored as string for precision
  currency: Type.String(),
  taxClass: Type.String(),
  tieringModelId: Type.Union([Type.String(), Type.Null()]),
  effectiveFrom: Type.String(),
  effectiveUntil: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  metadata: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type RateCardItemResponse = Static<typeof RateCardItemResponseSchema>;

// Error response schema
export const RateCardErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

export type RateCardError = Static<typeof RateCardErrorSchema>;
