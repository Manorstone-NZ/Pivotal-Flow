import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as Types from './types.js';

/**
 * Configuration for the Pivotal Flow SDK client
 */
export interface PivotalFlowConfig {
  /** Base URL for the API (e.g., 'https://api.pivotalflow.com/api/v1') */
  baseURL: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Function to get the current access token */
  getAccessToken?: () => string | null;
  /** Function to refresh the access token */
  refreshToken?: () => Promise<string | null>;
  /** Custom axios instance */
  axiosInstance?: AxiosInstance;
}

/**
 * Pivotal Flow API client with full TypeScript support
 * 
 * @example
 * ```typescript
 * const client = new PivotalFlowClient({
 *   baseURL: 'https://api.pivotalflow.com/api/v1',
 *   getAccessToken: () => localStorage.getItem('accessToken'),
 *   refreshToken: async () => {
 *     // Implement token refresh logic
 *     return 'new-token';
 *   }
 * });
 * 
 * // Login
 * const loginResponse = await client.auth.login({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * 
 * // Get quotes
 * const quotes = await client.quotes.list({
 *   page: 1,
 *   pageSize: 10,
 *   status: 'approved'
 * });
 * ```
 */
export class PivotalFlowClient {
  private config: PivotalFlowConfig;
  private axios: AxiosInstance;

  constructor(config: PivotalFlowConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };

    this.axios = config.axiosInstance || axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.axios.interceptors.request.use(
      async (config) => {
        if (this.config.getAccessToken) {
          const token = this.config.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.config.refreshToken) {
          try {
            const newToken = await this.config.refreshToken();
            if (newToken && error.config) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.axios.request(error.config);
            }
          } catch (refreshError) {
            // Token refresh failed, continue with original error
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a request to the API with proper error handling
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.request(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || error.message);
      }
      throw error;
    }
  }

  /**
   * Authentication endpoints
   */
  auth = {
    /**
     * Login with email and password
     */
    login: async (data: Types.LoginRequest): Promise<Types.LoginResponse> => {
      return this.request<Types.LoginResponse>({
        method: 'POST',
        url: '/auth/login',
        data
      });
    },

    /**
     * Refresh access token
     */
    refresh: async (data: Types.RefreshTokenRequest): Promise<Types.RefreshTokenResponse> => {
      return this.request<Types.RefreshTokenResponse>({
        method: 'POST',
        url: '/auth/refresh',
        data
      });
    },

    /**
     * Logout user
     */
    logout: async (data: Types.LogoutRequest): Promise<Types.LogoutResponse> => {
      return this.request<Types.LogoutResponse>({
        method: 'POST',
        url: '/auth/logout',
        data
      });
    },

    /**
     * Get current user profile
     */
    me: async (): Promise<Types.MeResponse> => {
      return this.request<Types.MeResponse>({
        method: 'GET',
        url: '/auth/me'
      });
    }
  };

  /**
   * User management endpoints
   */
  users = {
    /**
     * List users with pagination and filtering
     */
    list: async (params?: Types.UserFilters): Promise<Types.PaginationEnvelope<Types.User>> => {
      return this.request<Types.PaginationEnvelope<Types.User>>({
        method: 'GET',
        url: '/users',
        params
      });
    },

    /**
     * Get user by ID
     */
    get: async (id: string): Promise<Types.User> => {
      return this.request<Types.User>({
        method: 'GET',
        url: `/users/${id}`
      });
    },

    /**
     * Create new user
     */
    create: async (data: Types.CreateUserRequest): Promise<Types.User> => {
      return this.request<Types.User>({
        method: 'POST',
        url: '/users',
        data
      });
    },

    /**
     * Update user
     */
    update: async (id: string, data: Types.UpdateUserRequest): Promise<Types.User> => {
      return this.request<Types.User>({
        method: 'PATCH',
        url: `/users/${id}`,
        data
      });
    }
  };

  /**
   * Quote management endpoints
   */
  quotes = {
    /**
     * List quotes with pagination and filtering
     */
    list: async (params?: Types.QuoteFilters): Promise<Types.PaginationEnvelope<Types.Quote>> => {
      return this.request<Types.PaginationEnvelope<Types.Quote>>({
        method: 'GET',
        url: '/quotes',
        params
      });
    },

    /**
     * Get quote by ID
     */
    get: async (id: string): Promise<Types.Quote> => {
      return this.request<Types.Quote>({
        method: 'GET',
        url: `/quotes/${id}`
      });
    },

    /**
     * Create new quote
     */
    create: async (data: Types.CreateQuoteRequest): Promise<Types.Quote> => {
      return this.request<Types.Quote>({
        method: 'POST',
        url: '/quotes',
        data
      });
    },

    /**
     * Update quote
     */
    update: async (id: string, data: Types.UpdateQuoteRequest): Promise<Types.Quote> => {
      return this.request<Types.Quote>({
        method: 'PATCH',
        url: `/quotes/${id}`,
        data
      });
    },

    /**
     * Transition quote status
     */
    transitionStatus: async (id: string, data: Types.QuoteStatusTransitionRequest): Promise<Types.Quote> => {
      return this.request<Types.Quote>({
        method: 'POST',
        url: `/quotes/${id}/status`,
        data
      });
    }
  };

