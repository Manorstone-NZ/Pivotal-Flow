/**
 * Customer Module Types
 * TypeScript interfaces for customer and contact operations
 */

import type { FastifyRequest } from 'fastify';
import type { Customer, NewCustomer, CustomerContact, NewCustomerContact } from '../../lib/schema.js';

// Authenticated request interface
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string;
    organizationId: string;
    roles: string[];
  };
}

// Customer list request interface
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

// Customer by ID request interface
export interface CustomerByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string;
  };
}

// Create customer request interface
export interface CreateCustomerRequest extends AuthenticatedRequest {
  Body: Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
}

// Update customer request interface
export interface UpdateCustomerRequest extends AuthenticatedRequest {
  Params: {
    id: string;
  };
  Body: Partial<Omit<NewCustomer, 'id' | 'organizationId' | 'customerNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
}

// List contacts request interface
export interface ListContactsRequest extends AuthenticatedRequest {
  Params: {
    id: string; // Customer ID
  };
}

// Contact by ID request interface
export interface ContactByIdRequest extends AuthenticatedRequest {
  Params: {
    id: string; // Customer ID
    contactId: string;
  };
}

// Create contact request interface
export interface CreateContactRequest extends AuthenticatedRequest {
  Params: {
    id: string; // Customer ID
  };
  Body: Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
}

// Update contact request interface
export interface UpdateContactRequest extends AuthenticatedRequest {
  Params: {
    id: string; // Customer ID
    contactId: string;
  };
  Body: Partial<Omit<NewCustomerContact, 'id' | 'customerId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
}

// Customer with contacts interface
export interface CustomerWithContacts extends Customer {
  contacts?: CustomerContact[];
}

// Pagination response interface
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

// Standard response interface
export interface StandardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}

// Customer filters for service layer
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

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
}
