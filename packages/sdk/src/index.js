import axios from 'axios';
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
    config;
    axios;
    constructor(config) {
        this.config = {
            timeout: 30000,
            ...config
        };
        this.axios = config.axiosInstance || axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout ?? 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        // Add request interceptor for authentication
        this.axios.interceptors.request.use(async (config) => {
            if (this.config.getAccessToken) {
                const token = this.config.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        }, (error) => Promise.reject(error));
        // Add response interceptor for token refresh
        this.axios.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401 && this.config.refreshToken) {
                try {
                    const newToken = await this.config.refreshToken();
                    if (newToken && error.config) {
                        error.config.headers.Authorization = `Bearer ${newToken}`;
                        return this.axios.request(error.config);
                    }
                }
                catch (refreshError) {
                    // Token refresh failed, continue with original error
                }
            }
            return Promise.reject(error);
        });
    }
    /**
     * Make a request to the API with proper error handling
     */
    async request(config) {
        try {
            const response = await this.axios.request(config);
            return response.data;
        }
        catch (error) {
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
        login: async (data) => {
            return this.request({
                method: 'POST',
                url: '/auth/login',
                data
            });
        },
        /**
         * Refresh access token
         */
        refresh: async (data) => {
            return this.request({
                method: 'POST',
                url: '/auth/refresh',
                data
            });
        },
        /**
         * Logout user
         */
        logout: async (data) => {
            return this.request({
                method: 'POST',
                url: '/auth/logout',
                data
            });
        },
        /**
         * Get current user profile
         */
        me: async () => {
            return this.request({
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
        list: async (params) => {
            return this.request({
                method: 'GET',
                url: '/users',
                params
            });
        },
        /**
         * Get user by ID
         */
        get: async (id) => {
            return this.request({
                method: 'GET',
                url: `/users/${id}`
            });
        },
        /**
         * Create new user
         */
        create: async (data) => {
            return this.request({
                method: 'POST',
                url: '/users',
                data
            });
        },
        /**
         * Update user
         */
        update: async (id, data) => {
            return this.request({
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
        list: async (params) => {
            return this.request({
                method: 'GET',
                url: '/quotes',
                params
            });
        },
        /**
         * Get quote by ID
         */
        get: async (id) => {
            return this.request({
                method: 'GET',
                url: `/quotes/${id}`
            });
        },
        /**
         * Create new quote
         */
        create: async (data) => {
            return this.request({
                method: 'POST',
                url: '/quotes',
                data
            });
        },
        /**
         * Update quote
         */
        update: async (id, data) => {
            return this.request({
                method: 'PATCH',
                url: `/quotes/${id}`,
                data
            });
        },
        /**
         * Transition quote status
         */
        transitionStatus: async (id, data) => {
            return this.request({
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
        list: async (params) => {
            return this.request({
                method: 'GET',
                url: '/permissions',
                params
            });
        },
        /**
         * Get permission by ID
         */
        get: async (id) => {
            return this.request({
                method: 'GET',
                url: `/permissions/${id}`
            });
        },
        /**
         * Create new permission
         */
        create: async (data) => {
            return this.request({
                method: 'POST',
                url: '/permissions',
                data
            });
        },
        /**
         * Update permission
         */
        update: async (id, data) => {
            return this.request({
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
        list: async (params) => {
            return this.request({
                method: 'GET',
                url: '/roles',
                params
            });
        },
        /**
         * Get role by ID
         */
        get: async (id) => {
            return this.request({
                method: 'GET',
                url: `/roles/${id}`
            });
        },
        /**
         * Create new role
         */
        create: async (data) => {
            return this.request({
                method: 'POST',
                url: '/roles',
                data
            });
        },
        /**
         * Update role
         */
        update: async (id, data) => {
            return this.request({
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
        create: async (data) => {
            return this.request({
                method: 'POST',
                url: '/reports/export',
                data
            });
        },
        /**
         * Get export job status
         */
        get: async (id) => {
            return this.request({
                method: 'GET',
                url: `/reports/export/${id}`
            });
        },
        /**
         * Download export file
         */
        download: async (id) => {
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
            list: async (params) => {
                return this.request({
                    method: 'GET',
                    url: '/portal/quotes',
                    params
                });
            },
            get: async (id) => {
                return this.request({
                    method: 'GET',
                    url: `/portal/quotes/${id}`
                });
            }
        },
        /**
         * List customer invoices
         */
        invoices: {
            list: async (params) => {
                return this.request({
                    method: 'GET',
                    url: '/portal/invoices',
                    params
                });
            },
            get: async (id) => {
                return this.request({
                    method: 'GET',
                    url: `/portal/invoices/${id}`
                });
            }
        },
        /**
         * List customer time entries
         */
        timeEntries: {
            list: async (params) => {
                return this.request({
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
        health: async () => {
            return this.request({
                method: 'GET',
                url: '/health'
            });
        },
        /**
         * Get metrics
         */
        metrics: async () => {
            return this.request({
                method: 'GET',
                url: '/metrics'
            });
        }
    };
}
// Export types for use in consuming applications
export * from './types.js';
// Export generated types and client
export * from './gen/types.js';
export { GeneratedPivotalFlowClient } from './gen/client.js';
//# sourceMappingURL=index.js.map