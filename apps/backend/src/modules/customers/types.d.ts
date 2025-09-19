/**
 * Customer Module Types
 * TypeScript interfaces for customer and contact operations
 */
import type { FastifyRequest } from 'fastify';
import type { Customer, NewCustomer, CustomerContact, NewCustomerContact } from '../../lib/schema.js';
export interface AuthenticatedRequest extends FastifyRequest {
    user: {
        userId: string;
        organizationId: string;
        roles: string[];
    };
}
export interface ListCustomersRequest extends AuthenticatedRequest {
    Querystring: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'active' | 'inactive' | 'prospect';
        customerType?: 'business' | 'individual';
        industry?: string;
        source?: string;
        tags?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    };
}
export interface CustomerByIdRequest extends AuthenticatedRequest {
    Params: {
        id: string;
    };
}
export interface CreateCustomerRequest extends AuthenticatedRequest {
    Body: Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
}
export interface UpdateCustomerRequest extends AuthenticatedRequest {
    Params: {
        id: string;
    };
    Body: Partial<Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
}
export interface ListContactsRequest extends AuthenticatedRequest {
    Params: {
        id: string;
    };
}
export interface ContactByIdRequest extends AuthenticatedRequest {
    Params: {
        id: string;
        contactId: string;
    };
}
export interface CreateContactRequest extends AuthenticatedRequest {
    Params: {
        id: string;
    };
    Body: Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
}
export interface UpdateContactRequest extends AuthenticatedRequest {
    Params: {
        id: string;
        contactId: string;
    };
    Body: Partial<Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
}
export interface CustomerWithContacts extends Customer {
    contacts?: CustomerContact[];
}
export interface PaginationResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface StandardResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    code?: string;
    details?: any;
}
export interface CustomerFilters {
    search?: string;
    status?: string;
    customerType?: string;
    industry?: string;
    source?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationOptions {
    page: number;
    limit: number;
}
//# sourceMappingURL=types.d.ts.map