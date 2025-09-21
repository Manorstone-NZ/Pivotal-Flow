import type { AxiosRequestConfig } from 'axios';

// Custom axios instance for Orval
export const customAxiosInstance = <T = any>(_config: AxiosRequestConfig): Promise<T> => {
  // Mock implementation - replace with actual client when available
  return Promise.resolve({} as T);
};

