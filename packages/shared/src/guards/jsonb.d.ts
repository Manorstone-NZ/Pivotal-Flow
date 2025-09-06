/**
 * JSONB Metadata Guard
 * Prevents business values from being stored in JSONB metadata fields
 */
/**
 * Forbidden fields that cannot be stored in JSONB metadata
 * These fields must be stored in typed columns instead
 */
export declare const FORBIDDEN_JSONB_FIELDS: string[];
/**
 * Validate that JSONB metadata doesn't contain forbidden business values
 * @param data - The data to validate
 * @param context - Context string for error messages
 * @throws Error if forbidden fields are found
 */
export declare function validateMetadataJSONB(data: any, context: string): void;
/**
 * Validate quote line item metadata
 * @param metadata - Line item metadata to validate
 * @param lineNumber - Line number for error context
 */
export declare function validateQuoteLineItemMetadata(metadata: any, lineNumber: number): void;
/**
 * Validate quote metadata
 * @param metadata - Quote metadata to validate
 */
export declare function validateQuoteMetadata(metadata: any): void;
/**
 * Validate rate card metadata
 * @param metadata - Rate card metadata to validate
 */
export declare function validateRateCardMetadata(metadata: any): void;
/**
 * Validate rate card item metadata
 * @param metadata - Rate card item metadata to validate
 */
export declare function validateRateCardItemMetadata(metadata: any): void;
/**
 * Check if a field name is forbidden in JSONB
 * @param fieldName - Field name to check
 * @returns true if field is forbidden
 */
export declare function isForbiddenField(fieldName: string): boolean;
/**
 * Get list of forbidden fields for documentation
 * @returns Array of forbidden field names
 */
export declare function getForbiddenFields(): string[];
//# sourceMappingURL=jsonb.d.ts.map