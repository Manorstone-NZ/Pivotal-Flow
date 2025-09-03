/**
 * Portal Module Constants
 * 
 * Constants for the customer portal API system
 */

// Portal user types
export const PORTAL_USER_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL_CUSTOMER: 'external_customer'
} as const;

export type PortalUserType = typeof PORTAL_USER_TYPES[keyof typeof PORTAL_USER_TYPES];

// Portal permissions - read-only access only
export const PORTAL_PERMISSIONS = {
  VIEW_OWN_QUOTES: 'portal.view_own_quotes',
  VIEW_OWN_INVOICES: 'portal.view_own_invoices', 
  VIEW_OWN_TIME_ENTRIES: 'portal.view_own_time_entries'
} as const;

export type PortalPermission = typeof PORTAL_PERMISSIONS[keyof typeof PORTAL_PERMISSIONS];

// Quote status values visible to customers
export const CUSTOMER_VISIBLE_QUOTE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REJECTED: 'rejected'
} as const;

export type CustomerVisibleQuoteStatus = typeof CUSTOMER_VISIBLE_QUOTE_STATUSES[keyof typeof CUSTOMER_VISIBLE_QUOTE_STATUSES];

// Invoice status values visible to customers  
export const CUSTOMER_VISIBLE_INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PART_PAID: 'part_paid',
  PAID: 'paid',
  OVERDUE: 'overdue'
} as const;

export type CustomerVisibleInvoiceStatus = typeof CUSTOMER_VISIBLE_INVOICE_STATUSES[keyof typeof CUSTOMER_VISIBLE_INVOICE_STATUSES];

// Portal rate limiting
export const PORTAL_RATE_LIMITS = {
  DEFAULT_RPM: 200, // 200 requests per minute
  BURST_LIMIT: 50,  // Burst allowance
  WINDOW_MS: 60000  // 1 minute window
} as const;

// Portal metrics
export const PORTAL_METRICS = {
  REQUESTS_TOTAL: 'pivotal_portal_requests_total',
  REQUEST_DURATION_MS: 'pivotal_portal_request_duration_ms',
  AUTH_FAILURES_TOTAL: 'pivotal_portal_auth_failures_total',
  RATE_LIMIT_HITS_TOTAL: 'pivotal_portal_rate_limit_hits_total',
  ISOLATION_VIOLATIONS_TOTAL: 'pivotal_portal_isolation_violations_total'
} as const;

// Portal API configuration
export const PORTAL_CONFIG = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  PERFORMANCE_TARGET_MS: 250 // Target response time for page of 25 items
} as const;
