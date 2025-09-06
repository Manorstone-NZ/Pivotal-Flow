import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
/**
 * Quote Number Generator Service
 *
 * Generates deterministic, sequential quote numbers per organization
 * Format: {PREFIX}-{YEAR}-{SEQUENCE} (e.g., Q-2024-0001)
 *
 * Features:
 * - Deterministic server-side generation
 * - Zero-padded sequential numbers
 * - Organization-specific prefixes
 * - Transaction-safe sequence generation
 * - No gaps in sequence within a single transaction
 */
export declare class QuoteNumberGenerator {
    private db;
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>);
    /**
     * Generate the next quote number for an organization
     * Uses transaction retry logic to handle concurrency
     */
    generateQuoteNumber(organizationId: string): Promise<string>;
    /**
     * Get organization prefix from settings
     * Defaults to 'Q' if not configured
     */
    private getOrganizationPrefix;
    /**
     * Validate quote number format
     */
    static validateQuoteNumber(quoteNumber: string): boolean;
    /**
     * Extract components from quote number
     */
    static parseQuoteNumber(quoteNumber: string): {
        prefix: string;
        year: number;
        sequence: number;
    } | null;
    /**
     * Check if quote number already exists
     */
    quoteNumberExists(quoteNumber: string, organizationId: string): Promise<boolean>;
    /**
     * Get quote number statistics for an organization
     */
    getQuoteNumberStats(organizationId: string): Promise<{
        totalQuotes: number;
        currentYearQuotes: number;
        lastQuoteNumber: string | null;
        nextSequence: number;
    }>;
}
//# sourceMappingURL=quote-number.d.ts.map