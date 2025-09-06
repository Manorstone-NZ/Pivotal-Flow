/**
 * Reporting service
 * Core business logic for generating reports and summaries
 */
import { required, startTimer } from '@pivotal-flow/shared';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { getDatabase } from '../../lib/db.js';
import { quotes, invoices, payments, customers, projects } from '../../lib/schema.js';
import { REPORT_TYPES } from './constants.js';
import { ReportingMetrics } from './metrics.js';
/**
 * Reporting service for generating compliance reports and summaries
 */
export class ReportingService {
    organizationId;
    userId;
    permissionService;
    db = getDatabase();
    metrics = ReportingMetrics.getInstance();
    constructor(organizationId, userId, permissionService) {
        this.organizationId = organizationId;
        this.userId = userId;
        this.permissionService = permissionService;
    }
    /**
     * Generate quote cycle time summary
     */
    async generateQuoteCycleTimeSummary(filters) {
        const timer = startTimer();
        // Check permissions
        const canViewReports = await this.permissionService.hasPermission(this.userId, 'reports.view_reports');
        if (!canViewReports.hasPermission) {
            throw new Error('Permission denied: cannot view reports');
        }
        // Build query conditions
        const conditions = [eq(quotes.organizationId, this.organizationId)];
        if (filters.fromDate) {
            conditions.push(gte(quotes.createdAt, new Date(filters.fromDate)));
        }
        if (filters.toDate) {
            conditions.push(lte(quotes.createdAt, new Date(filters.toDate)));
        }
        if (filters.customerId) {
            conditions.push(eq(quotes.customerId, filters.customerId));
        }
        if (filters.projectId) {
            conditions.push(eq(quotes.projectId, filters.projectId));
        }
        if (filters.status && filters.status.length > 0) {
            conditions.push(sql `${quotes.status} = ANY(${filters.status})`);
        }
        // Get quotes with customer and project info
        const quotesData = await this.db
            .select({
            id: quotes.id,
            quoteNumber: quotes.quoteNumber,
            status: quotes.status,
            createdAt: quotes.createdAt,
            sentAt: quotes.sentAt,
            acceptedAt: quotes.acceptedAt,
            totalAmount: quotes.totalAmount,
            currency: quotes.currency,
            customerName: customers.companyName,
            projectName: projects.name,
        })
            .from(quotes)
            .leftJoin(customers, eq(quotes.customerId, customers.id))
            .leftJoin(projects, eq(quotes.projectId, projects.id))
            .where(and(...conditions))
            .orderBy(desc(quotes.createdAt));
        // Calculate cycle times
        const quotesWithCycleTime = quotesData.map((quote) => {
            const cycleTimeDays = quote.acceptedAt && quote.sentAt
                ? Math.ceil((new Date(quote.acceptedAt).getTime() - new Date(quote.sentAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
            return {
                ...quote,
                cycleTimeDays,
                totalAmount: Number(quote.totalAmount)
            };
        }).filter((quote) => quote.cycleTimeDays > 0 || filters.minCycleTimeDays === undefined);
        // Apply cycle time filters
        let filteredQuotes = quotesWithCycleTime;
        if (filters.minCycleTimeDays !== undefined) {
            filteredQuotes = filteredQuotes.filter((quote) => quote.cycleTimeDays >= required(filters.minCycleTimeDays, "minCycleTimeDays is required"));
        }
        if (filters.maxCycleTimeDays !== undefined) {
            filteredQuotes = filteredQuotes.filter((quote) => quote.cycleTimeDays <= required(filters.maxCycleTimeDays, "maxCycleTimeDays is required"));
        }
        // Calculate summary statistics
        const cycleTimes = filteredQuotes.map((q) => q.cycleTimeDays).filter((t) => t > 0);
        const totalQuotes = filteredQuotes.length;
        const averageCycleTimeDays = cycleTimes.length > 0
            ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length
            : 0;
        const medianCycleTimeDays = this.calculateMedian(cycleTimes);
        const minCycleTimeDays = cycleTimes.length > 0 ? Math.min(...cycleTimes) : 0;
        const maxCycleTimeDays = cycleTimes.length > 0 ? Math.max(...cycleTimes) : 0;
        // Group by status and project
        const quotesByStatus = this.groupBy(filteredQuotes, 'status');
        const quotesByProject = this.groupBy(filteredQuotes, 'projectName');
        // Calculate distribution
        const cycleTimeDistribution = this.calculateDistribution(cycleTimes, [
            { min: 0, max: 1, label: '0-1 days' },
            { min: 2, max: 3, label: '2-3 days' },
            { min: 4, max: 7, label: '4-7 days' },
            { min: 8, max: 14, label: '8-14 days' },
            { min: 15, max: 30, label: '15-30 days' },
            { min: 31, max: Infinity, label: '30+ days' },
        ]);
        const summary = {
            totalQuotes,
            averageCycleTimeDays: Math.round(averageCycleTimeDays * 100) / 100,
            medianCycleTimeDays,
            minCycleTimeDays,
            maxCycleTimeDays,
            quotesByStatus,
            quotesByProject,
            cycleTimeDistribution,
        };
        // Record metrics
        const duration = timer();
        this.metrics.recordReportGenerated(REPORT_TYPES.QUOTE_CYCLE_TIME, this.organizationId);
        this.metrics.recordReportDuration(REPORT_TYPES.QUOTE_CYCLE_TIME, this.organizationId, duration);
        // Log performance metrics
        console.log({
            reportName: 'quote-cycle-time',
            organizationId: this.organizationId,
            rows: totalQuotes,
            ms: duration
        });
        return summary;
    }
    /**
     * Generate invoice settlement time summary
     */
    async generateInvoiceSettlementTimeSummary(filters) {
        // Check permissions
        const canViewReports = await this.permissionService.hasPermission(this.userId, 'reports.view_reports');
        if (!canViewReports.hasPermission) {
            throw new Error('Permission denied: cannot view reports');
        }
        // Build query conditions
        const conditions = [eq(invoices.organizationId, this.organizationId)];
        if (filters.fromDate) {
            conditions.push(gte(invoices.issuedAt, new Date(filters.fromDate)));
        }
        if (filters.toDate) {
            conditions.push(lte(invoices.issuedAt, new Date(filters.toDate)));
        }
        if (filters.customerId) {
            conditions.push(eq(invoices.customerId, filters.customerId));
        }
        if (filters.projectId) {
            conditions.push(eq(invoices.projectId, filters.projectId));
        }
        if (filters.status && filters.status.length > 0) {
            conditions.push(sql `${invoices.status} = ANY(${filters.status})`);
        }
        if (filters.overdueOnly) {
            conditions.push(eq(invoices.status, 'overdue'));
        }
        // Get invoices with customer and project info
        const invoicesData = await this.db
            .select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            status: invoices.status,
            issuedAt: invoices.issuedAt,
            dueAt: invoices.dueAt,
            paidAt: invoices.paidAt,
            totalAmount: invoices.totalAmount,
            paidAmount: invoices.paidAmount,
            balanceAmount: invoices.balanceAmount,
            currency: invoices.currency,
            customerName: customers.companyName,
            projectName: projects.name,
        })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .leftJoin(projects, eq(invoices.projectId, projects.id))
            .where(and(...conditions))
            .orderBy(desc(invoices.issuedAt));
        // Calculate settlement times
        const invoicesWithSettlementTime = invoicesData.map((invoice) => {
            const settlementTimeDays = invoice.paidAt && invoice.createdAt
                ? Math.ceil((new Date(invoice.paidAt).getTime() - new Date(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
            return {
                ...invoice,
                settlementTimeDays,
                totalAmount: Number(invoice.totalAmount),
                balanceAmount: Number(invoice.balanceAmount)
            };
        });
        // Apply settlement time filters
        let filteredInvoices = invoicesWithSettlementTime;
        if (filters.minSettlementTimeDays !== undefined) {
            filteredInvoices = filteredInvoices.filter((invoice) => invoice.settlementTimeDays >= required(filters.minSettlementTimeDays, "minSettlementTimeDays is required"));
        }
        if (filters.maxSettlementTimeDays !== undefined) {
            filteredInvoices = filteredInvoices.filter((invoice) => invoice.settlementTimeDays <= required(filters.maxSettlementTimeDays, "maxSettlementTimeDays is required"));
        }
        // Calculate summary statistics
        const settlementTimes = filteredInvoices.map((i) => i.settlementTimeDays).filter((t) => t > 0);
        const totalInvoices = filteredInvoices.length;
        const averageSettlementTimeDays = settlementTimes.length > 0
            ? settlementTimes.reduce((sum, time) => sum + time, 0) / settlementTimes.length
            : 0;
        const medianSettlementTimeDays = this.calculateMedian(settlementTimes);
        const overdueInvoices = filteredInvoices.filter((i) => i.status === 'overdue').length;
        const overdueAmount = filteredInvoices
            .filter((i) => i.status === 'overdue')
            .reduce((sum, i) => sum + Number(i.balanceAmount), 0);
        // Group by status and customer
        const invoicesByStatus = this.groupBy(filteredInvoices, 'status');
        const invoicesByCustomer = this.groupBy(filteredInvoices, 'customerName');
        // Calculate distribution
        const settlementTimeDistribution = this.calculateDistribution(settlementTimes, [
            { min: 0, max: 7, label: '0-7 days' },
            { min: 8, max: 14, label: '8-14 days' },
            { min: 15, max: 30, label: '15-30 days' },
            { min: 31, max: 60, label: '31-60 days' },
            { min: 61, max: 90, label: '61-90 days' },
            { min: 91, max: Infinity, label: '90+ days' },
        ]);
        const summary = {
            totalInvoices,
            averageSettlementTimeDays: Math.round(averageSettlementTimeDays * 100) / 100,
            medianSettlementTimeDays,
            overdueInvoices,
            overdueAmount,
            invoicesByStatus,
            invoicesByCustomer,
            settlementTimeDistribution,
        };
        // Record metrics
        this.metrics.recordReportGenerated(REPORT_TYPES.INVOICE_SETTLEMENT_TIME, this.organizationId);
        return summary;
    }
    /**
     * Generate time approvals summary
     */
    async generateTimeApprovalsSummary(_filters) {
        // Check permissions
        const canViewReports = await this.permissionService.hasPermission(this.userId, 'reports.view_reports');
        if (!canViewReports.hasPermission) {
            throw new Error('Permission denied: cannot view reports');
        }
        // Note: Time entries table doesn't exist yet, so this is a placeholder
        // In production, this would query the time entries table with proper filters
        const summary = {
            totalEntries: 0,
            approvedEntries: 0,
            rejectedEntries: 0,
            averageLeadTimeHours: 0,
            rejectionRate: 0,
            entriesByUser: {},
            entriesByProject: {},
            leadTimeDistribution: [],
        };
        // Record metrics
        this.metrics.recordReportGenerated(REPORT_TYPES.TIME_APPROVALS, this.organizationId);
        return summary;
    }
    /**
     * Generate payments received summary
     */
    async generatePaymentsReceivedSummary(filters) {
        // Check permissions
        const canViewReports = await this.permissionService.hasPermission(this.userId, 'reports.view_reports');
        if (!canViewReports.hasPermission) {
            throw new Error('Permission denied: cannot view reports');
        }
        // Build query conditions
        const conditions = [eq(payments.organizationId, this.organizationId)];
        if (filters.fromDate) {
            conditions.push(gte(payments.paidAt, new Date(filters.fromDate)));
        }
        if (filters.toDate) {
            conditions.push(lte(payments.paidAt, new Date(filters.toDate)));
        }
        if (filters.customerId) {
            // Join with invoices to filter by customer
            conditions.push(sql `EXISTS (
        SELECT 1 FROM invoices 
        WHERE invoices.id = payments.invoice_id 
        AND invoices.customer_id = ${filters.customerId}
      )`);
        }
        if (filters.method && filters.method.length > 0) {
            conditions.push(sql `${payments.method} = ANY(${filters.method})`);
        }
        if (filters.status && filters.status.length > 0) {
            conditions.push(sql `${payments.status} = ANY(${filters.status})`);
        }
        if (filters.minAmount !== undefined) {
            conditions.push(gte(payments.amount, filters.minAmount.toString()));
        }
        if (filters.maxAmount !== undefined) {
            conditions.push(lte(payments.amount, filters.maxAmount.toString()));
        }
        // Get payments with invoice and customer info
        const paymentsData = await this.db
            .select({
            id: payments.id,
            amount: payments.amount,
            currency: payments.currency,
            method: payments.method,
            status: payments.status,
            paidAt: payments.paidAt,
            reference: payments.reference,
            invoiceNumber: invoices.invoiceNumber,
            customerName: customers.companyName,
        })
            .from(payments)
            .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(and(...conditions))
            .orderBy(desc(payments.paidAt));
        // Calculate summary statistics
        const totalPayments = paymentsData.length;
        const calculatedTotalAmount = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
        const averageAmount = totalPayments > 0 ? calculatedTotalAmount / totalPayments : 0;
        // Group by method, month, and customer
        const paymentsByMethod = this.groupBy(paymentsData, 'method');
        const paymentsByMonth = this.groupBy(paymentsData.map((p) => ({
            ...p,
            month: new Date(p.paidAt).toISOString().slice(0, 7),
            amount: Number(p.amount)
        })), 'month');
        const paymentsByCustomer = this.groupBy(paymentsData, 'customerName');
        // Calculate amount distribution
        const amounts = paymentsData.map((p) => Number(p.amount));
        const amountDistribution = this.calculateDistribution(amounts, [
            { min: 0, max: 1000, label: '$0-$1,000' },
            { min: 1001, max: 5000, label: '$1,001-$5,000' },
            { min: 5001, max: 10000, label: '$5,001-$10,000' },
            { min: 10001, max: 25000, label: '$10,001-$25,000' },
            { min: 25001, max: 50000, label: '$25,001-$50,000' },
            { min: 50001, max: Infinity, label: '$50,000+' },
        ]);
        const summary = {
            totalPayments,
            totalAmount: calculatedTotalAmount,
            averageAmount: Math.round(averageAmount * 100) / 100,
            paymentsByMethod,
            paymentsByMonth,
            paymentsByCustomer,
            amountDistribution,
        };
        // Record metrics
        this.metrics.recordReportGenerated(REPORT_TYPES.PAYMENTS_RECEIVED, this.organizationId);
        return summary;
    }
    /**
     * Get quote cycle time data for export
     */
    async getQuoteCycleTimeData(filters, page = 1, limit = 25) {
        // Check permissions
        const canViewReports = await this.permissionService.hasPermission(this.userId, 'reports.view_reports');
        if (!canViewReports.hasPermission) {
            throw new Error('Permission denied: cannot view reports');
        }
        const offset = (page - 1) * limit;
        // Build query conditions
        const conditions = [eq(quotes.organizationId, this.organizationId)];
        if (filters.fromDate) {
            conditions.push(gte(quotes.createdAt, new Date(filters.fromDate)));
        }
        if (filters.toDate) {
            conditions.push(lte(quotes.createdAt, new Date(filters.toDate)));
        }
        if (filters.customerId) {
            conditions.push(eq(quotes.customerId, filters.customerId));
        }
        if (filters.projectId) {
            conditions.push(eq(quotes.projectId, filters.projectId));
        }
        if (filters.status && filters.status.length > 0) {
            conditions.push(sql `${quotes.status} = ANY(${filters.status})`);
        }
        // Get total count
        const totalResult = await this.db
            .select({ count: sql `count(*)` })
            .from(quotes)
            .where(and(...conditions));
        const total = totalResult[0]?.count || 0;
        // Get paginated data
        const quotesData = await this.db
            .select({
            id: quotes.id,
            quoteNumber: quotes.quoteNumber,
            status: quotes.status,
            createdAt: quotes.createdAt,
            sentAt: quotes.sentAt,
            acceptedAt: quotes.acceptedAt,
            totalAmount: quotes.totalAmount,
            currency: quotes.currency,
            customerName: customers.companyName,
            projectName: projects.name,
        })
            .from(quotes)
            .leftJoin(customers, eq(quotes.customerId, customers.id))
            .leftJoin(projects, eq(quotes.projectId, projects.id))
            .where(and(...conditions))
            .orderBy(desc(quotes.createdAt))
            .limit(limit)
            .offset(offset);
        // Calculate cycle times and apply filters
        const rows = quotesData.map((quote) => {
            const cycleTimeDays = quote.acceptedAt && quote.sentAt
                ? Math.ceil((new Date(quote.acceptedAt).getTime() - new Date(quote.sentAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
            return {
                quoteId: quote.id,
                quoteNumber: quote.quoteNumber,
                customerName: quote.customerName || 'Unknown',
                projectName: quote.projectName || 'Unknown',
                status: quote.status,
                createdAt: quote.createdAt.toISOString(),
                sentAt: quote.sentAt?.toISOString() || '',
                acceptedAt: quote.acceptedAt?.toISOString() || '',
                cycleTimeDays,
                totalAmount: Number(quote.totalAmount),
                currency: quote.currency,
            };
        });
        // Apply cycle time filters
        let filteredRows = rows;
        if (filters.minCycleTimeDays !== undefined) {
            filteredRows = filteredRows.filter(row => row.cycleTimeDays >= required(filters.minCycleTimeDays, "minCycleTimeDays is required"));
        }
        if (filters.maxCycleTimeDays !== undefined) {
            filteredRows = filteredRows.filter(row => row.cycleTimeDays <= required(filters.maxCycleTimeDays, "maxCycleTimeDays is required"));
        }
        return {
            data: filteredRows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    }
    /**
     * Helper method to calculate median
     */
    calculateMedian(values) {
        if (values.length === 0)
            return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (required(sorted[mid - 1], "median calculation requires valid array access") + required(sorted[mid], "median calculation requires valid array access")) / 2
            : required(sorted[mid], "median calculation requires valid array access");
    }
    /**
     * Helper method to group by property
     */
    groupBy(items, key) {
        return items.reduce((acc, item) => {
            const value = String(item[key] || 'Unknown');
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
    /**
     * Helper method to calculate distribution
     */
    calculateDistribution(values, ranges) {
        const total = values.length;
        return ranges.map(range => {
            const count = values.filter(v => v >= range.min && v <= range.max).length;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return {
                range: range.label,
                count,
                percentage: Math.round(percentage * 100) / 100,
            };
        });
    }
}
//# sourceMappingURL=service.js.map