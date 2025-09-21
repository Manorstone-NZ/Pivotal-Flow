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
        console.log('🔑 Starting opaque token login process...', email);
        set({ isLoading: true, error: null });
        
        try {
          console.log('🌐 Making login request to:', `${API_BASE_URL}/auth/login-opaque`);
          const response = await fetch(`${API_BASE_URL}/auth/login-opaque`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // For secure cookies (opaque tokens)
            body: JSON.stringify({ email, password, rememberMe }),
          });

          console.log('📡 Login response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Login failed:', errorData);
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          console.log('✅ Login successful, data received:', { 
            hasSessionId: !!data.sessionId, 
            hasUser: !!data.user,
            userEmail: data.user?.email,
            userRoles: data.user?.roles 
          });
          
          // Set session and user (opaque tokens are handled via cookies)
          set({
            sessionId: data.sessionId,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('🎉 Auth state updated successfully');

          // Manually save to localStorage to ensure it's persisted immediately
          localStorage.setItem('pivotal-flow-auth', JSON.stringify({
            sessionId: data.sessionId,
            user: data.user,
            isAuthenticated: true,
          }));
          console.log('💾 Auth data manually saved to localStorage');

        } catch (error) {
          console.error('💥 Login error:', error);
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
        console.log('🚪 OPAQUE TOKEN LOGOUT CALLED');
        const { sessionId } = get();
        
        try {
          // Call logout endpoint if we have a session
          if (sessionId) {
            console.log('🌐 Calling opaque logout endpoint...');
            await fetch(`${API_BASE_URL}/auth/logout-opaque`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              credentials: 'include', // Uses cookies for authentication
              body: JSON.stringify({}), // Empty body for logout
            });
          }
        } catch (error) {
          console.error('Logout request failed:', error);
        } finally {
          // Clear state regardless of API call success
          console.log('🧹 Clearing auth state and localStorage...');
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
        console.log('🔍 CHECK OPAQUE AUTH STATUS called');
        const { sessionId } = get();
        console.log('🔍 Current sessionId exists:', !!sessionId);
        
        if (!sessionId) {
          console.log('🔍 No session ID, setting unauthenticated');
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        console.log('🔍 Checking auth with backend...');
        set({ isLoading: true });

        try {
          // Check session validity by calling sessions endpoint
          const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
            credentials: 'include', // Uses cookies for authentication
          });

          console.log('🔍 Auth check response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth check successful, sessions found:', data.sessions?.length || 0);
            // If we can get sessions, we're authenticated
            // The user data should already be in state from login
            set({ 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (response.status === 401) {
            console.log('❌ Session invalid, logging out');
            // Session invalid, logout
            get().logout();
          } else {
            throw new Error('Failed to verify authentication');
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          console.log('🚪 Auth check failed, calling logout');
          get().logout();
          set({ isLoading: false }); // Ensure loading is set to false
        }
      },
    }),
    {
      name: 'pivotal-flow-auth',
      partialize: (state) => ({
        sessionId: state.sessionId,
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
