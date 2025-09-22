/**
 * Centralized API Client with Tenant Context
 * Automatically includes tenant headers and authentication
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiClientConfig {
  baseURL: string;
  tenantId?: string | null;
}

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      // F2B: Ensure cookies are sent with all requests
      withCredentials: true,
    });

    // Tenant ID is now derived from server-issued tokens only
    // No client-side tenant switching for security

    // Add request interceptor for authentication and tenant context
    this.client.interceptors.request.use((config) => {
      // Add authentication token
      const authData = localStorage.getItem('pivotal-flow-auth');
      console.log('🔍 API INTERCEPTOR RUNNING for:', config.method?.toUpperCase(), config.url);
      console.log('🔍 Auth data in localStorage:', authData ? 'EXISTS' : 'MISSING');
      
      // Debug: log all localStorage keys
      console.log('🔍 All localStorage keys:', Object.keys(localStorage));
      
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          console.log('🔍 Parsed auth data:', { 
            hasAccessToken: !!parsed.accessToken, 
            hasUser: !!parsed.user,
            isAuthenticated: !!parsed.isAuthenticated 
          });
          
          if (parsed.accessToken) {
            // F2B: No Authorization header needed - using secure cookies
            // config.headers.Authorization = `Bearer ${parsed.accessToken}`;
            // F2B: Auth via cookies, no token logging needed
          } else {
            // F2B: Auth via cookies, no token required
          }
        } catch (error) {
          // Failed to parse auth data
        }
      } else {
        // F2B: Auth via cookies, no localStorage auth data needed
      }

      // Add tenant context header
      if (this.tenantId) {
        config.headers['X-Tenant-ID'] = this.tenantId;
        // API call with tenant context
      } else {
        // API call without tenant context
      }

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('pivotal-flow-auth');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Tenant switching removed for security - tenant context is set server-side only
  // via admin "Assume Tenant" endpoint that issues new tokens

  // Force refresh auth token from localStorage
  refreshAuthToken() {
    const authData = localStorage.getItem('pivotal-flow-auth');
    if (authData) {
      try {
        const { accessToken } = JSON.parse(authData);
        console.log('🔄 API client auth token refreshed:', !!accessToken);
        return !!accessToken;
      } catch (error) {
        console.error('Failed to refresh auth token:', error);
        return false;
      }
    }
    console.log('⚠️ No auth data found for refresh');
    return false;
  }

  // HTTP methods with tenant context
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

// Create singleton instance
const baseURL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';

// Get initial tenant from localStorage
let initialTenantId: string | null = null;
try {
  const savedTenant = localStorage.getItem('pivotal-flow-tenant');
  if (savedTenant) {
    const tenant = JSON.parse(savedTenant);
    initialTenantId = tenant.id;
  }
} catch (error) {
  console.error('Failed to parse saved tenant for API client:', error);
}

export const apiClient = new ApiClient({
  baseURL: `${baseURL}/api`,
  tenantId: initialTenantId,
});

// Export for use in React components
export default apiClient;
