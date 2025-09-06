import { Counter, Histogram } from 'prom-client';
/**
 * Quote-specific Prometheus metrics for performance monitoring
 */
export class QuoteMetrics {
    // Quote operation counters
    quoteCreatedTotal;
    quoteRecalcTotal;
    quoteUpdatedTotal;
    quoteListedTotal;
    quoteErrorsTotal;
    // Quote operation duration histograms
    quoteDurationMs;
    quoteListDurationMs;
    constructor() {
        // Initialize counters
        this.quoteCreatedTotal = new Counter({
            name: 'pivotal_quote_created_total',
            help: 'Total number of quotes created',
            labelNames: ['organization_id', 'status']
        });
        this.quoteRecalcTotal = new Counter({
            name: 'pivotal_quote_recalc_total',
            help: 'Total number of quote recalculations',
            labelNames: ['organization_id', 'trigger']
        });
        this.quoteUpdatedTotal = new Counter({
            name: 'pivotal_quote_updated_total',
            help: 'Total number of quotes updated',
            labelNames: ['organization_id', 'status']
        });
        this.quoteListedTotal = new Counter({
            name: 'pivotal_quote_listed_total',
            help: 'Total number of quote list operations',
            labelNames: ['organization_id', 'filters_applied']
        });
        this.quoteErrorsTotal = new Counter({
            name: 'pivotal_quote_errors_total',
            help: 'Total number of quote operation errors',
            labelNames: ['organization_id', 'operation', 'error_type']
        });
        // Initialize histograms
        this.quoteDurationMs = new Histogram({
            name: 'pivotal_quote_duration_ms',
            help: 'Quote operation duration in milliseconds',
            labelNames: ['organization_id', 'operation'],
            buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000]
        });
        this.quoteListDurationMs = new Histogram({
            name: 'pivotal_quote_list_duration_ms',
            help: 'Quote list operation duration in milliseconds',
            labelNames: ['organization_id', 'page_size', 'filters_count'],
            buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000]
        });
    }
    /**
     * Record quote creation
     */
    recordQuoteCreated(organizationId, status) {
        this.quoteCreatedTotal.inc({ organization_id: organizationId, status });
    }
    /**
     * Record quote recalculation
     */
    recordQuoteRecalc(organizationId, trigger) {
        this.quoteRecalcTotal.inc({ organization_id: organizationId, trigger });
    }
    /**
     * Record quote update
     */
    recordQuoteUpdated(organizationId, status) {
        this.quoteUpdatedTotal.inc({ organization_id: organizationId, status });
    }
    /**
     * Record quote list operation
     */
    recordQuoteListed(organizationId, filtersApplied) {
        this.quoteListedTotal.inc({ organization_id: organizationId, filters_applied: filtersApplied });
    }
    /**
     * Record quote error
     */
    recordQuoteError(organizationId, operation, errorType) {
        this.quoteErrorsTotal.inc({ organization_id: organizationId, operation, error_type: errorType });
    }
    /**
     * Start timing a quote operation
     */
    startQuoteTimer(organizationId, operation) {
        const timer = this.quoteDurationMs.startTimer({ organization_id: organizationId, operation });
        return () => timer();
    }
    /**
     * Start timing a quote list operation
     */
    startQuoteListTimer(organizationId, pageSize, filtersCount) {
        const timer = this.quoteListDurationMs.startTimer({
            organization_id: organizationId,
            page_size: pageSize.toString(),
            filters_count: filtersCount.toString()
        });
        return () => timer();
    }
    /**
     * Get all metrics for testing
     */
    getMetrics() {
        return {
            quoteCreatedTotal: this.quoteCreatedTotal,
            quoteRecalcTotal: this.quoteRecalcTotal,
            quoteUpdatedTotal: this.quoteUpdatedTotal,
            quoteListedTotal: this.quoteListedTotal,
            quoteErrorsTotal: this.quoteErrorsTotal,
            quoteDurationMs: this.quoteDurationMs,
            quoteListDurationMs: this.quoteListDurationMs
        };
    }
}
// Export singleton instance
export const quoteMetrics = new QuoteMetrics();
//# sourceMappingURL=quote-metrics.js.map