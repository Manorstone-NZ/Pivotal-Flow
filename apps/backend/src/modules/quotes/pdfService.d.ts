export interface QuotePDFData {
    quote: any;
    organization: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
    };
}
export declare class QuotePDFService {
    private generateQuoteHTML;
    generatePDF(data: QuotePDFData): Promise<Buffer>;
}
//# sourceMappingURL=pdfService.d.ts.map