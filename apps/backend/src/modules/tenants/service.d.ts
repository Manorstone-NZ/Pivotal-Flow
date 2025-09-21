/**
 * F1 Tenant Administration Service
 * Business logic for tenant CRUD and membership management
 */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Static } from '@sinclair/typebox';
import type { CreateTenantSchema, UpdateTenantSchema, CreateMembershipSchema, UpdateMembershipSchema, UpdateTenantFeaturesSchema } from './typeboxSchemas.js';
export declare class TenantService {
    private db;
    constructor(database?: PostgresJsDatabase<any>);
    /**
     * List all tenants with pagination
     */
    listTenants(options?: {
        page?: number;
        limit?: number;
        sortBy?: 'name' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        tenants: {
            id: string;
            name: string;
            slug: string;
            billingEmail: string;
            defaultCurrency: string;
            timezone: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get tenant by ID
     */
    getTenantById(tenantId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        billingEmail: string;
        defaultCurrency: string;
        timezone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Get tenant by slug
     */
    getTenantBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        billingEmail: string;
        defaultCurrency: string;
        timezone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Create new tenant
     */
    createTenant(data: Static<typeof CreateTenantSchema>, creatorUserId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        slug: string;
        timezone: string;
        billingEmail: string;
        defaultCurrency: string;
    } | undefined>;
    /**
     * Update tenant
     */
    updateTenant(tenantId: string, data: Static<typeof UpdateTenantSchema>): Promise<{
        id: string;
        name: string;
        slug: string;
        billingEmail: string;
        defaultCurrency: string;
        timezone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Delete tenant (and cascade to memberships, features)
     */
    deleteTenant(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        slug: string;
        timezone: string;
        billingEmail: string;
        defaultCurrency: string;
    }>;
    /**
     * List memberships for a tenant
     */
    listMemberships(tenantId: string, options?: {
        page?: number;
        limit?: number;
        includeUser?: boolean;
    }): Promise<{
        memberships: {
            id: string;
            userId: string;
            tenantId: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get membership by user and tenant
     */
    getMembership(userId: string, tenantId: string): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Create membership
     */
    createMembership(tenantId: string, data: Static<typeof CreateMembershipSchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        role: string;
        tenantId: string;
    } | undefined>;
    /**
     * Update membership role
     */
    updateMembership(userId: string, tenantId: string, data: Static<typeof UpdateMembershipSchema>): Promise<{
        id: string;
        userId: string;
        tenantId: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Delete membership
     */
    deleteMembership(userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        role: string;
        tenantId: string;
    }>;
    /**
     * Get tenant features
     */
    getTenantFeatures(tenantId: string): Promise<{
        features: {
            id: string;
            tenantId: string;
            featureCode: string;
            enabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    /**
     * Update tenant features
     */
    updateTenantFeatures(tenantId: string, data: Static<typeof UpdateTenantFeaturesSchema>): Promise<{
        features: ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            featureCode: string;
            enabled: boolean;
        } | undefined)[];
    }>;
    /**
     * Initialize default features for new tenant
     */
    initializeTenantFeatures(tenantId: string): Promise<{
        features: {
            id: string;
            tenantId: string;
            featureCode: string;
            enabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    /**
     * Get all memberships for a user (for JWT generation)
     */
    getUserMemberships(userId: string): Promise<{
        tenantId: string;
        role: string;
        tenant: {
            id: string;
            name: string;
            slug: string;
            status: string;
        } | null;
    }[]>;
}
//# sourceMappingURL=service.d.ts.map