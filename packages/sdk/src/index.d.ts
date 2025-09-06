import type { AxiosInstance } from 'axios';
import type * as Types from './types.js';
/**
 * Configuration for the Pivotal Flow SDK client
 */
export interface PivotalFlowConfig {
    /** Base URL for the API (e.g., 'https://api.pivotalflow.com/api/v1') */
    baseURL: string;
    /** Default timeout in milliseconds */
    timeout?: number;
    /** Function to get the current access token */
    getAccessToken?: () => string | null;
    /** Function to refresh the access token */
    refreshToken?: () => Promise<string | null>;
    /** Custom axios instance */
    axiosInstance?: AxiosInstance;
}
/**
 * Pivotal Flow API client with full TypeScript support
 *
 * @example
 * ```typescript
 * const client = new PivotalFlowClient({
 *   baseURL: 'https://api.pivotalflow.com/api/v1',
 *   getAccessToken: () => localStorage.getItem('accessToken'),
 *   refreshToken: async () => {
 *     // Implement token refresh logic
 *     return 'new-token';
 *   }
 * });
 *
 * // Login
 * const loginResponse = await client.auth.login({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 *
 * // Get quotes
 * const quotes = await client.quotes.list({
 *   page: 1,
 *   pageSize: 10,
 *   status: 'approved'
 * });
 * ```
 */
export declare class PivotalFlowClient {
    private config;
    protected axios: AxiosInstance;
    constructor(config: PivotalFlowConfig);
    /**
     * Make a request to the API with proper error handling
     */
    private request;
    /**
     * Authentication endpoints
     */
    auth: {
        /**
         * Login with email and password
         */
        login: (data: Types.LoginRequest) => Promise<Types.LoginResponse>;
        /**
         * Refresh access token
         */
        refresh: (data: Types.RefreshTokenRequest) => Promise<Types.RefreshTokenResponse>;
        /**
         * Logout user
         */
        logout: (data: Types.LogoutRequest) => Promise<Types.LogoutResponse>;
        /**
         * Get current user profile
         */
        me: () => Promise<Types.MeResponse>;
    };
    /**
     * User management endpoints
     */
    users: {
        /**
         * List users with pagination and filtering
         */
        list: (params?: Types.UserFilters) => Promise<Types.PaginationEnvelope<Types.User>>;
        /**
         * Get user by ID
         */
        get: (id: string) => Promise<Types.User>;
        /**
         * Create new user
         */
        create: (data: Types.CreateUserRequest) => Promise<Types.User>;
        /**
         * Update user
         */
        update: (id: string, data: Types.UpdateUserRequest) => Promise<Types.User>;
    };
    /**
     * Quote management endpoints
     */
    quotes: {
        /**
         * List quotes with pagination and filtering
         */
        list: (params?: Types.QuoteFilters) => Promise<Types.PaginationEnvelope<Types.Quote>>;
        /**
         * Get quote by ID
         */
        get: (id: string) => Promise<Types.Quote>;
        /**
         * Create new quote
         */
        create: (data: Types.CreateQuoteRequest) => Promise<Types.Quote>;
        /**
         * Update quote
         */
        update: (id: string, data: Types.UpdateQuoteRequest) => Promise<Types.Quote>;
        /**
         * Transition quote status
         */
        transitionStatus: (id: string, data: Types.QuoteStatusTransitionRequest) => Promise<Types.Quote>;
    };
    /**
     * Permission management endpoints
     */
    permissions: {
        /**
         * List permissions
         */
        list: (params?: Types.CommonFilters) => Promise<Types.PaginationEnvelope<Types.Permission>>;
        /**
         * Get permission by ID
         */
        get: (id: string) => Promise<Types.Permission>;
        /**
         * Create new permission
         */
        create: (data: Types.CreatePermissionRequest) => Promise<Types.Permission>;
        /**
         * Update permission
         */
        update: (id: string, data: Types.UpdatePermissionRequest) => Promise<Types.Permission>;
    };
    /**
     * Role management endpoints
     */
    roles: {
        /**
         * List roles
         */
        list: (params?: Types.CommonFilters) => Promise<Types.PaginationEnvelope<Types.Role>>;
        /**
         * Get role by ID
         */
        get: (id: string) => Promise<Types.Role>;
        /**
         * Create new role
         */
        create: (data: Types.CreateRoleRequest) => Promise<Types.Role>;
        /**
         * Update role
         */
        update: (id: string, data: Types.UpdateRoleRequest) => Promise<Types.Role>;
    };
    /**
     * Export job endpoints
     */
    exports: {
        /**
         * Create export job
         */
        create: (data: Types.CreateExportJobRequest) => Promise<Types.ExportJob>;
        /**
         * Get export job status
         */
        get: (id: string) => Promise<Types.ExportJob>;
        /**
         * Download export file
         */
        download: (id: string) => Promise<Blob>;
    };
    /**
     * Portal endpoints (customer-facing)
     */
    portal: {
        /**
         * List customer quotes
         */
        quotes: {
            list: (params?: Types.PortalQuoteFilters) => Promise<Types.PaginationEnvelope<Types.PortalQuote>>;
            get: (id: string) => Promise<Types.PortalQuote>;
        };
        /**
         * List customer invoices
         */
        invoices: {
            list: (params?: Types.PortalInvoiceFilters) => Promise<Types.PaginationEnvelope<Types.PortalInvoice>>;
            get: (id: string) => Promise<Types.PortalInvoice>;
        };
        /**
         * List customer time entries
         */
        timeEntries: {
            list: (params: Types.PortalTimeEntryFilters) => Promise<Types.PaginationEnvelope<Types.PortalTimeEntry>>;
        };
    };
    /**
     * System endpoints
     */
    system: {
        /**
         * Health check
         */
        health: () => Promise<Types.HealthResponse>;
        /**
         * Get metrics
         */
        metrics: () => Promise<Types.MetricsResponse>;
    };
}
export * from './types.js';
export * from './gen/types.js';
export { GeneratedPivotalFlowClient } from './gen/client.js';
//# sourceMappingURL=index.d.ts.map