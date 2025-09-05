// Export all shared types and utilities
export * from './constants.js';
export * from './validation.js';
export * from './redis.js';

// Export security and tenancy modules
export * from './security/password.js';
// Export JWT types but exclude AuthContext to avoid conflict
export type { 
  JWTPayload, 
  AccessTokenPayload, 
  RefreshTokenPayload, 
  TokenPair, 
  RefreshTokenData,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutResponse,
  MeResponse,
  AuthError
} from './security/jwt-types.js';
export * from './tenancy/guard.js';

// Export user management types
export * from './types/user.js';

// Export auth and audit types
export * from './types/auth.js';
export * from './types/audit.js';

// Export ID and time utilities
export * from './utils/id.js';
export * from './utils/time.js';

// Export audit and permission services
export * from './audit/logger.js';
export type { 
  PermissionName,
  PermissionServiceOptions
} from './security/permissions.js';
export { PermissionService } from './security/permissions.js';

// Export API schemas
export * from './api/schemas.js';

// Export utils but exclude conflicting functions
export { 
  getTimestamp,
  getUptime,
  formatBytes,
  sleep,
  retry,
  sanitizeForLogging,
  deepClone
} from './utils.js';

// Export cache and metrics
export * from './cache/index.js';
export { prometheusMetrics, globalMetrics, recordMetrics, MetricsCollector } from './metrics/index.js';

// Export guards and database utilities
export * from './guards/jsonbMonetaryGuard.js';
export * from './db/filterGuard.js';

// Export Drizzle-based components
export * from './db/repo.base.js';
export * from './schema.js';
export * from './pricing/index.js';
