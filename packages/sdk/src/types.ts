/**
 * TypeScript types generated from Pivotal Flow API OpenAPI specification
 * These types correspond to the API models and ensure type safety
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Global error response model used across all API endpoints
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    request_id: string;
  };
  meta: {
    api_version: string;
    documentation_url: string;
  };
}

/**
 * Standard pagination envelope for list endpoints
 */
export interface PaginationEnvelope<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  meta: {
    api_version: string;
    documentation_url: string;
    organization_id?: string;
  };
}

/**
 * Common filter parameters for list endpoints
 */
export interface CommonFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * User authentication data
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  organizationId: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

/**
 * Login response with tokens
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: User;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Logout request
 */
export interface LogoutRequest {
  refreshToken: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Current user profile response
 */
export interface MeResponse {
  user: User;
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

/**
 * Create user request
 */
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationId: string;
  roles?: string[];
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * User filters for list endpoint
 */
export interface UserFilters extends CommonFilters {
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  organizationId?: string;
}

// ============================================================================
// QUOTE TYPES
// ============================================================================

/**
 * Quote status enumeration
 */
export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'cancelled';

/**
 * Quote line item
 */
export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  total: number;
  serviceCategoryId?: string;
  rateCardId?: string;
}

/**
 * Quote entity
 */
export interface Quote {
  id: string;
  organizationId: string;
  customerId: string;
  projectId?: string;
  status: QuoteStatus;
  totalAmount: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  lineItems: QuoteLineItem[];
}

/**
 * Create quote request
 */
export interface CreateQuoteRequest {
  customerId: string;
  projectId?: string;
  currency: string;
  validFrom: string;
  validUntil: string;
  notes?: string;
  lineItems: Omit<QuoteLineItem, 'id'>[];
}

/**
 * Update quote request
 */
export interface UpdateQuoteRequest {
  customerId?: string;
  projectId?: string;
  currency?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
  lineItems?: Omit<QuoteLineItem, 'id'>[];
}

/**
 * Quote status transition request
 */
export interface QuoteStatusTransitionRequest {
  status: QuoteStatus;
  notes?: string;
}

/**
 * Quote filters for list endpoint
 */
export interface QuoteFilters extends CommonFilters {
  status?: QuoteStatus;
  customerId?: string;
  projectId?: string;
  validFrom?: string;
  validUntil?: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Permission entity
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create permission request
 */
export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * Update permission request
 */
export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

// ============================================================================
// ROLE TYPES
// ============================================================================

/**
 * Role entity
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create role request
 */
export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

/**
 * Update role request
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ============================================================================
// EXPORT JOB TYPES
// ============================================================================

/**
 * Export job status
 */
export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Export job entity
 */
export interface ExportJob {
  id: string;
  organizationId: string;
  reportType: string;
  status: ExportJobStatus;
  format: 'csv' | 'json';
  filters?: Record<string, any>;
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create export job request
 */
export interface CreateExportJobRequest {
  reportType: string;
  format: 'csv' | 'json';
  filters?: Record<string, any>;
}

// ============================================================================
// PORTAL TYPES
// ============================================================================

/**
 * Customer visible quote status
 */
export type CustomerVisibleQuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

/**
 * Portal quote (customer-facing)
 */
export interface PortalQuote {
  id: string;
  status: CustomerVisibleQuoteStatus;
  totalAmount: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  notes?: string;
  createdAt: string;
  lineItems: QuoteLineItem[];
}

/**
 * Portal quote filters
 */
export interface PortalQuoteFilters extends CommonFilters {
  status?: CustomerVisibleQuoteStatus;
  fromDate?: string;
  toDate?: string;
}

/**
 * Customer visible invoice status
 */
export type CustomerVisibleInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Portal invoice (customer-facing)
 */
export interface PortalInvoice {
  id: string;
  status: CustomerVisibleInvoiceStatus;
  totalAmount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  lineItems: QuoteLineItem[];
}

/**
 * Portal invoice filters
 */
export interface PortalInvoiceFilters extends CommonFilters {
  status?: CustomerVisibleInvoiceStatus;
  fromDate?: string;
  toDate?: string;
}

/**
 * Portal time entry (customer-facing)
 */
export interface PortalTimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  durationHours: number;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

/**
 * Portal time entry filters
 */
export interface PortalTimeEntryFilters extends CommonFilters {
  projectId: string;
  fromMonth?: string;
  toMonth?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  metrics: {
    totalRequests: number;
    totalErrors: number;
    activeConnections: number;
  };
}

/**
 * Metrics response
 */
export interface MetricsResponse {
  // Prometheus metrics as string
  metrics: string;
}
