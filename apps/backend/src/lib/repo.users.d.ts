/**
 * User DTOs and Repository
 * Drizzle-based user data access with proper DTOs
 */
export interface UserDTO {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    organizationId: string;
    roles: string[];
}
export interface UserWithRolesDTO {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    organizationId: string;
    roles: Array<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        isActive: boolean;
    }>;
}
export interface UserListFilters {
    q?: string;
    isActive?: boolean;
    roleId?: string;
    userType?: string;
    createdFrom?: Date;
    createdTo?: Date;
}
export interface UserListOptions {
    page: number;
    pageSize: number;
    filters?: UserListFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeRoles?: boolean;
}
export interface UserListResult {
    users: UserDTO[] | UserWithRolesDTO[];
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
 * User repository with Drizzle
 */
export declare class UserRepository {
    private organizationId;
    private db;
    constructor(organizationId: string);
    /**
     * List users with pagination and filtering
     */
    listUsers(options: UserListOptions): Promise<UserListResult>;
    /**
     * Get user by ID
     */
    getUserById(id: string, includeRoles?: boolean): Promise<UserDTO | UserWithRolesDTO | null>;
    /**
     * Get user by email
     */
    getUserByEmail(email: string): Promise<UserDTO | null>;
    /**
     * Get sort column
     */
    private getSortColumn;
}
//# sourceMappingURL=repo.users.d.ts.map