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
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// API client configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create API client instance
const createApiClient = (accessToken?: string) => {
  return new PivotalFlowClient({
    baseURL: API_BASE_URL,
    getAccessToken: () => accessToken || null,
    refreshToken: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) return null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          },
          credentials: 'include', // For secure cookie refresh
        });
        
        if (response.ok) {
          const data = await response.json();
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
          return data.accessToken;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        useAuthStore.getState().logout();
      }
      
      return null;
    }
  });
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // For secure cookies
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          // Set tokens and user
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
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
        const { accessToken } = get();
        
        try {
          // Call logout endpoint if we have a token
          if (accessToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include',
            });
          }
        } catch (error) {
          console.error('Logout request failed:', error);
        } finally {
          // Clear state regardless of API call success
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // Set user data
      setUser: (user: User) => {
        set({ user });
      },

      // Set tokens
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check authentication status
      checkAuthStatus: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            credentials: 'include',
          });

          if (response.ok) {
            const user = await response.json();
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (response.status === 401) {
            // Token expired, try to refresh
            try {
              await get().refreshAccessToken();
            } catch {
              // Refresh failed, logout
              get().logout();
            }
          } else {
            throw new Error('Failed to verify authentication');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'pivotal-flow-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Export API client factory
export const createAuthApiClient = () => {
  const { accessToken } = useAuthStore.getState();
  return createApiClient(accessToken || undefined);
};

// Export auth hook for easy access
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    // Convenience getters
    isLoggedIn: store.isAuthenticated && !!store.user,
    hasPermission: (permission: string) => {
      return store.user?.permissions?.includes(permission) ?? false;
    },
    // API client with current token
    apiClient: createApiClient(store.accessToken || undefined),
  };
};
