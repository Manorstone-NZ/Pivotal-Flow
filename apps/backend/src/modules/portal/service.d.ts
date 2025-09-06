/**
 * Portal Service
 *
 * Service for customer portal APIs with strict security isolation
 */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { FastifyInstance } from 'fastify';
import { BaseRepository } from '../../lib/repo.base.js';
import type { PortalUserContext, PortalQuote, PortalQuoteDetail, PortalInvoice, PortalInvoiceDetail, PortalTimeEntrySummary, PortalQuoteFilters, PortalInvoiceFilters, PortalTimeEntryFilters, PortalPaginatedResponse } from './types.js';
/**
 * Portal Service
 *
 * Provides read-only access to customer data with strict isolation
 */
export declare class PortalService extends BaseRepository {
    private permissionService;
    private auditLogger;
    private userContext;
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, userContext: PortalUserContext, fastify: FastifyInstance);
    /**
     * Validate that the current user can access portal APIs
     */
    private validatePortalAccess;
    /**
     * Log security violations for audit trail
     */
    private logSecurityViolation;
    /**
     * Get quotes for the customer with filtering and pagination
     */
    getQuotes(filters: PortalQuoteFilters): Promise<PortalPaginatedResponse<PortalQuote>>;
    /**
     * Get quote detail by ID with customer ownership verification
     */
    getQuoteDetail(quoteId: string): Promise<PortalQuoteDetail>;
    /**
     * Get invoices for the customer with filtering and pagination
     */
    getInvoices(filters: PortalInvoiceFilters): Promise<PortalPaginatedResponse<PortalInvoice>>;
    /**
     * Get invoice detail by ID with customer ownership verification
     */
    getInvoiceDetail(invoiceId: string): Promise<PortalInvoiceDetail>;
    /**
     * Get time entry summaries (approved entries only)
     * Note: This is a placeholder since time entries table doesn't exist yet
     */
    getTimeEntries(filters: PortalTimeEntryFilters): Promise<PortalPaginatedResponse<PortalTimeEntrySummary>>;
}
//# sourceMappingURL=service.d.ts.map