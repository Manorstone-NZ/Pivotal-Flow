// Export all authentication modules
export { default as authPlugin } from './plugin.auth.js';

// Export route handlers
export { loginRoute } from './routes.login.js';
export { refreshRoute } from './routes.refresh.js';
export { logoutRoute } from './routes.logout.js';
export { meRoute } from './routes.me.js';

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