  /**
   * Permission management endpoints
   */
  permissions = {
    /**
     * List permissions
     */
    list: async (params?: Types.CommonFilters): Promise<Types.PaginationEnvelope<Types.Permission>> => {
      return this.request<Types.PaginationEnvelope<Types.Permission>>({
        method: 'GET',
        url: '/permissions',
        params
      });
    },

    /**
     * Get permission by ID
     */
    get: async (id: string): Promise<Types.Permission> => {
      return this.request<Types.Permission>({
        method: 'GET',
        url: `/permissions/${id}`
      });
    },

    /**
     * Create new permission
     */
    create: async (data: Types.CreatePermissionRequest): Promise<Types.Permission> => {
      return this.request<Types.Permission>({
        method: 'POST',
        url: '/permissions',
        data
      });
    },

    /**
     * Update permission
     */
    update: async (id: string, data: Types.UpdatePermissionRequest): Promise<Types.Permission> => {
      return this.request<Types.Permission>({
        method: 'PUT',
        url: `/permissions/${id}`,
        data
      });
    }
  };

  /**
   * Role management endpoints
   */
  roles = {
    /**
     * List roles
     */
    list: async (params?: Types.CommonFilters): Promise<Types.PaginationEnvelope<Types.Role>> => {
      return this.request<Types.PaginationEnvelope<Types.Role>>({
        method: 'GET',
        url: '/roles',
        params
      });
    },

    /**
     * Get role by ID
     */
    get: async (id: string): Promise<Types.Role> => {
      return this.request<Types.Role>({
        method: 'GET',
        url: `/roles/${id}`
      });
    },

    /**
     * Create new role
     */
    create: async (data: Types.CreateRoleRequest): Promise<Types.Role> => {
      return this.request<Types.Role>({
        method: 'POST',
        url: '/roles',
        data
      });
    },

    /**
     * Update role
     */
    update: async (id: string, data: Types.UpdateRoleRequest): Promise<Types.Role> => {
      return this.request<Types.Role>({
        method: 'PUT',
        url: `/roles/${id}`,
        data
      });
    }
  };

  /**
   * Export job endpoints
   */
  exports = {
    /**
     * Create export job
     */
    create: async (data: Types.CreateExportJobRequest): Promise<Types.ExportJob> => {
      return this.request<Types.ExportJob>({
        method: 'POST',
        url: '/reports/export',
        data
      });
    },

    /**
     * Get export job status
     */
    get: async (id: string): Promise<Types.ExportJob> => {
      return this.request<Types.ExportJob>({
        method: 'GET',
        url: `/reports/export/${id}`
      });
    },

    /**
     * Download export file
     */
    download: async (id: string): Promise<Blob> => {
      const response = await this.axios.request({
        method: 'GET',
        url: `/reports/export/${id}/download`,
        responseType: 'blob'
      });
      return response.data;
    }
  };

  /**
   * Portal endpoints (customer-facing)
   */
  portal = {
    /**
     * List customer quotes
     */
    quotes: {
      list: async (params?: Types.PortalQuoteFilters): Promise<Types.PaginationEnvelope<Types.PortalQuote>> => {
        return this.request<Types.PaginationEnvelope<Types.PortalQuote>>({
          method: 'GET',
          url: '/portal/quotes',
          params
        });
      },

      get: async (id: string): Promise<Types.PortalQuote> => {
        return this.request<Types.PortalQuote>({
          method: 'GET',
          url: `/portal/quotes/${id}`
        });
      }
    },

    /**
     * List customer invoices
     */
    invoices: {
      list: async (params?: Types.PortalInvoiceFilters): Promise<Types.PaginationEnvelope<Types.PortalInvoice>> => {
        return this.request<Types.PaginationEnvelope<Types.PortalInvoice>>({
          method: 'GET',
          url: '/portal/invoices',
          params
        });
      },

      get: async (id: string): Promise<Types.PortalInvoice> => {
        return this.request<Types.PortalInvoice>({
          method: 'GET',
          url: `/portal/invoices/${id}`
        });
      }
    },

    /**
     * List customer time entries
     */
    timeEntries: {
      list: async (params: Types.PortalTimeEntryFilters): Promise<Types.PaginationEnvelope<Types.PortalTimeEntry>> => {
        return this.request<Types.PaginationEnvelope<Types.PortalTimeEntry>>({
          method: 'GET',
          url: '/portal/time',
          params
        });
      }
    }
  };

  /**
   * System endpoints
   */
  system = {
    /**
     * Health check
     */
    health: async (): Promise<Types.HealthResponse> => {
      return this.request<Types.HealthResponse>({
        method: 'GET',
        url: '/health'
      });
    },

    /**
     * Get metrics
     */
    metrics: async (): Promise<Types.MetricsResponse> => {
      return this.request<Types.MetricsResponse>({
        method: 'GET',
        url: '/metrics'
      });
    }
  };
}

// Export types for use in consuming applications
export * from './types.js';
