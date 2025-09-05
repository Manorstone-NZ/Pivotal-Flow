/**
 * Customer DTOs and Repository
 * Drizzle-based customer data access with proper DTOs
 */

import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDatabase } from '../lib/db.js';
import { customers } from '../lib/schema.js';

// Customer DTO - exposes only required fields
export interface CustomerDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  organizationId: string;
}

// Customer list filters
export interface CustomerListFilters {
  q?: string;
  isActive?: boolean;
  customerType?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

// Customer list options
export interface CustomerListOptions {
  page: number;
  pageSize: number;
  filters?: CustomerListFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Customer list result
export interface CustomerListResult {
  customers: CustomerDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Customer repository with Drizzle
 */
export class CustomerRepository {
  private db = getDatabase();

  constructor(private organizationId: string) {}

  /**
   * List customers with pagination and filtering
   */
  async listCustomers(options: CustomerListOptions): Promise<CustomerListResult> {
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
      conditions.push(sql`${customers.createdAt} >= ${filters.createdFrom}`);
    }

    if (filters.createdTo) {
      conditions.push(sql`${customers.createdAt} <= ${filters.createdTo}`);
    }

    // Search filter
    if (filters.q) {
      conditions.push(
        sql`(${customers.companyName} ILIKE ${`%${filters.q}%`} OR ${customers.email} ILIKE ${`%${filters.q}%`})`
      );
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
          isActive: sql`${customers.status} = 'active'`,
          organizationId: customers.organizationId,
        })
        .from(customers)
        .where(and(...conditions))
        .orderBy(sortDirection(sortColumn))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(...conditions))
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      customers: customerData,
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
  async getCustomerById(id: string): Promise<CustomerDTO | null> {
    const result = await this.db
      .select({
        id: customers.id,
        email: customers.email,
        displayName: customers.companyName,
        isActive: sql`${customers.status} = 'active'`,
        organizationId: customers.organizationId,
      })
      .from(customers)
      .where(and(
        eq(customers.id, id),
        eq(customers.organizationId, this.organizationId),
        isNull(customers.deletedAt)
      ))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<CustomerDTO | null> {
    const result = await this.db
      .select({
        id: customers.id,
        email: customers.email,
        displayName: customers.companyName,
        isActive: sql`${customers.status} = 'active'`,
        organizationId: customers.organizationId,
      })
      .from(customers)
      .where(and(
        eq(customers.email, email),
        eq(customers.organizationId, this.organizationId),
        isNull(customers.deletedAt)
      ))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get sort column
   */
  private getSortColumn(sortBy: string) {
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
