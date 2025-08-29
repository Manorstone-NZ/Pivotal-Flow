// ============================================================================
// AUTHENTICATION TYPES AND SCHEMAS
// ============================================================================
// This file contains the types and schemas used by the inline authentication routes
// in the main index.ts file. The actual route handlers are implemented inline.

export interface JWTPayload {
  sub: string; // User ID
  org: string; // Organization ID
  roles: string[];
  iat?: number; // Issued at (optional for signing)
  exp?: number; // Expiration (optional for signing)
  jti?: string; // JWT ID (for refresh tokens)
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  roles: string[];
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
// in the main index.ts file to avoid schema conversion issues with Swagger.
// This file serves as a reference for the types and interfaces used.
