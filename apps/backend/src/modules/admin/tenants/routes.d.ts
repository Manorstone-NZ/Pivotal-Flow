/**
 * F1A Tenant Admin Portal Routes
 * Secure tenant management endpoints for platform administrators
 *
 * SECURITY COMPLIANCE:
 * - Platform admin permission required (system.super_admin)
 * - Rate limiting applied per admin user
 * - Complete audit trail for all operations
 * - TypeBox validation for all inputs/outputs
 * - No tenant data access - admin operations only
 * - Comprehensive error handling with security-focused responses
 */
import type { FastifyPluginAsync } from 'fastify';
/**
 * Admin Tenant Routes Plugin
 * Implements secure tenant management with comprehensive security controls
 */
export declare const adminTenantRoutes: FastifyPluginAsync;
export default adminTenantRoutes;
//# sourceMappingURL=routes.d.ts.map