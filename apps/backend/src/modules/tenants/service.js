/**
 * F1 Tenant Administration Service
 * Business logic for tenant CRUD and membership management
 */
import { generateId } from '@pivotal-flow/shared';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { getDatabase } from '../../lib/db.js';
import { tenants, memberships, tenantFeatures, users } from '../../lib/schema.js';
export class TenantService {
    db;
    constructor(database) {
        this.db = database || getDatabase();
    }
    // ============================================================================
    // TENANT CRUD OPERATIONS
    // ============================================================================
    /**
     * List all tenants with pagination
     */
    async listTenants(options = {}) {
        const { page = 1, limit = 25, sortBy = 'name', sortOrder = 'asc' } = options;
        const offset = (page - 1) * limit;
        // Build sort expression
        const sortColumn = sortBy === 'name' ? tenants.name : tenants.createdAt;
        const sortExpression = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
        // Get total count
        const [totalResult] = await this.db
            .select({ count: count() })
            .from(tenants);
        const total = totalResult?.count || 0;
        // Get paginated results
        const results = await this.db
            .select()
            .from(tenants)
            .orderBy(sortExpression)
            .limit(limit)
            .offset(offset);
        return {
            tenants: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get tenant by ID
     */
    async getTenantById(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId))
            .limit(1);
        return tenant || null;
    }
    /**
     * Get tenant by slug
     */
    async getTenantBySlug(slug) {
        const [tenant] = await this.db
            .select()
            .from(tenants)
            .where(eq(tenants.slug, slug))
            .limit(1);
        return tenant || null;
    }
    /**
     * Create new tenant
     */
    async createTenant(data, creatorUserId) {
        // Check if slug already exists
        const existingTenant = await this.getTenantBySlug(data.slug);
        if (existingTenant) {
            throw new Error('TENANT_SLUG_EXISTS');
        }
        const tenantId = generateId();
        const now = new Date();
        // Create tenant
        const [newTenant] = await this.db
            .insert(tenants)
            .values({
            id: tenantId,
            name: data.name,
            slug: data.slug,
            billingEmail: data.billingEmail,
            defaultCurrency: data.defaultCurrency || 'USD',
            timezone: data.timezone || 'UTC',
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        // If creator provided, create OWNER membership
        if (creatorUserId) {
            await this.createMembership(tenantId, {
                userId: creatorUserId,
                role: 'OWNER',
            });
            // Create default feature flags
            await this.initializeTenantFeatures(tenantId);
        }
        return newTenant;
    }
    /**
     * Update tenant
     */
    async updateTenant(tenantId, data) {
        const now = new Date();
        const [updatedTenant] = await this.db
            .update(tenants)
            .set({
            ...data,
            updatedAt: now,
        })
            .where(eq(tenants.id, tenantId))
            .returning();
        if (!updatedTenant) {
            throw new Error('TENANT_NOT_FOUND');
        }
        return updatedTenant;
    }
    /**
     * Delete tenant (and cascade to memberships, features)
     */
    async deleteTenant(tenantId) {
        const [deletedTenant] = await this.db
            .delete(tenants)
            .where(eq(tenants.id, tenantId))
            .returning();
        if (!deletedTenant) {
            throw new Error('TENANT_NOT_FOUND');
        }
        return deletedTenant;
    }
    // ============================================================================
    // MEMBERSHIP MANAGEMENT
    // ============================================================================
    /**
     * List memberships for a tenant
     */
    async listMemberships(tenantId, options = {}) {
        const { page = 1, limit = 25, includeUser = true } = options;
        const offset = (page - 1) * limit;
        // Get total count
        const [totalResult] = await this.db
            .select({ count: count() })
            .from(memberships)
            .where(eq(memberships.tenantId, tenantId));
        const total = totalResult?.count || 0;
        // Get memberships with optional user data
        let query = this.db
            .select({
            id: memberships.id,
            userId: memberships.userId,
            tenantId: memberships.tenantId,
            role: memberships.role,
            createdAt: memberships.createdAt,
            updatedAt: memberships.updatedAt,
            ...(includeUser && {
                user: {
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                },
            }),
        })
            .from(memberships);
        if (includeUser) {
            query = query.leftJoin(users, eq(memberships.userId, users.id));
        }
        const results = await query
            .where(eq(memberships.tenantId, tenantId))
            .orderBy(asc(memberships.createdAt))
            .limit(limit)
            .offset(offset);
        return {
            memberships: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get membership by user and tenant
     */
    async getMembership(userId, tenantId) {
        const [membership] = await this.db
            .select()
            .from(memberships)
            .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)))
            .limit(1);
        return membership || null;
    }
    /**
     * Create membership
     */
    async createMembership(tenantId, data) {
        // Check if membership already exists
        const existingMembership = await this.getMembership(data.userId, tenantId);
        if (existingMembership) {
            throw new Error('MEMBERSHIP_EXISTS');
        }
        const now = new Date();
        const [newMembership] = await this.db
            .insert(memberships)
            .values({
            id: generateId(),
            userId: data.userId,
            tenantId,
            role: data.role,
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        return newMembership;
    }
    /**
     * Update membership role
     */
    async updateMembership(userId, tenantId, data) {
        const now = new Date();
        const [updatedMembership] = await this.db
            .update(memberships)
            .set({
            role: data.role,
            updatedAt: now,
        })
            .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)))
            .returning();
        if (!updatedMembership) {
            throw new Error('MEMBERSHIP_NOT_FOUND');
        }
        return updatedMembership;
    }
    /**
     * Delete membership
     */
    async deleteMembership(userId, tenantId) {
        const [deletedMembership] = await this.db
            .delete(memberships)
            .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)))
            .returning();
        if (!deletedMembership) {
            throw new Error('MEMBERSHIP_NOT_FOUND');
        }
        return deletedMembership;
    }
    // ============================================================================
    // FEATURE MANAGEMENT
    // ============================================================================
    /**
     * Get tenant features
     */
    async getTenantFeatures(tenantId) {
        const features = await this.db
            .select()
            .from(tenantFeatures)
            .where(eq(tenantFeatures.tenantId, tenantId))
            .orderBy(asc(tenantFeatures.featureCode));
        return { features };
    }
    /**
     * Update tenant features
     */
    async updateTenantFeatures(tenantId, data) {
        const now = new Date();
        const results = [];
        for (const feature of data.features) {
            // Upsert each feature
            const [updatedFeature] = await this.db
                .insert(tenantFeatures)
                .values({
                id: generateId(),
                tenantId,
                featureCode: feature.featureCode,
                enabled: feature.enabled,
                createdAt: now,
                updatedAt: now,
            })
                .onConflictDoUpdate({
                target: [tenantFeatures.tenantId, tenantFeatures.featureCode],
                set: {
                    enabled: feature.enabled,
                    updatedAt: now,
                },
            })
                .returning();
            results.push(updatedFeature);
        }
        return { features: results };
    }
    /**
     * Initialize default features for new tenant
     */
    async initializeTenantFeatures(tenantId) {
        const defaultFeatures = [
            'Quotes',
            'Invoices',
            'CustomerPortal',
            'RateCards',
            'TimeTracking',
            'Projects',
            'Reports',
            'UserManagement',
        ];
        const now = new Date();
        const featureData = defaultFeatures.map(featureCode => ({
            id: generateId(),
            tenantId,
            featureCode,
            enabled: true,
            createdAt: now,
            updatedAt: now,
        }));
        await this.db.insert(tenantFeatures).values(featureData);
        return { features: featureData };
    }
    // ============================================================================
    // USER TENANT MEMBERSHIPS
    // ============================================================================
    /**
     * Get all memberships for a user (for JWT generation)
     */
    async getUserMemberships(userId) {
        const userMemberships = await this.db
            .select({
            tenantId: memberships.tenantId,
            role: memberships.role,
            tenant: {
                id: tenants.id,
                name: tenants.name,
                slug: tenants.slug,
                status: tenants.status,
            },
        })
            .from(memberships)
            .leftJoin(tenants, eq(memberships.tenantId, tenants.id))
            .where(eq(memberships.userId, userId))
            .orderBy(asc(tenants.name));
        return userMemberships;
    }
}
//# sourceMappingURL=service.js.map