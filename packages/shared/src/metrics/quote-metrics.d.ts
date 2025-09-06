import { Counter, Histogram } from 'prom-client';
/**
 * Quote-specific Prometheus metrics for performance monitoring
 */
export declare class QuoteMetrics {
    private quoteCreatedTotal;
    private quoteRecalcTotal;
    private quoteUpdatedTotal;
    private quoteListedTotal;
    private quoteErrorsTotal;
    private quoteDurationMs;
    private quoteListDurationMs;
    constructor();
    /**
     * Record quote creation
     */
    recordQuoteCreated(organizationId: string, status: string): void;
    /**
     * Record quote recalculation
     */
    recordQuoteRecalc(organizationId: string, trigger: string): void;
    /**
     * Record quote update
     */
    recordQuoteUpdated(organizationId: string, status: string): void;
    /**
     * Record quote list operation
     */
    recordQuoteListed(organizationId: string, filtersApplied: string): void;
    /**
     * Record quote error
     */
    recordQuoteError(organizationId: string, operation: string, errorType: string): void;
    /**
     * Start timing a quote operation
     */
    startQuoteTimer(organizationId: string, operation: string): () => void;
    /**
     * Start timing a quote list operation
     */
    startQuoteListTimer(organizationId: string, pageSize: number, filtersCount: number): () => void;
    /**
     * Get all metrics for testing
     */
    getMetrics(): {
        quoteCreatedTotal: Counter<string>;
        quoteRecalcTotal: Counter<string>;
        quoteUpdatedTotal: Counter<string>;
        quoteListedTotal: Counter<string>;
        quoteErrorsTotal: Counter<string>;
        quoteDurationMs: Histogram<string>;
        quoteListDurationMs: Histogram<string>;
    };
}
export declare const quoteMetrics: QuoteMetrics;
//# sourceMappingURL=quote-metrics.d.ts.map