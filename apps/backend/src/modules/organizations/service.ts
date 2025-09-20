/**
 * Organization service
 * Business logic and database operations for organization management
 */

import type { FastifyInstance } from 'fastify';
import { eq, and, isNull, ilike, desc, asc, count } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';

import { organizations, type Organization as DbOrganization, type NewOrganization as DbNewOrganization } from '../../lib/schema.js';

// Import database plugin types
import '../../plugins/database.js';
import type { 
  Organization, 
  NewOrganization, 
  CreateOrganizationData, 
  UpdateOrganizationData,
  InviteUserData,
  OrganizationFilters,
  PaginationOptions,
  OrganizationListResponse,
  OrganizationSettings
} from './types.js';

export class OrganizationService {
  constructor(
    private fastify: FastifyInstance,
    private currentUserId: string,
    private currentOrgId?: string
  ) {}

  /**
   * Generate unique organization slug
   */
  private async generateOrganizationSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const db = this.fastify.db;
    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness
    while (true) {
      const existing = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * List organizations with filtering and pagination
   */
  async listOrganizations(
    filters: OrganizationFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<OrganizationListResponse> {
    const db = this.fastify.db;
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      isNull(organizations.deletedAt)
    ];

    if (filters.search) {
      whereConditions.push(
        ilike(organizations.name, `%${filters.search}%`)
      );
    }

    if (filters.industry) {
      whereConditions.push(eq(organizations.industry, filters.industry));
    }

    if (filters.size) {
      whereConditions.push(eq(organizations.size, filters.size));
    }

    if (filters.subscriptionPlan) {
      whereConditions.push(eq(organizations.subscriptionPlan, filters.subscriptionPlan));
    }

    if (filters.subscriptionStatus) {
      whereConditions.push(eq(organizations.subscriptionStatus, filters.subscriptionStatus));
    }

    // Build order by
    const sortOrder = filters.sortOrder || 'desc';
    const orderByClause = sortOrder === 'asc' ? asc(organizations.createdAt) : desc(organizations.createdAt);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(organizations)
      .where(and(...whereConditions));
    
    const total = totalResult[0]?.count || 0;

    // Get organizations
    const result = await db
      .select()
      .from(organizations)
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      data: result as unknown as Organization[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(organizationId: string): Promise<Organization | null> {
    const db = this.fastify.db;

    const result = await db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .limit(1);

    return (result[0] as unknown as Organization) || null;
  }

  /**
   * Create new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const db = this.fastify.db;
    
    const organizationId = generateId();
    const slug = data.slug || await this.generateOrganizationSlug(data.name);

    const newOrganization: DbNewOrganization = {
      id: organizationId,
      name: data.name,
      slug,
      domain: data.domain,
      industry: data.industry,
      size: data.size,
      timezone: data.timezone || 'UTC',
      currency: data.currency || 'USD',
      taxId: data.taxId,
      // Address
      street: data.street,
      suburb: data.suburb,
      city: data.city,
      region: data.region,
      postcode: data.postcode,
      country: data.country,
      // Contact
      phone: data.phone,
      email: data.email,
      website: data.website,
      // Settings
      contactExtras: null,
      settings: data.settings || {},
      subscriptionPlan: data.subscriptionPlan || 'basic',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      updatedAt: new Date(),
    };

    const result = await db
      .insert(organizations)
      .values(newOrganization)
      .returning();

    return result[0] as unknown as Organization;
  }

  /**
   * Update existing organization
   */
  async updateOrganization(
    organizationId: string,
    data: UpdateOrganizationData
  ): Promise<Organization | null> {
    const db = this.fastify.db;

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(organizations)
      .set(updateData)
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .returning();

    return (result[0] as unknown as Organization) || null;
  }

  /**
   * Soft delete organization
   */
  async deleteOrganization(organizationId: string): Promise<boolean> {
    const db = this.fastify.db;

    const result = await db
      .update(organizations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null> {
    const db = this.fastify.db;

    const result = await db
      .select({ settings: organizations.settings })
      .from(organizations)
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .limit(1);

    return result[0]?.settings || null;
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    organizationId: string,
    settings: OrganizationSettings
  ): Promise<OrganizationSettings | null> {
    const db = this.fastify.db;

    const result = await db
      .update(organizations)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt)
        )
      )
      .returning({ settings: organizations.settings });

    return result[0]?.settings || null;
  }

  /**
   * Invite user to organization
   * Note: This is a placeholder - full implementation would require
   * user invitation table and email service integration
   */
  async inviteUser(
    organizationId: string,
    inviteData: InviteUserData
  ): Promise<{ inviteId: string; email: string }> {
    // TODO: Implement full user invitation system
    // This would typically:
    // 1. Create invitation record in database
    // 2. Send invitation email
    // 3. Generate invitation token
    // 4. Handle invitation acceptance flow

    const inviteId = generateId();
    
    // For now, return mock response
    // In full implementation, this would create invitation record
    return {
      inviteId,
      email: inviteData.email,
    };
  }

  /**
   * Check if user can manage organizations
   */
  private async canManageOrganizations(): Promise<boolean> {
    // TODO: Implement proper permission check
    // This should check if current user has 'orgs.manage' permission
    return true; // Temporary - allow all for development
  }

  /**
   * Check if user can view organizations
   */
  private async canViewOrganizations(): Promise<boolean> {
    // TODO: Implement proper permission check
    // This should check if current user has 'orgs.view' permission
    return true; // Temporary - allow all for development
  }
}
