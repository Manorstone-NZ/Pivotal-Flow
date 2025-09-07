import { AxiosRequestConfig } from 'axios';
import { createPivotalFlowClient } from './enhanced-client';
// Custom axios instance for Orval
export const customAxiosInstance = (config) => {
    const client = createPivotalFlowClient();
    return client.request(config).then(response => response.data);
};
//# sourceMappingURL=mutator.js.map