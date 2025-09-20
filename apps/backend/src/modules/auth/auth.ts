// ============================================================================
// AUTHENTICATION TYPES AND SCHEMAS
// ============================================================================
// This file contains the types and schemas used by the inline authentication routes
// in the main index.ts file. The actual route handlers are implemented inline.

// F1: Enhanced JWT structure for multitenant membership
export interface JWTPayload {
  sub: string; // User ID
  org: string; // Organization ID (legacy compatibility)
  tenantId: string; // Current active tenant ID
  memberships: {
    tenantId: string;
    role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  }[]; // All tenant memberships for this user
  roles: string[]; // Legacy roles (will be deprecated)
  permissions?: string[]; // Permissions for current tenant only
  iat?: number; // Issued at (optional for signing)
  exp?: number; // Expiration (optional for signing)
  jti?: string; // JWT ID (for refresh tokens)
}

// F1: Enhanced auth context for multitenant membership
export interface AuthContext {
  userId: string;
  organizationId: string; // Legacy compatibility
  tenantId: string; // Current active tenant
  memberships: {
    tenantId: string;
    role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  }[]; // All tenant memberships
  roles: string[]; // Legacy roles (will be deprecated)
  permissions?: string[]; // Permissions for current tenant only
  jti?: string | undefined;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  organizationId: string;
}

// Note: The actual route handlers and authentication logic will be implemented
// in the main index.ts file. This file serves as a reference for the types and interfaces used.
