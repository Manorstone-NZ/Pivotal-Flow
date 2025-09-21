/**
 * F1A Tenant Admin Portal Service
 * Implements secure tenant management operations for platform administrators
 *
 * SECURITY COMPLIANCE:
 * - Platform admin access only (system.super_admin permission)
 * - No tenant switching - read-only tenant data access
 * - Complete audit trail for all operations
 * - Input validation with TypeBox schemas
 * - Rate limiting and access controls
 */
import type { FastifyInstance } from 'fastify';
import type { CreateTenant, UpdateTenant, CreateMembership, TenantListQuery, TenantResponse, MembershipResponse, TenantDetailResponse, TenantListResponse } from './schemas.js';
export interface AdminTenantServiceOptions {
    fastify: FastifyInstance;
    adminUserId: string;
    adminOrganizationId: string;
}
/**
 * Tenant Administration Service
 * Platform admin operations for tenant lifecycle management
 */
export declare class AdminTenantService {
    private options;
    private db;
    private auditLogger;
    constructor(options: AdminTenantServiceOptions);
    /**
     * List tenants with pagination and search
     * SECURITY: Platform admin access only
     */
    listTenants(query: TenantListQuery): Promise<TenantListResponse>;
    /**
     * Get tenant details with memberships and stats
     * SECURITY: Platform admin access only, no tenant data access
     */
    getTenantDetails(tenantId: string): Promise<TenantDetailResponse>;
    /**
     * Create new tenant
     * SECURITY: Platform admin only, full audit trail
     */
    createTenant(data: CreateTenant): Promise<TenantResponse>;
    /**
     * Update tenant information
     * SECURITY: Platform admin only, full audit trail
     */
    updateTenant(tenantId: string, data: UpdateTenant): Promise<TenantResponse>;
    /**
     * Add user membership to tenant
     * SECURITY: Platform admin only, validates user exists
     */
    addMembership(tenantId: string, data: CreateMembership): Promise<MembershipResponse>;
    /**
     * Remove user membership from tenant
     * SECURITY: Platform admin only, prevents removing last owner
     */
    removeMembership(tenantId: string, membershipId: string): Promise<{
        message: string;
    }>;
    /**
     * Verify platform admin access
     * SECURITY: Ensures only platform admins can access tenant management
     */
    private verifyPlatformAdminAccess;
}
export declare const createAdminTenantService: (options: AdminTenantServiceOptions) => AdminTenantService;
//# sourceMappingURL=service.d.ts.map