/**
 * Xero Integration Package
 * Connector contract and type definitions for Xero integration
 */
export interface XeroContact {
    contactId: string;
    name: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    address?: {
        addressType: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };
    taxNumber?: string;
    accountNumber?: string;
    isCustomer: boolean;
    isSupplier: boolean;
    status: 'ACTIVE' | 'ARCHIVED';
    updatedDateUTC: string;
}
export interface XeroInvoice {
    invoiceId: string;
    invoiceNumber: string;
    reference?: string;
    contact: {
        contactId: string;
        name: string;
    };
    date: string;
    dueDate: string;
    status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
    lineAmountTypes: 'Exclusive' | 'Inclusive' | 'NoTax';
    lineItems: XeroInvoiceLineItem[];
    subtotal: number;
    totalTax: number;
    total: number;
    currencyCode: string;
    currencyRate?: number;
    brandingThemeId?: string;
    hasAttachments: boolean;
    hasErrors: boolean;
    validationErrors?: string[];
    warnings?: string[];
}
export interface XeroInvoiceLineItem {
    lineItemId: string;
    description: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
    accountCode: string;
    taxType: string;
    taxAmount: number;
    tracking?: {
        trackingCategoryId: string;
        name: string;
        option: string;
    }[];
}
export interface XeroPayment {
    paymentId: string;
    invoice: {
        invoiceId: string;
        invoiceNumber: string;
    };
    account: {
        accountId: string;
        code: string;
        name: string;
    };
    date: string;
    amount: number;
    currencyRate?: number;
    reference?: string;
    status: 'AUTHORISED' | 'DELETED';
    paymentType: 'ACCRECPAYMENT' | 'ACCPAYPAYMENT';
    updatedDateUTC: string;
}
export interface XeroAccountCode {
    accountId: string;
    code: string;
    name: string;
    type: 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'EQUITY';
    status: 'ACTIVE' | 'ARCHIVED';
    taxType?: string;
    enablePaymentsToAccount?: boolean;
    class?: string;
    reportingCode?: string;
    reportingCodeName?: string;
}
export interface XeroTaxRate {
    taxType: string;
    name: string;
    taxComponents: {
        name: string;
        rate: number;
        isCompound: boolean;
    }[];
    status: 'ACTIVE' | 'DELETED';
    reportTaxType: string;
    canApplyToAssets: boolean;
    canApplyToEquity: boolean;
    canApplyToExpenses: boolean;
    canApplyToLiabilities: boolean;
    canApplyToRevenue: boolean;
}
export interface XeroCurrency {
    code: string;
    description: string;
}
export interface XeroOperationResult {
    success: boolean;
    operationId: string;
    externalId?: string;
    errors?: string[];
    warnings?: string[];
    timestamp: string;
}
export interface XeroHealthStatus {
    enabled: boolean;
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'DISABLED';
    lastSync?: string;
    errors?: string[];
    configStatus: {
        clientId: boolean;
        clientSecret: boolean;
        redirectUri: boolean;
        tenantId: boolean;
    };
}
export interface XeroConnector {
    pushInvoice(invoice: XeroInvoice): Promise<XeroOperationResult>;
    pushPayment(payment: XeroPayment): Promise<XeroOperationResult>;
    pushContact(contact: XeroContact): Promise<XeroOperationResult>;
    pullContact(contactId: string): Promise<XeroContact>;
    pullAccountCodes(): Promise<XeroAccountCode[]>;
    pullTaxRates(): Promise<XeroTaxRate[]>;
    pullCurrencies(): Promise<XeroCurrency[]>;
    pullInvoice(invoiceId: string): Promise<XeroInvoice>;
    pullPayment(paymentId: string): Promise<XeroPayment>;
    getHealth(): Promise<XeroHealthStatus>;
    handleWebhook(payload: any, signature: string): Promise<void>;
    getAuthorizationUrl(): string;
    handleCallback(code: string, state: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
export interface XeroConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    tenantId?: string;
    scopes: string[];
    webhookKey?: string;
}
export interface NZTaxMapping {
    gstRate: number;
    gstTaxType: string;
    zeroRateTaxType: string;
    exemptTaxType: string;
    importTaxType: string;
}
export interface XeroIdempotencyKey {
    operation: string;
    resourceId: string;
    organizationId: string;
    timestamp: string;
}
export interface XeroWebhookEvent {
    events: {
        resourceId: string;
        resourceUri: string;
        resourceType: string;
        eventDateUtc: string;
        eventType: string;
        sequence: number;
    }[];
    firstEventSequence: number;
    lastEventSequence: number;
    entropy: string;
}
//# sourceMappingURL=types.d.ts.map