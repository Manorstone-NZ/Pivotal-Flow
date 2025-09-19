/**
 * Customer Service Layer
 * Business logic and database operations for customers and contacts
 */
import type { FastifyInstance } from 'fastify';
import { type Customer, type NewCustomer, type CustomerContact, type NewCustomerContact } from '../../lib/schema.js';
import type { CustomerFilters, PaginationOptions, CustomerWithContacts } from './types.js';
/**
 * Customer Service Class
 * Handles all customer and contact operations
 */
export declare class CustomerService {
    private fastify;
    private organizationId;
    private userId;
    constructor(fastify: FastifyInstance, organizationId: string, userId: string);
    /**
     * Generate unique customer number
     */
    private generateCustomerNumber;
    /**
     * List customers with filtering and pagination
     */
    listCustomers(filters: CustomerFilters, pagination: PaginationOptions): Promise<{
        customers: Customer[];
        total: number;
    }>;
    /**
     * Get customer by ID with optional contacts
     */
    getCustomerById(customerId: string, includeContacts?: boolean): Promise<CustomerWithContacts | null>;
    /**
     * Create new customer
     */
    createCustomer(data: Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber'>): Promise<Customer>;
    /**
     * Update existing customer
     */
    updateCustomer(customerId: string, data: Partial<Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber'>>): Promise<Customer | null>;
    /**
     * Soft delete customer
     */
    deleteCustomer(customerId: string): Promise<boolean>;
    /**
     * Get customer contacts
     */
    getCustomerContacts(customerId: string): Promise<CustomerContact[]>;
    /**
     * Get contact by ID
     */
    getContactById(customerId: string, contactId: string): Promise<CustomerContact | null>;
    /**
     * Create new contact
     */
    createContact(customerId: string, data: Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId'>): Promise<CustomerContact>;
    /**
     * Update existing contact
     */
    updateContact(customerId: string, contactId: string, data: Partial<Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId'>>): Promise<CustomerContact | null>;
    /**
     * Soft delete contact
     */
    deleteContact(customerId: string, contactId: string): Promise<boolean>;
    /**
     * Check if customer exists and user has access
     */
    hasCustomerAccess(customerId: string): Promise<boolean>;
}
//# sourceMappingURL=service.d.ts.map