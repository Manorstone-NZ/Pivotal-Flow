/**
 * Generated Client for D4 Contract Stability
 * Uses OpenAPI-generated types for better type safety
 */

import type { paths } from './types.js';
import { PivotalFlowClient } from '../index.js';

/**
 * Type-safe client that uses generated OpenAPI types
 * Extends the base PivotalFlowClient with generated type definitions
 */
export class GeneratedPivotalFlowClient extends PivotalFlowClient {
  
  /**
   * Type-safe quote operations using generated types
   */
  generatedQuotes = {
    /**
     * List quotes with generated types
     */
    list: async (): Promise<paths['/v1/quotes']['get']['responses'][200]['content']['application/json']> => {
      // Use the public axios instance instead of private request method
      const response = await this.axios.get('/v1/quotes');
      return response.data;
    },

    /**
     * Create quote with generated types
     */
    create: async (data: paths['/v1/quotes']['post']['requestBody']['content']['application/json']): Promise<paths['/v1/quotes']['post']['responses'][201]['content']['application/json']> => {
      // Use the public axios instance instead of private request method
      const response = await this.axios.post('/v1/quotes', data);
      return response.data;
    }
  };
}

// Export types for use in consuming applications
export type * from './types.js';
