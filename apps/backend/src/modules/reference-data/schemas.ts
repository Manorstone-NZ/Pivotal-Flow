/**
 * Reference data schemas
 * Zod validation schemas for reference data responses
 */

import { z } from 'zod';

// Base reference data item schema
export const ReferenceDataItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  displayOrder: z.number().optional(),
});

// Currency reference schema
export const CurrencyReferenceSchema = ReferenceDataItemSchema.extend({
  symbol: z.string().optional(),
  isActive: z.boolean(),
});

// Tax class reference schema
export const TaxClassReferenceSchema = ReferenceDataItemSchema.extend({
  rate: z.number(),
  isActive: z.boolean(),
});

// Role reference schema
export const RoleReferenceSchema = ReferenceDataItemSchema.extend({
  description: z.string().optional(),
  isActive: z.boolean(),
});

// Permission summary reference schema
export const PermissionSummaryReferenceSchema = ReferenceDataItemSchema.extend({
  category: z.string(),
  description: z.string().optional(),
});

// Service category reference schema
export const ServiceCategoryReferenceSchema = ReferenceDataItemSchema.extend({
  description: z.string().optional(),
  isActive: z.boolean(),
});

// Rate card reference schema
export const RateCardReferenceSchema = ReferenceDataItemSchema.extend({
  version: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  effectiveFrom: z.string().optional(),
  effectiveUntil: z.string().optional(),
});

// Reference data response schema
export const ReferenceDataResponseSchema = z.object({
  data: z.array(ReferenceDataItemSchema),
  total: z.number(),
  cached: z.boolean(),
  cacheKey: z.string(),
});

// Specific response schemas
export const CurrenciesResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(CurrencyReferenceSchema),
});

export const TaxClassesResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(TaxClassReferenceSchema),
});

export const RolesResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(RoleReferenceSchema),
});

export const PermissionsResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(PermissionSummaryReferenceSchema),
});

export const ServiceCategoriesResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(ServiceCategoryReferenceSchema),
});

export const RateCardsResponseSchema = ReferenceDataResponseSchema.extend({
  data: z.array(RateCardReferenceSchema),
});

// Type exports
export type CurrencyReference = z.infer<typeof CurrencyReferenceSchema>;
export type TaxClassReference = z.infer<typeof TaxClassReferenceSchema>;
export type RoleReference = z.infer<typeof RoleReferenceSchema>;
export type PermissionSummaryReference = z.infer<typeof PermissionSummaryReferenceSchema>;
export type ServiceCategoryReference = z.infer<typeof ServiceCategoryReferenceSchema>;
export type RateCardReference = z.infer<typeof RateCardReferenceSchema>;
export type ReferenceDataResponse = z.infer<typeof ReferenceDataResponseSchema>;
