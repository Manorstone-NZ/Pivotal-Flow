/**
 * Frontend API Client Wrapper for E4 SDK Integration
 * Provides a clean interface to the generated SDK with proper error handling
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000/api/v1';

// Create the enhanced client instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where Zustand persists it)
    const authData = localStorage.getItem('pivotal-flow-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const accessToken = parsed.state?.accessToken;
        if (accessToken) {
          // F2B: No Authorization header needed - using secure cookies
          // config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        // Failed to parse auth data from localStorage
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error normalization interface
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
  status: number;
}

// Normalize backend error envelope
export function normalizeApiError(error: AxiosError): ApiError {
  const response = error.response;
  
  if (response?.data && typeof response.data === 'object' && 'error' in response.data) {
    const errorData = response.data as { 
      error: { 
        code?: string; 
        message?: string; 
        details?: Record<string, unknown>;
        request_id?: string;
        timestamp?: string;
      } 
    };
    return {
      code: errorData.error.code || 'UNKNOWN_ERROR',
      message: errorData.error.message || 'An unknown error occurred',
      details: errorData.error.details || {},
      requestId: errorData.error.request_id || 'unknown',
      timestamp: errorData.error.timestamp || new Date().toISOString(),
      status: response.status,
    };
  }

  // Fallback for non-standard errors
  return {
    code: 'NETWORK_ERROR',
    message: error.message || 'Network error occurred',
    requestId: 'unknown',
    timestamp: new Date().toISOString(),
    status: response?.status || 0,
  };
}

// Check if error is recoverable (should show toast)
export function isRecoverableError(error: ApiError): boolean {
  const recoverableCodes = [
    'VALIDATION_ERROR',
    'RATE_LIMITED',
    'TEMPORARY_ERROR',
    'NETWORK_ERROR',
  ];
  
  const recoverableStatuses = [400, 422, 429, 500, 502, 503, 504];
  
  return recoverableCodes.includes(error.code) || recoverableStatuses.includes(error.status);
}

// Check if error is hard failure (should show error page)
export function isHardFailure(error: ApiError): boolean {
  const hardFailureCodes = [
    'AUTHENTICATION_FAILED',
    'AUTHORIZATION_FAILED',
    'ACCOUNT_SUSPENDED',
    'SERVICE_UNAVAILABLE',
  ];
  
  const hardFailureStatuses = [401, 403, 423, 503];
  
  return hardFailureCodes.includes(error.code) || hardFailureStatuses.includes(error.status);
}

// Generic API request wrapper with error handling
export async function apiRequest<T>(
  requestFn: () => Promise<T>,
  options?: {
    showToast?: boolean;
    showErrorPage?: boolean;
  }
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    const normalizedError = normalizeApiError(error as AxiosError);
    
    // Handle error display based on type
    if (options?.showToast && isRecoverableError(normalizedError)) {
      // Show toast notification (will be handled by React Query hooks)
      console.warn('Recoverable error:', normalizedError);
    }
    
    if (options?.showErrorPage && isHardFailure(normalizedError)) {
      // Redirect to error page (will be handled by React Query hooks)
      console.error('Hard failure:', normalizedError);
    }
    
    throw normalizedError;
  }
}

// Export the client for direct use
export { apiClient as default };