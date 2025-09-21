// Export all authentication modules
export { default as authPlugin } from './plugin.auth.js';

// Export route handlers
export { loginRoute } from './routes.login.js';
export { refreshRoute } from './routes.refresh.js';
export { logoutRoute } from './routes.logout.js';
export { meRoute } from './routes.me.js';

// Export new F1.5 auth routes
export { opaqueAuthRoutes } from './routes.opaque-endpoints.js';
export { adminAssumeRoutes } from './routes.admin-assume.js';

// Export types from TypeBox schemas
export type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutResponse,
  MeResponse,
  AuthError,
} from './typeboxSchemas.js';

