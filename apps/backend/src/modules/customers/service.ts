/**
 * Customer Service Layer
 * Business logic and database operations for customers and contacts
 */

import { eq, and, or, like, desc, asc, isNull, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';

import { customers, customerContacts, type Customer, type NewCustomer, type CustomerContact, type NewCustomerContact } from '../../lib/schema.js';
import type { CustomerFilters, PaginationOptions, CustomerWithContacts } from './types.js';

/**
 * Customer Service Class
 * Handles all customer and contact operations
 */
export class CustomerService {
  constructor(
    private fastify: FastifyInstance,
    private organizationId: string,
    private _userId: string // Prefix with underscore to indicate intentionally unused
  ) {}

  /**
   * Generate unique customer number
   */
  private async generateCustomerNumber(): Promise<string> {
    const prefix = 'CUST';
    const timestamp = Date.now().toString().slice(-6);
    const random = generateId().slice(-4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * List customers with filtering and pagination
   */
  async listCustomers(
    filters: CustomerFilters,
    pagination: PaginationOptions
  ): Promise<{ customers: Customer[]; total: number }> {
    const db = getDatabase();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    console.log('🔍 CustomerService.listCustomers - Filtering by organizationId:', this.organizationId);
    const whereConditions = [
      eq(customers.organizationId, this.organizationId),
      isNull(customers.deletedAt),
    ];

    if (filters.search) {
      whereConditions.push(
        or(
          like(customers.companyName, `%${filters.search}%`),
          like(customers.legalName, `%${filters.search}%`),
          like(customers.email, `%${filters.search}%`),
        )!
      );
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
      whereConditions.push(sql`${customers.tags} && ${filters.tags}`);
    }

    // Build order by
    const orderBy = [];
    if (filters.sortBy === 'companyName') {
      orderBy.push(filters.sortOrder === 'asc' ? asc(customers.companyName) : desc(customers.companyName));
    } else if (filters.sortBy === 'createdAt') {
      orderBy.push(filters.sortOrder === 'asc' ? asc(customers.createdAt) : desc(customers.createdAt));
    } else if (filters.sortBy === 'status') {
      orderBy.push(filters.sortOrder === 'asc' ? asc(customers.status) : desc(customers.status));
    } else {
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
      .select({ count: sql<number>`count(*)` })
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
  async getCustomerById(
    customerId: string,
    includeContacts: boolean = false
  ): Promise<CustomerWithContacts | null> {
    const db = getDatabase();

    const customer = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.id, customerId),
          eq(customers.organizationId, this.organizationId),
          isNull(customers.deletedAt)
        )
      )
      .limit(1);

    if (!customer[0]) {
      return null;
    }

    const result: CustomerWithContacts = customer[0]!;

    if (includeContacts) {
      const contacts = await this.getCustomerContacts(customerId);
      result.contacts = contacts;
    }

    return result;
  }

  /**
   * Create new customer
   */
  async createCustomer(data: Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber'>): Promise<Customer> {
    const db = getDatabase();

    const customerNumber = await this.generateCustomerNumber();
    const customerId = `customer-${generateId()}`;

    const newCustomer: NewCustomer = {
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

    return result[0]!;
  }

  /**
   * Update existing customer
   */
  async updateCustomer(
    customerId: string,
    data: Partial<Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber'>>
  ): Promise<Customer | null> {
    const db = getDatabase();

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(customers)
      .set(updateData)
      .where(
        and(
          eq(customers.id, customerId),
          eq(customers.organizationId, this.organizationId),
          isNull(customers.deletedAt)
        )
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Soft delete customer
   */
  async deleteCustomer(customerId: string): Promise<boolean> {
    const db = getDatabase();

    const result = await db
      .update(customers)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(customers.id, customerId),
          eq(customers.organizationId, this.organizationId),
          isNull(customers.deletedAt)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Get customer contacts
   */
  async getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    const db = getDatabase();

    const contacts = await db
      .select()
      .from(customerContacts)
      .where(
        and(
          eq(customerContacts.customerId, customerId),
          eq(customerContacts.organizationId, this.organizationId),
          isNull(customerContacts.deletedAt)
        )
      )
      .orderBy(desc(customerContacts.isPrimary), asc(customerContacts.firstName));

    return contacts;
  }

  /**
   * Get contact by ID
   */
  async getContactById(customerId: string, contactId: string): Promise<CustomerContact | null> {
    const db = getDatabase();

    const contact = await db
      .select()
      .from(customerContacts)
      .where(
        and(
          eq(customerContacts.id, contactId),
          eq(customerContacts.customerId, customerId),
          eq(customerContacts.organizationId, this.organizationId),
          isNull(customerContacts.deletedAt)
        )
      )
      .limit(1);

    return contact[0] || null;
  }

  /**
   * Create new contact
   */
  async createContact(
    customerId: string,
    data: Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId'>
  ): Promise<CustomerContact> {
    const db = getDatabase();

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
        .where(
          and(
            eq(customerContacts.customerId, customerId),
            eq(customerContacts.organizationId, this.organizationId),
            eq(customerContacts.isPrimary, true),
            isNull(customerContacts.deletedAt)
          )
        );
    }

    const contactId = `contact-${generateId()}`;

    const newContact: NewCustomerContact = {
      id: contactId,
      customerId,
      organizationId: this.organizationId,
      ...data,
    };

    const result = await db
      .insert(customerContacts)
      .values(newContact)
      .returning();

    return result[0]!;
  }

  /**
   * Update existing contact
   */
  async updateContact(
    customerId: string,
    contactId: string,
    data: Partial<Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId'>>
  ): Promise<CustomerContact | null> {
    const db = getDatabase();

    // If setting as primary, unset other primary contacts
    if (data.isPrimary) {
      await db
        .update(customerContacts)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(customerContacts.customerId, customerId),
            eq(customerContacts.organizationId, this.organizationId),
            eq(customerContacts.isPrimary, true),
            isNull(customerContacts.deletedAt)
          )
        );
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .update(customerContacts)
      .set(updateData)
      .where(
        and(
          eq(customerContacts.id, contactId),
          eq(customerContacts.customerId, customerId),
          eq(customerContacts.organizationId, this.organizationId),
          isNull(customerContacts.deletedAt)
        )
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Soft delete contact
   */
  async deleteContact(customerId: string, contactId: string): Promise<boolean> {
    const db = getDatabase();

    const result = await db
      .update(customerContacts)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(customerContacts.id, contactId),
          eq(customerContacts.customerId, customerId),
          eq(customerContacts.organizationId, this.organizationId),
          isNull(customerContacts.deletedAt)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Check if customer exists and user has access
   */
  async hasCustomerAccess(customerId: string): Promise<boolean> {
    const customer = await this.getCustomerById(customerId);
    return customer !== null;
  }
}
