/**
 * Rate Cards Feature Types
 * Matches backend API contracts for rate cards and items
 */

export interface RateCard {
  id: string;
  organizationId: string;
  name: string;
  version: string;
  description?: string | undefined;
  currency: string;           // ISO 4217 (NZD, USD, EUR, etc.)
  effectiveFrom: string;      // ISO date
  effectiveUntil?: string | undefined;    // ISO date
  isDefault: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RateCardItem {
  id: string;
  rateCardId: string;
  serviceCategoryId: string;
  roleId?: string | null;
  itemCode?: string | null;
  unit: string;               // "hour", "day", "fixed", etc.
  baseRate: string;           // Stored as string for precision
  currency: string;           // ISO 4217
  taxClass: string;           // "standard", "exempt", etc.
  tieringModelId?: string | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateCard {
  name: string;
  version?: string | undefined;
  description?: string | undefined;
  currency: string;
  effectiveFrom: string;
  effectiveUntil?: string | undefined;
  isDefault?: boolean | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface UpdateRateCard {
  name?: string | undefined;
  version?: string | undefined;
  description?: string | undefined;
  currency?: string | undefined;
  effectiveFrom?: string | undefined;
  effectiveUntil?: string | undefined;
  isDefault?: boolean | undefined;
  isActive?: boolean | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface CreateRateCardItem {
  serviceCategoryId: string;
  roleId?: string | null;
  itemCode?: string | null;
  unit: string;
  baseRate: string;
  currency: string;
  taxClass: string;
  tieringModelId?: string | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateRateCardItem {
  serviceCategoryId?: string;
  roleId?: string | null;
  itemCode?: string | null;
  unit?: string;
  baseRate?: string;
  currency?: string;
  taxClass?: string;
  tieringModelId?: string | null;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface RateCardsListResponse {
  data: RateCard[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | undefined;
}

export interface RateCardItemsResponse {
  data: RateCardItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | undefined;
}

export interface RateCardsFilters {
  search?: string | undefined;
  status?: 'active' | 'inactive' | 'all' | undefined;
  currency?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface RateCardItemsFilters {
  search?: string;
  category?: string;
  unit?: string;
  page?: number;
  limit?: number;
}

// Currency configuration for formatting
export interface CurrencyConfig {
  symbol: string;
  decimals: number;
  position: 'before' | 'after';
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  NZD: { symbol: '$', decimals: 2, position: 'before' },
  USD: { symbol: '$', decimals: 2, position: 'before' },
  EUR: { symbol: '€', decimals: 2, position: 'before' },
  GBP: { symbol: '£', decimals: 2, position: 'before' },
  JPY: { symbol: '¥', decimals: 0, position: 'before' },
  AUD: { symbol: '$', decimals: 2, position: 'before' },
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIGS);

export const RATE_UNITS = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'item', label: 'Per Item' },
] as const;

export const TAX_CLASSES = [
  { value: 'standard', label: 'Standard Rate' },
  { value: 'reduced', label: 'Reduced Rate' },
  { value: 'exempt', label: 'Tax Exempt' },
  { value: 'zero', label: 'Zero Rate' },
] as const;
