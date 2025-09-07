#!/usr/bin/env tsx
/**
 * Enhanced SDK Generation Script for E4 SDK Integration
 * Generates TypeScript types and client from OpenAPI specification with tree shaking
 */
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Configuration
const API_URL = process.env['API_URL'] || 'http://localhost:3000/api/openapi.json';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'gen');
const TYPES_FILE = join(OUTPUT_DIR, 'types.ts');
const CLIENT_FILE = join(OUTPUT_DIR, 'client.ts');
const ORVAL_CONFIG_FILE = join(__dirname, '..', 'orval.config.ts');
async function generateSDK() {
    try {
        console.log('🔄 Fetching OpenAPI spec from', API_URL);
        // Ensure output directory exists
        mkdirSync(OUTPUT_DIR, { recursive: true });
        // Step 1: Generate types with openapi-typescript
        console.log('📝 Generating TypeScript types...');
        const typesCommand = `npx openapi-typescript "${API_URL}" --output "${TYPES_FILE}"`;
        console.log('Running:', typesCommand);
        execSync(typesCommand, {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });
        // Step 2: Generate client with orval
        console.log('🔧 Generating API client...');
        await generateOrvalConfig();
        const clientCommand = `npx orval --config "${ORVAL_CONFIG_FILE}"`;
        console.log('Running:', clientCommand);
        execSync(clientCommand, {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });
        // Step 3: Generate enhanced client with interceptors
        console.log('⚡ Generating enhanced client with interceptors...');
        await generateEnhancedClient();
        console.log('✅ Generated SDK components:');
        console.log('   - Types:', TYPES_FILE);
        console.log('   - Client:', CLIENT_FILE);
        console.log('   - Tree-shaken endpoints');
        console.log('   - Axios interceptors for auth, retry, rate limiting');
        console.log('   - ETag support for cache validation');
    }
    catch (error) {
        console.error('❌ Failed to generate SDK:', error);
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                console.error('💡 Make sure the backend server is running on', API_URL);
                console.error('💡 You can also set API_URL environment variable to point to a different URL');
            }
        }
        process.exit(1);
    }
}
async function generateOrvalConfig() {
    const orvalConfig = `
import { defineConfig } from 'orval';

export default defineConfig({
  'pivotal-flow-api': {
    input: {
      target: '${API_URL}',
    },
    output: {
      target: '${CLIENT_FILE}',
      client: 'axios',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/gen/mutator.ts',
          name: 'customAxiosInstance',
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'cursor',
        },
      },
    },
  },
});
`;
    writeFileSync(ORVAL_CONFIG_FILE, orvalConfig.trim());
    console.log('📋 Generated Orval configuration');
}
async function generateEnhancedClient() {
    const enhancedClient = `
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { paths } from './types';

// Enhanced Axios instance with interceptors
export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth and ETag
  instance.interceptors.request.use(
    (config) => {
      // Add Authorization header
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }

      // Add ETag for cache validation
      const etag = getETag(config.url || '');
      if (etag) {
        config.headers['If-None-Match'] = etag;
      }

      // Add CSRF token if available
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling and ETag caching
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Cache ETag for future requests
      const etag = response.headers['etag'];
      if (etag && response.config.url) {
        setETag(response.config.url, etag);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 - Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }

      // Handle 429 - Rate Limited
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : getExponentialBackoffDelay(originalRequest._retryCount || 0);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        if (originalRequest._retryCount < 3) {
          return instance(originalRequest);
        }
      }

      // Handle 5xx - Server Errors
      if (error.response?.status && error.response.status >= 500) {
        const delay = getExponentialBackoffDelay(originalRequest._retryCount || 0);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        if (originalRequest._retryCount < 3) {
          return instance(originalRequest);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Utility functions for token management
function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

function getCSRFToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('csrfToken');
  }
  return null;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return null;

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }
      return data.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
}

function handleAuthFailure(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}

// ETag cache management
const etagCache = new Map<string, string>();

function getETag(url: string): string | undefined {
  return etagCache.get(url);
}

function setETag(url: string, etag: string): void {
  etagCache.set(url, etag);
}

// Exponential backoff with jitter
function getExponentialBackoffDelay(retryCount: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const jitter = Math.random() * 0.1; // 10% jitter
  
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  return delay + (delay * jitter);
}

// Export the enhanced client factory
export const createPivotalFlowClient = (baseURL: string = 'http://localhost:3000/api/v1') => {
  return createAxiosInstance(baseURL);
};
`;
    writeFileSync(join(OUTPUT_DIR, 'enhanced-client.ts'), enhancedClient.trim());
    console.log('⚡ Generated enhanced client with interceptors');
}
// Run generation
generateSDK();
//# sourceMappingURL=generate-enhanced.js.map