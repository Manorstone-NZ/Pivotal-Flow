import type { Invoice, CreateInvoice, UpdateInvoice, InvoiceListFilters, InvoiceStatusTransition, MarkInvoicePaid, VoidInvoice } from './typeboxSchemas.js';
export interface InvoiceContext {
    organizationId: string;
    userId: string;
}
export declare class InvoiceService {
    private context;
    private db;
    constructor(context: InvoiceContext);
    /**
     * Generate ETag for invoice caching
     */
    private generateETag;
    /**
     * Generate next invoice number
     */
    private generateInvoiceNumber;
    /**
     * List invoices with filtering and pagination
     */
    listInvoices(filters?: InvoiceListFilters): Promise<{
        data: {
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paidAmount: number;
            balanceAmount: number;
            customer: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            } | null;
            etag: string;
            id: string;
            organizationId: string;
            tenantId: string | null;
            invoiceNumber: string;
            customerId: string;
            projectId: string | null;
            quoteId: string | null;
            currency: string;
            status: string;
            issuedAt: Date | null;
            dueAt: Date | null;
            paidAt: Date | null;
            overdueAt: Date | null;
            writtenOffAt: Date | null;
            fxRateId: string | null;
            title: string;
            description: string | null;
            termsConditions: string | null;
            notes: string | null;
            internalNotes: string | null;
            metadata: unknown;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Get invoice by ID with full details
     */
    getInvoiceById(id: string): Promise<any>;
    /**
     * Create new invoice
     */
    createInvoice(data: CreateInvoice): Promise<any>;
    /**
     * Update invoice
     */
    updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice | null>;
    /**
     * Update invoice status
     */
    updateInvoiceStatus(id: string, transition: InvoiceStatusTransition): Promise<Invoice | null>;
    /**
     * Mark invoice as paid
     */
    markInvoicePaid(id: string, paymentData: MarkInvoicePaid): Promise<Invoice | null>;
    /**
     * Void invoice
     */
    voidInvoice(id: string, _voidData: VoidInvoice): Promise<Invoice | null>;
}
//# sourceMappingURL=service.d.ts.map