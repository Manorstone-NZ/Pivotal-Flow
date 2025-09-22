import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PivotalFlowClient } from '@pivotal-flow/sdk';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  organizationId?: string;
  permissions?: string[];
  roles?: string[];
}

interface AuthState {
  // State
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setSession: (sessionId: string) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// API client configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create API client instance for opaque token authentication
const createApiClient = () => {
  return new PivotalFlowClient({
    baseURL: API_BASE_URL,
    // For opaque tokens, we rely on cookies for authentication
    getAccessToken: () => null, // No token needed, uses cookies
    // No refresh token needed for opaque tokens - they auto-renew
    // Ensure cookies are sent with requests
    credentials: 'include'
  });
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false, // Start with loading false to allow login
      error: null,

      // Login action
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          // Making login request to opaque authentication endpoint
          const response = await fetch(`${API_BASE_URL}/auth/login-opaque`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Essential for cookie-based auth
            body: JSON.stringify({ email, password, rememberMe }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          // F2B: Session is managed via secure HttpOnly cookies
          // We only store user info and auth status in localStorage
          set({
            sessionId: null, // No longer stored client-side for security
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          // F2B: Always call logout endpoint to revoke server-side session
          await fetch(`${API_BASE_URL}/auth/logout-opaque`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            credentials: 'include', // Uses cookies for authentication
            body: JSON.stringify({}), // Empty body for logout
          });
        } catch (error) {
          // Continue with logout even if server call fails
          // Logout request failed, but continue with local cleanup
        } finally {
          // Clear state regardless of API call success
          // F2B: Session cookie is cleared by server, we just clear local state
          set({
            user: null,
            sessionId: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },


      // Set user data
      setUser: (user: User) => {
        set({ user });
      },

      // Set session
      setSession: (sessionId: string) => {
        set({ 
          sessionId, 
          isAuthenticated: true 
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check authentication status
      checkAuthStatus: async () => {
        set({ isLoading: true });

        try {
          // F2B: Check session validity using cookie-based auth
          // Call any protected endpoint to verify session
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include', // Uses cookies for authentication
          });

          if (response.ok) {
            const userData = await response.json();
            // Session is valid, update user data
            set({ 
              user: userData,
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (response.status === 401) {
            // Session invalid or expired
            get().logout();
          } else {
            throw new Error('Failed to verify authentication');
          }
        } catch (error) {
          // Auth check failed, clear authentication
          get().logout();
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'pivotal-flow-auth',
      partialize: (state) => ({
        // F2B: Only persist user data and auth status, not sessionId
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export API client factory
export const createAuthApiClient = () => {
  return createApiClient(); // No token needed for opaque tokens
};

// Export auth hook for easy access
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    // Convenience getters
    isLoggedIn: store.isAuthenticated && !!store.user,
    hasPermission: (permission: string) => {
      // Check specific permissions first
      if (store.user?.permissions?.includes(permission)) {
        return true;
      }
      
      // F1: Strict membership-based permissions - no bypass logic
      // All permissions must be explicitly granted through tenant memberships
      
      return false;
    },
    // API client for opaque token authentication
    apiClient: createApiClient(),
  };
};
