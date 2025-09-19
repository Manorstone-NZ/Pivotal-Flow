import type { Invoice, InvoiceLineItem, Payment } from './typeboxSchemas.js';
export interface InvoicePDFData {
    invoice: Invoice;
    lineItems: InvoiceLineItem[];
    payments: Payment[];
    organization: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
    };
}
export declare class InvoicePDFService {
    private generateInvoiceHTML;
    generatePDF(data: InvoicePDFData): Promise<Buffer>;
}
//# sourceMappingURL=pdfService.d.ts.map