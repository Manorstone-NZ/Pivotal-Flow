/**
 * Customer DTOs and Repository
 * Drizzle-based customer data access with proper DTOs
 */
export interface CustomerDTO {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    organizationId: string;
}
export interface CustomerListFilters {
    q?: string;
    isActive?: boolean;
    customerType?: string;
    createdFrom?: Date;
    createdTo?: Date;
}
export interface CustomerListOptions {
    page: number;
    pageSize: number;
    filters?: CustomerListFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
export declare class CustomerRepository {
    private organizationId;
    private db;
    constructor(organizationId: string);
    /**
     * List customers with pagination and filtering
     */
    listCustomers(options: CustomerListOptions): Promise<CustomerListResult>;
    /**
     * Get customer by ID
     */
    getCustomerById(id: string): Promise<CustomerDTO | null>;
    /**
     * Get customer by email
     */
    getCustomerByEmail(email: string): Promise<CustomerDTO | null>;
    /**
     * Get sort column
     */
    private getSortColumn;
}
//# sourceMappingURL=repo.customers.d.ts.map