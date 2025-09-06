/**
 * Xero No-Op Connector
 * Provides stub implementations for Xero integration methods
 * Records intended operations to audit logs
 */
export interface XeroInvoice {
    id: string;
    invoiceNumber: string;
    total: number;
    currency: string;
    status: string;
}
export interface XeroPayment {
    id: string;
    amount: number;
    currency: string;
    method: string;
    date: string;
}
export interface XeroContact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}
export interface XeroAccountCode {
    code: string;
    name: string;
    type: string;
}
export declare class NoOpXeroConnector {
    pushInvoice(invoice: XeroInvoice): Promise<{
        success: boolean;
        xeroId?: string;
    }>;
    pushPayment(payment: XeroPayment): Promise<{
        success: boolean;
        xeroId?: string;
    }>;
    pullContact(contactId: string): Promise<XeroContact | null>;
    pullAccountCodes(): Promise<XeroAccountCode[]>;
}
//# sourceMappingURL=no-op-connector.d.ts.map