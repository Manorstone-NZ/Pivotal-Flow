export const defaultTenantGuardOptions = {
    requireAuth: true,
    requireOrganization: true,
};
/**
 * Extracts tenant context from request
 */
export function extractTenantContext(authContext) {
    if (!authContext) {
        return null;
    }
    return {
        organizationId: authContext.organizationId,
        userId: authContext.userId,
    };
}
/**
 * Validates tenant context
 */
export function validateTenantContext(context, options = defaultTenantGuardOptions) {
    if (options.requireAuth && !context) {
        return { isValid: false, error: 'Authentication required' };
    }
    if (options.requireOrganization && context && !context.organizationId) {
        return { isValid: false, error: 'Organization context required' };
    }
    if (context && !context.userId) {
        return { isValid: false, error: 'User context required' };
    }
    return { isValid: true };
}
/**
 * Enforces tenant guard for database queries
 */
export function requireOrganizationId(data, organizationId) {
    return {
        ...data,
        organizationId,
    };
}
/**
 * Creates a tenant-aware query filter
 */
export function createTenantFilter(organizationId) {
    return { organizationId };
}
/**
 * Validates that a resource belongs to the specified organization
 */
export function validateResourceOwnership(resource, expectedOrganizationId) {
    if (!resource) {
        return false;
    }
    return resource.organizationId === expectedOrganizationId;
}
/**
 * Creates a tenant guard decorator for Fastify routes
 */
export function createTenantGuard(options = defaultTenantGuardOptions) {
    return function tenantGuard(request, reply, done) {
        const authContext = request.user;
        const context = extractTenantContext(authContext);
        const validation = validateTenantContext(context, options);
        if (!validation.isValid) {
            reply.status(403).send({
                error: 'Forbidden',
                message: validation.error,
                code: 'TENANT_ACCESS_DENIED',
            });
            return;
        }
        // Attach tenant context to request for route handlers
        request.tenantContext = context;
        done();
    };
}
//# sourceMappingURL=guard.js.map