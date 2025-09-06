/**
 * Customer DTOs and Repository
 * Drizzle-based customer data access with proper DTOs
 */
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDatabase } from '../lib/db.js';
import { customers } from '../lib/schema.js';
/**
 * Customer repository with Drizzle
 */
export class CustomerRepository {
    organizationId;
    db = getDatabase();
    constructor(organizationId) {
        this.organizationId = organizationId;
    }
    /**
     * List customers with pagination and filtering
     */
    async listCustomers(options) {
        const { page, pageSize, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        // Build conditions
        const conditions = [
            eq(customers.organizationId, this.organizationId),
            isNull(customers.deletedAt)
        ];
        if (filters.isActive !== undefined) {
            conditions.push(eq(customers.status, filters.isActive ? 'active' : 'inactive'));
        }
        if (filters.customerType) {
            conditions.push(eq(customers.customerType, filters.customerType));
        }
        if (filters.createdFrom) {
            conditions.push(sql `${customers.createdAt} >= ${filters.createdFrom}`);
        }
        if (filters.createdTo) {
            conditions.push(sql `${customers.createdAt} <= ${filters.createdTo}`);
        }
        // Search filter
        if (filters.q) {
            conditions.push(sql `(${customers.companyName} ILIKE ${`%${filters.q}%`} OR ${customers.email} ILIKE ${`%${filters.q}%`})`);
        }
        // Build sort
        const sortColumn = this.getSortColumn(sortBy);
        const sortDirection = sortOrder === 'asc' ? asc : desc;
        // Execute queries
        const [customerData, totalResult] = await Promise.all([
            this.db
                .select({
                id: customers.id,
                email: customers.email,
                displayName: customers.companyName,
                isActive: sql `${customers.status} = 'active'`,
                organizationId: customers.organizationId,
            })
                .from(customers)
                .where(and(...conditions))
                .orderBy(sortDirection(sortColumn))
                .limit(pageSize)
                .offset((page - 1) * pageSize),
            this.db
                .select({ count: sql `count(*)` })
                .from(customers)
                .where(and(...conditions))
        ]);
        const total = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(total / pageSize);
        return {
            customers: customerData.map(customer => ({
                ...customer,
                email: customer.email || ''
            })),
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page * pageSize < total,
                hasPrev: page > 1
            }
        };
    }
    /**
     * Get customer by ID
     */
    async getCustomerById(id) {
        const result = await this.db
            .select({
            id: customers.id,
            email: customers.email,
            displayName: customers.companyName,
            isActive: sql `${customers.status} = 'active'`,
            organizationId: customers.organizationId,
        })
            .from(customers)
            .where(and(eq(customers.id, id), eq(customers.organizationId, this.organizationId), isNull(customers.deletedAt)))
            .limit(1);
        return result[0] ? {
            ...result[0],
            email: result[0].email || ''
        } : null;
    }
    /**
     * Get customer by email
     */
    async getCustomerByEmail(email) {
        const result = await this.db
            .select({
            id: customers.id,
            email: customers.email,
            displayName: customers.companyName,
            isActive: sql `${customers.status} = 'active'`,
            organizationId: customers.organizationId,
        })
            .from(customers)
            .where(and(eq(customers.email, email), eq(customers.organizationId, this.organizationId), isNull(customers.deletedAt)))
            .limit(1);
        return result[0] ? {
            ...result[0],
            email: result[0].email || ''
        } : null;
    }
    /**
     * Get sort column
     */
    getSortColumn(sortBy) {
        switch (sortBy) {
            case 'displayName':
                return customers.companyName;
            case 'email':
                return customers.email;
            case 'createdAt':
                return customers.createdAt;
            case 'updatedAt':
                return customers.updatedAt;
            default:
                return customers.createdAt;
        }
    }
}
//# sourceMappingURL=repo.customers.js.map