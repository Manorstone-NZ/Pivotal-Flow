import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type * as Types from './types.js';
import type { PivotalFlowClient } from './index.js';
/**
 * React Query hooks for Pivotal Flow API
 *
 * @example
 * ```typescript
 * import { useQuotes, useCreateQuote } from '@pivotal-flow/sdk/react-query';
 *
 * function QuotesList() {
 *   const { data: quotes, isLoading } = useQuotes({ page: 1, pageSize: 10 });
 *   const createQuote = useCreateQuote();
 *
 *   return (
 *     <div>
 *       {quotes?.items.map(quote => (
 *         <div key={quote.id}>{quote.id}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
/**
 * Hook for user login
 */
export declare function useLogin(client: PivotalFlowClient, options?: UseMutationOptions<Types.LoginResponse, Error, Types.LoginRequest>): import("@tanstack/react-query").UseMutationResult<Types.LoginResponse, Error, Types.LoginRequest, unknown>;
/**
 * Hook for token refresh
 */
export declare function useRefreshToken(client: PivotalFlowClient, options?: UseMutationOptions<Types.RefreshTokenResponse, Error, Types.RefreshTokenRequest>): import("@tanstack/react-query").UseMutationResult<Types.RefreshTokenResponse, Error, Types.RefreshTokenRequest, unknown>;
/**
 * Hook for user logout
 */
export declare function useLogout(client: PivotalFlowClient, options?: UseMutationOptions<Types.LogoutResponse, Error, Types.LogoutRequest>): import("@tanstack/react-query").UseMutationResult<Types.LogoutResponse, Error, Types.LogoutRequest, unknown>;
/**
 * Hook for getting current user profile
 */
export declare function useMe(client: PivotalFlowClient, options?: UseQueryOptions<Types.MeResponse, Error>): import("@tanstack/react-query").UseQueryResult<Types.MeResponse, Error>;
/**
 * Hook for listing users
 */
