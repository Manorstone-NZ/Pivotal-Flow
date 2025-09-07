import { Type, type Static } from '@sinclair/typebox';

// Currency Response Schema
export const CurrencyResponseSchema = Type.Object({
  code: Type.String(),
  name: Type.String(),
  symbol: Type.String(),
  isActive: Type.Boolean()
});

export type CurrencyResponse = Static<typeof CurrencyResponseSchema>;

// Error response schema
export const CurrencyErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

export type CurrencyError = Static<typeof CurrencyErrorSchema>;
