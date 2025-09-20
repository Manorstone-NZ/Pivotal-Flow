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
      isLoading: false, // Start with loading false to allow login
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        console.log('🔑 Starting login process...', email);
        set({ isLoading: true, error: null });
        
        try {
          console.log('🌐 Making login request to:', `${API_BASE_URL}/auth/login`);
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // For secure cookies
            body: JSON.stringify({ email, password }),
          });

          console.log('📡 Login response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Login failed:', errorData);
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          console.log('✅ Login successful, data received:', { 
            hasAccessToken: !!data.accessToken, 
            hasUser: !!data.user,
            userEmail: data.user?.email,
            userRoles: data.user?.roles 
          });
          
          // Set tokens and user
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('🎉 Auth state updated successfully');

          // Manually save to localStorage to ensure it's persisted immediately
          localStorage.setItem('pivotal-flow-auth', JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
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
        console.log('🚪 LOGOUT CALLED - tracing where this came from');
        console.trace('Logout stack trace');
        const { accessToken } = get();
        
        try {
          // Call logout endpoint if we have a token
          if (accessToken) {
            console.log('🌐 Calling logout endpoint...');
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
          console.log('🧹 Clearing auth state and localStorage...');
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
        console.log('🔍 CHECK AUTH STATUS called');
        const { accessToken } = get();
        console.log('🔍 Current accessToken exists:', !!accessToken);
        
        if (!accessToken) {
          console.log('🔍 No access token, setting unauthenticated');
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        console.log('🔍 Checking auth with backend...');
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            credentials: 'include',
          });

          console.log('🔍 Auth check response status:', response.status);

          if (response.ok) {
            const user = await response.json();
            console.log('✅ Auth check successful, user:', user?.email);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (response.status === 401) {
            console.log('🔄 Token expired, attempting refresh...');
            // Token expired, try to refresh
            try {
              await get().refreshAccessToken();
              console.log('✅ Token refresh successful');
            } catch {
              console.log('❌ Token refresh failed, logging out');
              // Refresh failed, logout
              get().logout();
            }
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
      // Check specific permissions first
      if (store.user?.permissions?.includes(permission)) {
        return true;
      }
      
      // Super admin permissions for users with 'super_admin' role
      if (store.user?.roles?.includes('super_admin')) {
        return true;
      }
      
      // Tenant admin permissions for users with 'tenant_admin' role
      if (store.user?.roles?.includes('tenant_admin')) {
        // Tenant admins get all tenant-level permissions but not system-level
        const tenantPermissions = [
          'tenant.admin',
          'users.manage', 
          'customers.manage',
          'projects.manage',
          'quotes.manage'
        ];
        return tenantPermissions.includes(permission);
      }
      
      // Legacy support: users with 'admin' role get super admin permissions
      if (store.user?.roles?.includes('admin')) {
        return true;
      }
      
      return false;
    },
    // API client with current token
    apiClient: createApiClient(store.accessToken || undefined),
  };
};
