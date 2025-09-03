import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { PivotalFlowClient } from './index.js';
import * as Types from './types.js';

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

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

/**
 * Hook for user login
 */
export function useLogin(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.LoginResponse, Error, Types.LoginRequest>
) {
  return useMutation({
    mutationFn: (data: Types.LoginRequest) => client.auth.login(data),
    ...options
  });
}

/**
 * Hook for token refresh
 */
export function useRefreshToken(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.RefreshTokenResponse, Error, Types.RefreshTokenRequest>
) {
  return useMutation({
    mutationFn: (data: Types.RefreshTokenRequest) => client.auth.refresh(data),
    ...options
  });
}

/**
 * Hook for user logout
 */
export function useLogout(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.LogoutResponse, Error, Types.LogoutRequest>
) {
  return useMutation({
    mutationFn: (data: Types.LogoutRequest) => client.auth.logout(data),
    ...options
  });
}

/**
 * Hook for getting current user profile
 */
export function useMe(
  client: PivotalFlowClient,
  options?: UseQueryOptions<Types.MeResponse, Error>
) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => client.auth.me(),
    ...options
  });
}

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for listing users
 */
export function useUsers(
  client: PivotalFlowClient,
  params?: Types.UserFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.User>, Error>
) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => client.users.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific user
 */
export function useUser(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.User, Error>
) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => client.users.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for creating a user
 */
export function useCreateUser(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.User, Error, Types.CreateUserRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Types.CreateUserRequest) => client.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    ...options
  });
}

/**
 * Hook for updating a user
 */
export function useUpdateUser(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.User, Error, { id: string; data: Types.UpdateUserRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Types.UpdateUserRequest }) => 
      client.users.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
    ...options
  });
}

// ============================================================================
// QUOTE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for listing quotes
 */
export function useQuotes(
  client: PivotalFlowClient,
  params?: Types.QuoteFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.Quote>, Error>
) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => client.quotes.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific quote
 */
export function useQuote(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.Quote, Error>
) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => client.quotes.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for creating a quote
 */
export function useCreateQuote(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Quote, Error, Types.CreateQuoteRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Types.CreateQuoteRequest) => client.quotes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    ...options
  });
}

/**
 * Hook for updating a quote
 */
export function useUpdateQuote(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Quote, Error, { id: string; data: Types.UpdateQuoteRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Types.UpdateQuoteRequest }) => 
      client.quotes.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
    },
    ...options
  });
}

/**
 * Hook for transitioning quote status
 */
export function useTransitionQuoteStatus(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Quote, Error, { id: string; data: Types.QuoteStatusTransitionRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Types.QuoteStatusTransitionRequest }) => 
      client.quotes.transitionStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
    },
    ...options
  });
}

// ============================================================================
// PERMISSION MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for listing permissions
 */
export function usePermissions(
  client: PivotalFlowClient,
  params?: Types.CommonFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.Permission>, Error>
) {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => client.permissions.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific permission
 */
export function usePermission(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.Permission, Error>
) {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => client.permissions.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for creating a permission
 */
export function useCreatePermission(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Permission, Error, Types.CreatePermissionRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Types.CreatePermissionRequest) => client.permissions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    ...options
  });
}

/**
 * Hook for updating a permission
 */
export function useUpdatePermission(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Permission, Error, { id: string; data: Types.UpdatePermissionRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Types.UpdatePermissionRequest }) => 
      client.permissions.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', id] });
    },
    ...options
  });
}

// ============================================================================
// ROLE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for listing roles
 */
export function useRoles(
  client: PivotalFlowClient,
  params?: Types.CommonFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.Role>, Error>
) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => client.roles.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific role
 */
export function useRole(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.Role, Error>
) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => client.roles.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for creating a role
 */
export function useCreateRole(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Role, Error, Types.CreateRoleRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Types.CreateRoleRequest) => client.roles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    ...options
  });
}

/**
 * Hook for updating a role
 */
export function useUpdateRole(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.Role, Error, { id: string; data: Types.UpdateRoleRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Types.UpdateRoleRequest }) => 
      client.roles.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
    ...options
  });
}

// ============================================================================
// EXPORT JOB HOOKS
// ============================================================================

/**
 * Hook for creating an export job
 */
export function useCreateExport(
  client: PivotalFlowClient,
  options?: UseMutationOptions<Types.ExportJob, Error, Types.CreateExportJobRequest>
) {
  return useMutation({
    mutationFn: (data: Types.CreateExportJobRequest) => client.exports.create(data),
    ...options
  });
}

/**
 * Hook for getting export job status
 */
export function useExportJob(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.ExportJob, Error>
) {
  return useQuery({
    queryKey: ['exports', id],
    queryFn: () => client.exports.get(id),
    enabled: !!id,
    // TODO: Implement proper polling for export job status
    // refetchInterval: (data) => {
    //   return data && (data as Types.ExportJob).status === 'processing' ? 5000 : false;
    // },
    ...options
  });
}

// ============================================================================
// PORTAL HOOKS (CUSTOMER-FACING)
// ============================================================================

/**
 * Hook for listing customer quotes
 */
export function usePortalQuotes(
  client: PivotalFlowClient,
  params?: Types.PortalQuoteFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalQuote>, Error>
) {
  return useQuery({
    queryKey: ['portal', 'quotes', params],
    queryFn: () => client.portal.quotes.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific customer quote
 */
export function usePortalQuote(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.PortalQuote, Error>
) {
  return useQuery({
    queryKey: ['portal', 'quotes', id],
    queryFn: () => client.portal.quotes.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for listing customer invoices
 */
export function usePortalInvoices(
  client: PivotalFlowClient,
  params?: Types.PortalInvoiceFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalInvoice>, Error>
) {
  return useQuery({
    queryKey: ['portal', 'invoices', params],
    queryFn: () => client.portal.invoices.list(params),
    ...options
  });
}

/**
 * Hook for getting a specific customer invoice
 */
export function usePortalInvoice(
  client: PivotalFlowClient,
  id: string,
  options?: UseQueryOptions<Types.PortalInvoice, Error>
) {
  return useQuery({
    queryKey: ['portal', 'invoices', id],
    queryFn: () => client.portal.invoices.get(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for listing customer time entries
 */
export function usePortalTimeEntries(
  client: PivotalFlowClient,
  params: Types.PortalTimeEntryFilters,
  options?: UseQueryOptions<Types.PaginationEnvelope<Types.PortalTimeEntry>, Error>
) {
  return useQuery({
    queryKey: ['portal', 'time-entries', params],
    queryFn: () => client.portal.timeEntries.list(params),
    ...options
  });
}

// ============================================================================
// SYSTEM HOOKS
// ============================================================================

/**
 * Hook for health check
 */
export function useHealth(
  client: PivotalFlowClient,
  options?: UseQueryOptions<Types.HealthResponse, Error>
) {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => client.system.health(),
    refetchInterval: 30000, // Check health every 30 seconds
    ...options
  });
}

/**
 * Hook for metrics
 */
export function useMetrics(
  client: PivotalFlowClient,
  options?: UseQueryOptions<Types.MetricsResponse, Error>
) {
  return useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => client.system.metrics(),
    refetchInterval: 60000, // Update metrics every minute
    ...options
  });
}
