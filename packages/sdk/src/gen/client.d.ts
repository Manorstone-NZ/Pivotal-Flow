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
export declare class GeneratedPivotalFlowClient extends PivotalFlowClient {
    /**
     * Type-safe quote operations using generated types
     */
    generatedQuotes: {
        /**
         * List quotes with generated types
         */
        list: () => Promise<paths["/v1/quotes"]["get"]["responses"][200]["content"]["application/json"]>;
        /**
         * Create quote with generated types
         */
        create: (data: paths["/v1/quotes"]["post"]["requestBody"]["content"]["application/json"]) => Promise<paths["/v1/quotes"]["post"]["responses"][201]["content"]["application/json"]>;
    };
}
export type * from './types.js';
//# sourceMappingURL=client.d.ts.map