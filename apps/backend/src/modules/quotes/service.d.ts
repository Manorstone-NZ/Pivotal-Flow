import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { z } from 'zod';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { BaseRepository } from '../../lib/repo.base.js';
import { type CreateQuoteSchema, type UpdateQuoteSchema, type QuoteStatusTransitionSchema } from './schemas.js';
import type { PaginationOptions } from '../../lib/repo.base.js';
/**
 * Quote Service
 *
 * Handles all quote business logic including:
 * - Quote creation and updates
 * - Status transitions with validation
 * - Automatic recalculation on changes
 * - Audit logging for all operations
 * - Quote number generation
 */
export declare class QuoteService extends BaseRepository {
    options: {
        organizationId: string;
        userId: string;
    };
    private quoteNumberGenerator;
    private auditLogger;
    private rateCardService;
    private permissionService;
    private versioningService;
    private lockingService;
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, options: {
        organizationId: string;
        userId: string;
    }, auditLogger?: AuditLogger);
    /**
     * Create a new quote with line items
     */
    createQuote(data: z.infer<typeof CreateQuoteSchema>): Promise<any>;
    /**
     * Update quote header and/or line items with recalculation
     */
    updateQuote(quoteId: string, data: z.infer<typeof UpdateQuoteSchema>): Promise<any>;
    /**
     * Transition quote status with validation
     */
    transitionStatus(quoteId: string, transition: z.infer<typeof QuoteStatusTransitionSchema>): Promise<any>;
    /**
     * Get quote by ID using transaction context
     */
    private getQuoteByIdWithTx;
    /**
     * Get quote by ID with line items
     */
    getQuoteById(quoteId: string): Promise<any>;
    /**
     * List quotes with pagination and filters
     */
    listQuotes(pagination: PaginationOptions, filters?: any): Promise<{
        quotes: any[];
        pagination: any;
    }>;
    /**
     * Delete quote (soft delete)
     */
    deleteQuote(quoteId: string): Promise<void>;
    /**
     * Get all versions of a quote
     */
    getQuoteVersions(quoteId: string): Promise<any[]>;
    /**
     * Get a specific version of a quote with line items
     */
    getQuoteVersion(quoteId: string, versionId: string): Promise<any | null>;
    /**
     * Calculate quote with debug information
     */
    calculateQuoteDebug(input: z.infer<typeof CreateQuoteSchema>): Promise<any>;
}
//# sourceMappingURL=service.d.ts.map