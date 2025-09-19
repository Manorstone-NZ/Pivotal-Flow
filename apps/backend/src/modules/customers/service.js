/**
 * Customer Service Layer
 * Business logic and database operations for customers and contacts
 */
import { eq, and, or, like, desc, asc, isNull, inArray, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { customers, customerContacts } from '../../lib/schema.js';
/**
 * Customer Service Class
 * Handles all customer and contact operations
 */
export class CustomerService {
    fastify;
    organizationId;
    userId;
    constructor(fastify, organizationId, userId) {
        this.fastify = fastify;
        this.organizationId = organizationId;
        this.userId = userId;
    }
    /**
     * Generate unique customer number
     */
    async generateCustomerNumber() {
        const prefix = 'CUST';
        const timestamp = Date.now().toString().slice(-6);
        const random = nanoid(4).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    /**
     * List customers with filtering and pagination
     */
    async listCustomers(filters, pagination) {
        const db = this.fastify.db;
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;
        // Build where conditions
        const whereConditions = [
            eq(customers.organizationId, this.organizationId),
            isNull(customers.deletedAt),
        ];
        if (filters.search) {
            whereConditions.push(or(like(customers.companyName, `%${filters.search}%`), like(customers.legalName, `%${filters.search}%`), like(customers.email, `%${filters.search}%`)));
        }
        if (filters.status) {
            whereConditions.push(eq(customers.status, filters.status));
        }
        if (filters.customerType) {
            whereConditions.push(eq(customers.customerType, filters.customerType));
        }
        if (filters.industry) {
            whereConditions.push(eq(customers.industry, filters.industry));
        }
        if (filters.source) {
            whereConditions.push(eq(customers.source, filters.source));
        }
        if (filters.tags && filters.tags.length > 0) {
            whereConditions.push(sql `${customers.tags} && ${filters.tags}`);
        }
        // Build order by
        const orderBy = [];
        if (filters.sortBy) {
            const column = customers[filters.sortBy];
            if (column) {
                orderBy.push(filters.sortOrder === 'asc' ? asc(column) : desc(column));
            }
        }
        else {
            orderBy.push(desc(customers.createdAt));
        }
        // Get customers
        const customerList = await db
            .select()
            .from(customers)
            .where(and(...whereConditions))
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset);
        // Get total count
        const totalResult = await db
            .select({ count: sql `count(*)` })
            .from(customers)
            .where(and(...whereConditions));
        const total = totalResult[0]?.count || 0;
        return {
            customers: customerList,
            total,
        };
    }
    /**
     * Get customer by ID with optional contacts
     */
    async getCustomerById(customerId, includeContacts = false) {
        const db = this.fastify.db;
        const customer = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.organizationId, this.organizationId), isNull(customers.deletedAt)))
            .limit(1);
        if (!customer[0]) {
            return null;
        }
        const result = customer[0];
        if (includeContacts) {
            const contacts = await this.getCustomerContacts(customerId);
            result.contacts = contacts;
        }
        return result;
    }
    /**
     * Create new customer
     */
    async createCustomer(data) {
        const db = this.fastify.db;
        const customerNumber = await this.generateCustomerNumber();
        const customerId = `customer-${nanoid()}`;
        const newCustomer = {
            id: customerId,
            organizationId: this.organizationId,
            customerNumber,
            status: 'active',
            ...data,
        };
        const result = await db
            .insert(customers)
            .values(newCustomer)
            .returning();
        return result[0];
    }
    /**
     * Update existing customer
     */
    async updateCustomer(customerId, data) {
        const db = this.fastify.db;
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        const result = await db
            .update(customers)
            .set(updateData)
            .where(and(eq(customers.id, customerId), eq(customers.organizationId, this.organizationId), isNull(customers.deletedAt)))
            .returning();
        return result[0] || null;
    }
    /**
     * Soft delete customer
     */
    async deleteCustomer(customerId) {
        const db = this.fastify.db;
        const result = await db
            .update(customers)
            .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
        })
            .where(and(eq(customers.id, customerId), eq(customers.organizationId, this.organizationId), isNull(customers.deletedAt)))
            .returning();
        return result.length > 0;
    }
    /**
     * Get customer contacts
     */
    async getCustomerContacts(customerId) {
        const db = this.fastify.db;
        const contacts = await db
            .select()
            .from(customerContacts)
            .where(and(eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), isNull(customerContacts.deletedAt)))
            .orderBy(desc(customerContacts.isPrimary), asc(customerContacts.firstName));
        return contacts;
    }
    /**
     * Get contact by ID
     */
    async getContactById(customerId, contactId) {
        const db = this.fastify.db;
        const contact = await db
            .select()
            .from(customerContacts)
            .where(and(eq(customerContacts.id, contactId), eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), isNull(customerContacts.deletedAt)))
            .limit(1);
        return contact[0] || null;
    }
    /**
     * Create new contact
     */
    async createContact(customerId, data) {
        const db = this.fastify.db;
        // Verify customer exists
        const customer = await this.getCustomerById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        // If this is a primary contact, unset other primary contacts
        if (data.isPrimary) {
            await db
                .update(customerContacts)
                .set({ isPrimary: false, updatedAt: new Date() })
                .where(and(eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), eq(customerContacts.isPrimary, true), isNull(customerContacts.deletedAt)));
        }
        const contactId = `contact-${nanoid()}`;
        const newContact = {
            id: contactId,
            customerId,
            organizationId: this.organizationId,
            ...data,
        };
        const result = await db
            .insert(customerContacts)
            .values(newContact)
            .returning();
        return result[0];
    }
    /**
     * Update existing contact
     */
    async updateContact(customerId, contactId, data) {
        const db = this.fastify.db;
        // If setting as primary, unset other primary contacts
        if (data.isPrimary) {
            await db
                .update(customerContacts)
                .set({ isPrimary: false, updatedAt: new Date() })
                .where(and(eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), eq(customerContacts.isPrimary, true), isNull(customerContacts.deletedAt)));
        }
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        const result = await db
            .update(customerContacts)
            .set(updateData)
            .where(and(eq(customerContacts.id, contactId), eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), isNull(customerContacts.deletedAt)))
            .returning();
        return result[0] || null;
    }
    /**
     * Soft delete contact
     */
    async deleteContact(customerId, contactId) {
        const db = this.fastify.db;
        const result = await db
            .update(customerContacts)
            .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
        })
            .where(and(eq(customerContacts.id, contactId), eq(customerContacts.customerId, customerId), eq(customerContacts.organizationId, this.organizationId), isNull(customerContacts.deletedAt)))
            .returning();
        return result.length > 0;
    }
    /**
     * Check if customer exists and user has access
     */
    async hasCustomerAccess(customerId) {
        const customer = await this.getCustomerById(customerId);
        return customer !== null;
    }
}
//# sourceMappingURL=service.js.map