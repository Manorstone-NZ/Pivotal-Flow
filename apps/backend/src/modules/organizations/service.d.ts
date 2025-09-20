/**
 * Organization service
 * Business logic and database operations for organization management
 */
import type { FastifyInstance } from 'fastify';
import '../../plugins/database.js';
import type { Organization, CreateOrganizationData, UpdateOrganizationData, InviteUserData, OrganizationFilters, PaginationOptions, OrganizationListResponse, OrganizationSettings } from './types.js';
export declare class OrganizationService {
    private fastify;
    private currentUserId;
    private currentOrgId?;
    constructor(fastify: FastifyInstance, currentUserId: string, currentOrgId?: string | undefined);
    /**
     * Generate unique organization slug
     */
    private generateOrganizationSlug;
    /**
     * List organizations with filtering and pagination
     */
    listOrganizations(filters?: OrganizationFilters, pagination?: PaginationOptions): Promise<OrganizationListResponse>;
    /**
     * Get organization by ID
     */
    getOrganizationById(organizationId: string): Promise<Organization | null>;
    /**
     * Create new organization
     */
    createOrganization(data: CreateOrganizationData): Promise<Organization>;
    /**
     * Update existing organization
     */
    updateOrganization(organizationId: string, data: UpdateOrganizationData): Promise<Organization | null>;
    /**
     * Soft delete organization
     */
    deleteOrganization(organizationId: string): Promise<boolean>;
    /**
     * Get organization settings
     */
    getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null>;
    /**
     * Update organization settings
     */
    updateOrganizationSettings(organizationId: string, settings: OrganizationSettings): Promise<OrganizationSettings | null>;
    /**
     * Invite user to organization
     * Note: This is a placeholder - full implementation would require
     * user invitation table and email service integration
     */
    inviteUser(organizationId: string, inviteData: InviteUserData): Promise<{
        inviteId: string;
        email: string;
    }>;
    /**
     * Check if user can manage organizations
     */
    private canManageOrganizations;
    /**
     * Check if user can view organizations
     */
    private canViewOrganizations;
}
//# sourceMappingURL=service.d.ts.map