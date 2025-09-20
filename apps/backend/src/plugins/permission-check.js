/**
 * Permission Check Plugin
 * Adds middleware to validate user permissions for protected routes
 */
import fp from 'fastify-plugin';
import { ROUTE_PERMISSIONS } from '../lib/access-control.js';
/**
 * Get the required permission for a route
 */
function getRequiredPermission(method, url) {
    // Remove query parameters and normalize URL
    const cleanUrl = url.split('?')[0].replace(/\/api\/v1/, '');
    const routeKey = `${method} ${cleanUrl}`;
    // console.log(`🔍 Permission check: ${method} ${url} -> ${routeKey}`);
    // Check exact matches first
    if (ROUTE_PERMISSIONS[routeKey]) {
        return ROUTE_PERMISSIONS[routeKey];
    }
    // Check pattern matches (for routes with parameters)
    for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
        if (permission && route.includes(':')) {
            const [routeMethod, routePath] = route.split(' ');
            if (routeMethod === method) {
                // Convert route pattern to regex
                const regexPattern = routePath
                    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
                    .replace(/\//g, '\\/'); // Escape forward slashes
                const regex = new RegExp(`^${regexPattern}$`);
                if (regex.test(cleanUrl)) {
                    return permission;
                }
            }
        }
    }
    return null;
}
/**
 * Check if user has the required permission
 */
function hasPermission(user, requiredPermission) {
    // Super admin gets everything
    if (user.roles.includes('super_admin') || user.roles.includes('admin')) {
        return true;
    }
    // Check if user has the specific permission
    if (user.permissions.includes(requiredPermission)) {
        return true;
    }
    // Check for tenant admin permissions
    if (user.roles.includes('tenant_admin')) {
        const tenantPermissions = [
            'Tenant Admin Access',
            'Manage Users',
            'Manage Customers',
            'Manage Projects',
            'Manage Quotes',
            'View Reports'
        ];
        return tenantPermissions.includes(requiredPermission);
    }
    return false;
}
const permissionCheckPlugin = async (fastify) => {
    // Add permission check hook after authentication
    fastify.addHook('preHandler', async (request, reply) => {
        const { method, url } = request;
        // Skip permission check for public routes
        const publicRoutes = ['/health', '/auth/login', '/auth/register', '/auth/refresh', '/auth/me', '/public/quotes'];
        const isPublicRoute = publicRoutes.some(route => url.includes(route));
        if (isPublicRoute) {
            return;
        }
        // Skip if no user (auth plugin should have handled this)
        const user = request.user;
        if (!user) {
            return;
        }
        // Get required permission for this route
        const requiredPermission = getRequiredPermission(method, url);
        // If no permission required, allow access
        if (!requiredPermission) {
            return;
        }
        // Check if user has the required permission
        if (!hasPermission(user, requiredPermission)) {
            fastify.log.warn({
                userId: user.userId,
                method,
                url,
                requiredPermission,
                userPermissions: user.permissions,
                userRoles: user.roles
            }, 'Permission denied');
            // Simple audit logging for permission denial
            fastify.log.warn({
                audit: {
                    action: 'permission.denied',
                    userId: user.userId,
                    organizationId: user.organizationId,
                    requiredPermission,
                    route: url,
                    userRoles: user.roles,
                    userPermissions: user.permissions.slice(0, 3),
                }
            }, '🚫 Permission denied - audit logged');
            return reply.status(403).send({
                error: 'Forbidden',
                message: `Insufficient permissions. Required: ${requiredPermission}`,
                code: 'PERMISSION_DENIED'
            });
        }
        // Log successful permission check
        fastify.log.info({
            audit: {
                action: 'permission.granted',
                userId: user.userId,
                organizationId: user.organizationId,
                requiredPermission,
                route: url,
            }
        }, '✅ Permission granted - audit logged');
    });
};
export default fp(permissionCheckPlugin, {
    name: 'permission-check'
});
//# sourceMappingURL=permission-check.js.map