// User management types for the Pivotal Flow platform

export interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}

export interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
}

export interface UserUpdateRequest {
  displayName?: string;
  isActive?: boolean;
}

export interface UserListResponse {
  items: UserPublic[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UserListFilters {
  q?: string; // Partial match on email or displayName
  isActive?: boolean;
  roleId?: string;
}

export interface UserListSort {
  field: 'email' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface RoleAssignmentRequest {
  roleId: string;
}

export interface UserStatusRequest {
  isActive: boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Audit event types
export interface UserAuditEvent {
  action: 'users.create' | 'users.update' | 'users.status_changed' | 'users.role_added' | 'users.role_removed';
  actorUserId: string;
  targetUserId: string;
  organizationId: string;
  metadata: Record<string, any>;
}
