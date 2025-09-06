import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
export function useLogin(client, options) {
    return useMutation({
        mutationFn: (data) => client.auth.login(data),
        ...options
    });
}
/**
 * Hook for token refresh
 */
export function useRefreshToken(client, options) {
    return useMutation({
        mutationFn: (data) => client.auth.refresh(data),
        ...options
    });
}
/**
 * Hook for user logout
 */
export function useLogout(client, options) {
    return useMutation({
        mutationFn: (data) => client.auth.logout(data),
        ...options
    });
}
/**
 * Hook for getting current user profile
 */
export function useMe(client, options) {
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
export function useUsers(client, params, options) {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => client.users.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific user
 */
export function useUser(client, id, options) {
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
export function useCreateUser(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => client.users.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        ...options
    });
}
/**
 * Hook for updating a user
 */
export function useUpdateUser(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => client.users.update(id, data),
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
export function useQuotes(client, params, options) {
    return useQuery({
        queryKey: ['quotes', params],
        queryFn: () => client.quotes.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific quote
 */
export function useQuote(client, id, options) {
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
export function useCreateQuote(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => client.quotes.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
        ...options
    });
}
/**
 * Hook for updating a quote
 */
export function useUpdateQuote(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => client.quotes.update(id, data),
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
export function useTransitionQuoteStatus(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => client.quotes.transitionStatus(id, data),
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
export function usePermissions(client, params, options) {
    return useQuery({
        queryKey: ['permissions', params],
        queryFn: () => client.permissions.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific permission
 */
export function usePermission(client, id, options) {
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
export function useCreatePermission(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => client.permissions.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
        ...options
    });
}
/**
 * Hook for updating a permission
 */
export function useUpdatePermission(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => client.permissions.update(id, data),
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
export function useRoles(client, params, options) {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: () => client.roles.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific role
 */
export function useRole(client, id, options) {
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
export function useCreateRole(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => client.roles.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        ...options
    });
}
/**
 * Hook for updating a role
 */
export function useUpdateRole(client, options) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => client.roles.update(id, data),
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
export function useCreateExport(client, options) {
    return useMutation({
        mutationFn: (data) => client.exports.create(data),
        ...options
    });
}
/**
 * Hook for getting export job status
 */
export function useExportJob(client, id, options) {
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
export function usePortalQuotes(client, params, options) {
    return useQuery({
        queryKey: ['portal', 'quotes', params],
        queryFn: () => client.portal.quotes.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific customer quote
 */
export function usePortalQuote(client, id, options) {
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
export function usePortalInvoices(client, params, options) {
    return useQuery({
        queryKey: ['portal', 'invoices', params],
        queryFn: () => client.portal.invoices.list(params),
        ...options
    });
}
/**
 * Hook for getting a specific customer invoice
 */
export function usePortalInvoice(client, id, options) {
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
export function usePortalTimeEntries(client, params, options) {
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
export function useHealth(client, options) {
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
export function useMetrics(client, options) {
    return useQuery({
        queryKey: ['system', 'metrics'],
        queryFn: () => client.system.metrics(),
        refetchInterval: 60000, // Update metrics every minute
        ...options
    });
}
//# sourceMappingURL=react-query.js.map