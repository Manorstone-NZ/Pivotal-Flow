/**
 * Reference data constants
 * Configuration and cache settings for reference data endpoints
 */

import type { ReferenceEndpointConfig } from './types.js';

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  CURRENCIES: 300, // 5 minutes
  TAX_CLASSES: 300, // 5 minutes
  ROLES: 600, // 10 minutes
  PERMISSIONS: 600, // 10 minutes
  SERVICE_CATEGORIES: 300, // 5 minutes
  RATE_CARDS: 300, // 5 minutes
} as const;

// Cache key prefixes
export const CACHE_KEY_PREFIXES = {
  CURRENCIES: 'ref:currencies',
  TAX_CLASSES: 'ref:tax_classes',
  ROLES: 'ref:roles',
  PERMISSIONS: 'ref:permissions',
  SERVICE_CATEGORIES: 'ref:service_categories',
  RATE_CARDS: 'ref:rate_cards',
} as const;

// Reference data endpoint configurations
export const REFERENCE_ENDPOINTS: Record<string, ReferenceEndpointConfig> = {
  currencies: {
    endpoint: '/v1/reference/currencies',
    cacheConfig: {
      ttl: CACHE_TTL.CURRENCIES,
      keyPrefix: CACHE_KEY_PREFIXES.CURRENCIES,
      bustOnChange: true,
    },
    requiresAuth: false,
  },
  taxClasses: {
    endpoint: '/v1/reference/tax-classes',
    cacheConfig: {
      ttl: CACHE_TTL.TAX_CLASSES,
      keyPrefix: CACHE_KEY_PREFIXES.TAX_CLASSES,
      bustOnChange: true,
    },
    requiresAuth: false,
  },
  roles: {
    endpoint: '/v1/reference/roles',
    cacheConfig: {
      ttl: CACHE_TTL.ROLES,
      keyPrefix: CACHE_KEY_PREFIXES.ROLES,
      bustOnChange: true,
    },
    requiresAuth: true,
    permissions: ['users.view_roles'],
  },
  permissions: {
    endpoint: '/v1/reference/permissions',
    cacheConfig: {
      ttl: CACHE_TTL.PERMISSIONS,
      keyPrefix: CACHE_KEY_PREFIXES.PERMISSIONS,
      bustOnChange: true,
    },
    requiresAuth: true,
    permissions: ['permissions.view_permissions'],
  },
  serviceCategories: {
    endpoint: '/v1/reference/service-categories',
    cacheConfig: {
      ttl: CACHE_TTL.SERVICE_CATEGORIES,
      keyPrefix: CACHE_KEY_PREFIXES.SERVICE_CATEGORIES,
      bustOnChange: true,
    },
    requiresAuth: false,
  },
  rateCards: {
    endpoint: '/v1/reference/rate-cards',
    cacheConfig: {
      ttl: CACHE_TTL.RATE_CARDS,
      keyPrefix: CACHE_KEY_PREFIXES.RATE_CARDS,
      bustOnChange: true,
    },
    requiresAuth: true,
    permissions: ['rate_cards.view_rate_cards'],
  },
} as const;

// Metrics names
export const REFERENCE_METRICS = {
  CACHE_HIT: 'pivotal_reference_cache_hit_total',
  CACHE_MISS: 'pivotal_reference_cache_miss_total',
  CACHE_BUST: 'pivotal_reference_cache_bust_total',
  ENDPOINT_REQUEST: 'pivotal_reference_endpoint_request_total',
  ENDPOINT_DURATION: 'pivotal_reference_endpoint_duration_seconds',
} as const;

// Error messages
export const REFERENCE_ERRORS = {
  CACHE_ERROR: 'Cache operation failed',
  PERMISSION_DENIED: 'Permission denied for reference data',
  DATA_NOT_FOUND: 'Reference data not found',
  INVALID_ENDPOINT: 'Invalid reference endpoint',
} as const;