export declare function useUsers(client: PivotalFlowClient, params?: Types.UserFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.User>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.User>, Error>;
/**
 * Hook for getting a specific user
 */
export declare function useUser(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.User, Error>): import("@tanstack/react-query").UseQueryResult<Types.User, Error>;
/**
 * Hook for creating a user
 */
export declare function useCreateUser(client: PivotalFlowClient, options?: UseMutationOptions<Types.User, Error, Types.CreateUserRequest>): import("@tanstack/react-query").UseMutationResult<Types.User, Error, Types.CreateUserRequest, unknown>;
/**
 * Hook for updating a user
 */
export declare function useUpdateUser(client: PivotalFlowClient, options?: UseMutationOptions<Types.User, Error, {
    id: string;
    data: Types.UpdateUserRequest;
}>): import("@tanstack/react-query").UseMutationResult<Types.User, Error, {
    id: string;
    data: Types.UpdateUserRequest;
}, unknown>;
/**
 * Hook for listing quotes
 */
export declare function useQuotes(client: PivotalFlowClient, params?: Types.QuoteFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.Quote>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.Quote>, Error>;
/**
 * Hook for getting a specific quote
 */
export declare function useQuote(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.Quote, Error>): import("@tanstack/react-query").UseQueryResult<Types.Quote, Error>;
/**
 * Hook for creating a quote
 */
export declare function useCreateQuote(client: PivotalFlowClient, options?: UseMutationOptions<Types.Quote, Error, Types.CreateQuoteRequest>): import("@tanstack/react-query").UseMutationResult<Types.Quote, Error, Types.CreateQuoteRequest, unknown>;
/**
 * Hook for updating a quote
 */
export declare function useUpdateQuote(client: PivotalFlowClient, options?: UseMutationOptions<Types.Quote, Error, {
    id: string;
    data: Types.UpdateQuoteRequest;
}>): import("@tanstack/react-query").UseMutationResult<Types.Quote, Error, {
    id: string;
    data: Types.UpdateQuoteRequest;
}, unknown>;
/**
 * Hook for transitioning quote status
 */
export declare function useTransitionQuoteStatus(client: PivotalFlowClient, options?: UseMutationOptions<Types.Quote, Error, {
    id: string;
    data: Types.QuoteStatusTransitionRequest;
}>): import("@tanstack/react-query").UseMutationResult<Types.Quote, Error, {
    id: string;
    data: Types.QuoteStatusTransitionRequest;
}, unknown>;
/**
 * Hook for listing permissions
 */
export declare function usePermissions(client: PivotalFlowClient, params?: Types.CommonFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.Permission>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.Permission>, Error>;
/**
 * Hook for getting a specific permission
 */
export declare function usePermission(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.Permission, Error>): import("@tanstack/react-query").UseQueryResult<Types.Permission, Error>;
/**
 * Hook for creating a permission
 */
export declare function useCreatePermission(client: PivotalFlowClient, options?: UseMutationOptions<Types.Permission, Error, Types.CreatePermissionRequest>): import("@tanstack/react-query").UseMutationResult<Types.Permission, Error, Types.CreatePermissionRequest, unknown>;
/**
 * Hook for updating a permission
 */
export declare function useUpdatePermission(client: PivotalFlowClient, options?: UseMutationOptions<Types.Permission, Error, {
    id: string;
    data: Types.UpdatePermissionRequest;
}>): import("@tanstack/react-query").UseMutationResult<Types.Permission, Error, {
    id: string;
    data: Types.UpdatePermissionRequest;
}, unknown>;
/**
 * Hook for listing roles
 */
export declare function useRoles(client: PivotalFlowClient, params?: Types.CommonFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.Role>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.Role>, Error>;
/**
 * Hook for getting a specific role
 */
export declare function useRole(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.Role, Error>): import("@tanstack/react-query").UseQueryResult<Types.Role, Error>;
/**
 * Hook for creating a role
 */
export declare function useCreateRole(client: PivotalFlowClient, options?: UseMutationOptions<Types.Role, Error, Types.CreateRoleRequest>): import("@tanstack/react-query").UseMutationResult<Types.Role, Error, Types.CreateRoleRequest, unknown>;
/**
 * Hook for updating a role
 */
export declare function useUpdateRole(client: PivotalFlowClient, options?: UseMutationOptions<Types.Role, Error, {
    id: string;
    data: Types.UpdateRoleRequest;
}>): import("@tanstack/react-query").UseMutationResult<Types.Role, Error, {
    id: string;
    data: Types.UpdateRoleRequest;
}, unknown>;
/**
 * Hook for creating an export job
 */
export declare function useCreateExport(client: PivotalFlowClient, options?: UseMutationOptions<Types.ExportJob, Error, Types.CreateExportJobRequest>): import("@tanstack/react-query").UseMutationResult<Types.ExportJob, Error, Types.CreateExportJobRequest, unknown>;
/**
 * Hook for getting export job status
 */
export declare function useExportJob(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.ExportJob, Error>): import("@tanstack/react-query").UseQueryResult<Types.ExportJob, Error>;
/**
 * Hook for listing customer quotes
 */
export declare function usePortalQuotes(client: PivotalFlowClient, params?: Types.PortalQuoteFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalQuote>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.PortalQuote>, Error>;
/**
 * Hook for getting a specific customer quote
 */
export declare function usePortalQuote(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.PortalQuote, Error>): import("@tanstack/react-query").UseQueryResult<Types.PortalQuote, Error>;
/**
 * Hook for listing customer invoices
 */
export declare function usePortalInvoices(client: PivotalFlowClient, params?: Types.PortalInvoiceFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalInvoice>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.PortalInvoice>, Error>;
/**
 * Hook for getting a specific customer invoice
 */
export declare function usePortalInvoice(client: PivotalFlowClient, id: string, options?: UseQueryOptions<Types.PortalInvoice, Error>): import("@tanstack/react-query").UseQueryResult<Types.PortalInvoice, Error>;
/**
 * Hook for listing customer time entries
 */
export declare function usePortalTimeEntries(client: PivotalFlowClient, params: Types.PortalTimeEntryFilters, options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalTimeEntry>, Error>): import("@tanstack/react-query").UseQueryResult<Types.PaginationEnvelope<Types.PortalTimeEntry>, Error>;
/**
 * Hook for health check
 */
export declare function useHealth(client: PivotalFlowClient, options?: UseQueryOptions<Types.HealthResponse, Error>): import("@tanstack/react-query").UseQueryResult<Types.HealthResponse, Error>;
/**
 * Hook for metrics
 */
export declare function useMetrics(client: PivotalFlowClient, options?: UseQueryOptions<Types.MetricsResponse, Error>): import("@tanstack/react-query").UseQueryResult<Types.MetricsResponse, Error>;
//# sourceMappingURL=react-query.d.ts.map