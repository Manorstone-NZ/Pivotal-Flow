import { AxiosRequestConfig } from 'axios';
import { createPivotalFlowClient } from './enhanced-client';

// Custom axios instance for Orval
export const customAxiosInstance = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const client = createPivotalFlowClient();
  return client.request<T>(config).then(response => response.data);
};

