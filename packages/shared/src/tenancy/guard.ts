import type { AuthContext } from '../security/jwt-types.js';

export interface TenantContext {
  organizationId: string;
  userId: string;
}

export interface TenantGuardOptions {
  requireAuth: boolean;
  requireOrganization: boolean;
}

export const defaultTenantGuardOptions: TenantGuardOptions = {
  requireAuth: true,
  requireOrganization: true,
};

/**
 * Extracts tenant context from request
 */
export function extractTenantContext(authContext: AuthContext | null): TenantContext | null {
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
export function validateTenantContext(
  context: TenantContext | null,
  options: TenantGuardOptions = defaultTenantGuardOptions
): { isValid: boolean; error?: string } {
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
export function requireOrganizationId<T extends Record<string, any>>(
  data: T,
  organizationId: string
): T & { organizationId: string } {
  return {
    ...data,
    organizationId,
  };
}

/**
 * Creates a tenant-aware query filter
 */
export function createTenantFilter(organizationId: string) {
  return { organizationId };
}

/**
 * Validates that a resource belongs to the specified organization
 */
export function validateResourceOwnership(
  resource: { organizationId: string } | null,
  expectedOrganizationId: string
): boolean {
  if (!resource) {
    return false;
  }

  return resource.organizationId === expectedOrganizationId;
}

/**
 * Creates a tenant guard decorator for Fastify routes
 */
export function createTenantGuard(options: TenantGuardOptions = defaultTenantGuardOptions) {
  return function tenantGuard(request: any, reply: any, done: () => void) {
    const authContext = request.user as AuthContext | null;
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
