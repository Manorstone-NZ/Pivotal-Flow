/**
 * JSONB Metadata Guard
 * Prevents business values from being stored in JSONB metadata fields
 */

/**
 * Forbidden fields that cannot be stored in JSONB metadata
 * These fields must be stored in typed columns instead
 */
export const FORBIDDEN_JSONB_FIELDS = [
  // Monetary amounts
  'subtotal', 'taxTotal', 'grandTotal', 'totalAmount',
  'unitPrice', 'price', 'amount', 'cost',
  'discountAmount', 'taxAmount', 'discountValue',
  
  // Business calculations
  'quantity', 'qty', 'unit', 'taxRate', 'taxClass',
  'currency', 'exchangeRate', 'rate',
  
  // Status and totals
  'status', 'totals', 'calculations', 'breakdown',
  
  // Line item specific
  'lineNumber', 'description', 'sku', 'itemCode',
  'serviceCategoryId', 'rateCardId',
  
  // Quote specific
  'quoteNumber', 'customerId', 'projectId',
  'validFrom', 'validUntil', 'approvedBy', 'sentAt'
];

/**
 * Validate that JSONB metadata doesn't contain forbidden business values
 * @param data - The data to validate
 * @param context - Context string for error messages
 * @throws Error if forbidden fields are found
 */
export function validateMetadataJSONB(data: any, context: string): void {
  if (!data || typeof data !== 'object') {
    return; // Nothing to validate
  }
  
  const checkObject = (obj: any, path: string = '') => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this field is forbidden
        if (FORBIDDEN_JSONB_FIELDS.includes(key)) {
          throw new Error(
            `JSONB metadata cannot contain business values. Field '${key}' at path '${currentPath}' in ${context} is forbidden. ` +
            `Business values must be stored in typed columns, not in metadata JSONB.`
          );
        }
        
        // Recursively check nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          checkObject(value, currentPath);
        }
      }
    }
  };

  checkObject(data);
}

/**
 * Validate quote line item metadata
 * @param metadata - Line item metadata to validate
 * @param lineNumber - Line number for error context
 */
export function validateQuoteLineItemMetadata(metadata: any, lineNumber: number): void {
  validateMetadataJSONB(metadata, `quote line item ${lineNumber} metadata`);
}

/**
 * Validate quote metadata
 * @param metadata - Quote metadata to validate
 */
export function validateQuoteMetadata(metadata: any): void {
  validateMetadataJSONB(metadata, 'quote metadata');
}

/**
 * Validate rate card metadata
 * @param metadata - Rate card metadata to validate
 */
export function validateRateCardMetadata(metadata: any): void {
  validateMetadataJSONB(metadata, 'rate card metadata');
}

/**
 * Validate rate card item metadata
 * @param metadata - Rate card item metadata to validate
 */
export function validateRateCardItemMetadata(metadata: any): void {
  validateMetadataJSONB(metadata, 'rate card item metadata');
}

/**
 * Check if a field name is forbidden in JSONB
 * @param fieldName - Field name to check
 * @returns true if field is forbidden
 */
export function isForbiddenField(fieldName: string): boolean {
  return FORBIDDEN_JSONB_FIELDS.includes(fieldName);
}

/**
 * Get list of forbidden fields for documentation
 * @returns Array of forbidden field names
 */
export function getForbiddenFields(): string[] {
  return [...FORBIDDEN_JSONB_FIELDS];
}
