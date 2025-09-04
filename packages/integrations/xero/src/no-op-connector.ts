/**
 * No-Op Xero Connector
 * Records intended operations to audit logs only
 */

import type { 
  XeroConnector,
  XeroContact,
  XeroInvoice,
  XeroPayment,
  XeroAccountCode,
  XeroTaxRate,
  XeroCurrency,
  XeroOperationResult,
  XeroHealthStatus,
  XeroConfig
} from './types.js';
import { generateIdempotencyKey } from './mapping.js';

/**
 * No-op implementation of Xero connector
 * Records all operations to audit logs but performs no actual Xero API calls
 */
export class NoOpXeroConnector implements XeroConnector {
  private config: XeroConfig;
  private auditLogger: any; // Will be injected

  constructor(config: XeroConfig, auditLogger: any) {
    this.config = config;
    this.auditLogger = auditLogger;
  }

  /**
   * Push invoice to Xero (no-op)
   */
  async pushInvoice(invoice: XeroInvoice): Promise<XeroOperationResult> {
    const operationId = generateIdempotencyKey('push_invoice', invoice.invoiceId, 'org_id');
    
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_push_invoice',
      resource: 'xero_integration',
      resourceId: operationId,
      details: {
        operation: 'push_invoice',
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        contactName: invoice.contact.name,
        total: invoice.total,
        currency: invoice.currencyCode,
        status: 'NO_OP_MODE',
        message: 'Invoice push recorded but not sent to Xero (no-op mode)',
      },
    });

    return {
      success: true,
      operationId,
      externalId: `noop_${invoice.invoiceId}`,
      warnings: ['Operation recorded in no-op mode - no actual Xero API call made'],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Push payment to Xero (no-op)
   */
  async pushPayment(payment: XeroPayment): Promise<XeroOperationResult> {
    const operationId = generateIdempotencyKey('push_payment', payment.paymentId, 'org_id');
    
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_push_payment',
      resource: 'xero_integration',
      resourceId: operationId,
      details: {
        operation: 'push_payment',
        paymentId: payment.paymentId,
        invoiceId: payment.invoice.invoiceId,
        amount: payment.amount,
        date: payment.date,
        status: 'NO_OP_MODE',
        message: 'Payment push recorded but not sent to Xero (no-op mode)',
      },
    });

    return {
      success: true,
      operationId,
      externalId: `noop_${payment.paymentId}`,
      warnings: ['Operation recorded in no-op mode - no actual Xero API call made'],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Push contact to Xero (no-op)
   */
  async pushContact(contact: XeroContact): Promise<XeroOperationResult> {
    const operationId = generateIdempotencyKey('push_contact', contact.contactId, 'org_id');
    
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_push_contact',
      resource: 'xero_integration',
      resourceId: operationId,
      details: {
        operation: 'push_contact',
        contactId: contact.contactId,
        name: contact.name,
        email: contact.emailAddress,
        status: 'NO_OP_MODE',
        message: 'Contact push recorded but not sent to Xero (no-op mode)',
      },
    });

    return {
      success: true,
      operationId,
      externalId: `noop_${contact.contactId}`,
      warnings: ['Operation recorded in no-op mode - no actual Xero API call made'],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Pull contact from Xero (no-op)
   */
  async pullContact(contactId: string): Promise<XeroContact> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_contact',
      resource: 'xero_integration',
      details: {
        operation: 'pull_contact',
        contactId,
        status: 'NO_OP_MODE',
        message: 'Contact pull recorded but no actual Xero API call made',
      },
    });

    // Return mock contact data
    return {
      contactId,
      name: 'Mock Contact',
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john.doe@example.com',
      phoneNumber: '+64 21 123 456',
      address: {
        addressType: 'POBOX',
        addressLine1: '123 Main St',
        city: 'Auckland',
        region: 'Auckland',
        postalCode: '1010',
        country: 'NZ',
      },
      taxNumber: '123456789',
      accountNumber: 'CUST001',
      isCustomer: true,
      isSupplier: false,
      status: 'ACTIVE',
      updatedDateUTC: new Date().toISOString(),
    };
  }

  /**
   * Pull account codes from Xero (no-op)
   */
  async pullAccountCodes(): Promise<XeroAccountCode[]> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_account_codes',
      resource: 'xero_integration',
      details: {
        operation: 'pull_account_codes',
        status: 'NO_OP_MODE',
        message: 'Account codes pull recorded but no actual Xero API call made',
      },
    });

    // Return mock account codes
    return [
      {
        accountId: '1',
        code: '200',
        name: 'Sales',
        type: 'REVENUE',
        status: 'ACTIVE',
        taxType: 'OUTPUT',
      },
      {
        accountId: '2',
        code: '090',
        name: 'Bank Account',
        type: 'ASSET',
        status: 'ACTIVE',
        enablePaymentsToAccount: true,
      },
      {
        accountId: '3',
        code: '310',
        name: 'GST',
        type: 'LIABILITY',
        status: 'ACTIVE',
        taxType: 'OUTPUT',
      },
    ];
  }

  /**
   * Pull tax rates from Xero (no-op)
   */
  async pullTaxRates(): Promise<XeroTaxRate[]> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_tax_rates',
      resource: 'xero_integration',
      details: {
        operation: 'pull_tax_rates',
        status: 'NO_OP_MODE',
        message: 'Tax rates pull recorded but no actual Xero API call made',
      },
    });

    // Return mock NZ tax rates
    return [
      {
        taxType: 'OUTPUT',
        name: 'GST on Sales',
        taxComponents: [
          {
            name: 'GST',
            rate: 15.0,
            isCompound: false,
          },
        ],
        status: 'ACTIVE',
        reportTaxType: 'OUTPUT',
        canApplyToAssets: false,
        canApplyToEquity: false,
        canApplyToExpenses: false,
        canApplyToLiabilities: false,
        canApplyToRevenue: true,
      },
      {
        taxType: 'ZERO',
        name: 'Zero Rate',
        taxComponents: [
          {
            name: 'Zero Rate',
            rate: 0.0,
            isCompound: false,
          },
        ],
        status: 'ACTIVE',
        reportTaxType: 'ZERO',
        canApplyToAssets: false,
        canApplyToEquity: false,
        canApplyToExpenses: false,
        canApplyToLiabilities: false,
        canApplyToRevenue: true,
      },
    ];
  }

  /**
   * Pull currencies from Xero (no-op)
   */
  async pullCurrencies(): Promise<XeroCurrency[]> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_currencies',
      resource: 'xero_integration',
      details: {
        operation: 'pull_currencies',
        status: 'NO_OP_MODE',
        message: 'Currencies pull recorded but no actual Xero API call made',
      },
    });

    // Return mock currencies
    return [
      { code: 'NZD', description: 'New Zealand Dollar' },
      { code: 'USD', description: 'US Dollar' },
      { code: 'EUR', description: 'Euro' },
      { code: 'AUD', description: 'Australian Dollar' },
    ];
  }

  /**
   * Pull invoice from Xero (no-op)
   */
  async pullInvoice(invoiceId: string): Promise<XeroInvoice> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_invoice',
      resource: 'xero_integration',
      details: {
        operation: 'pull_invoice',
        invoiceId,
        status: 'NO_OP_MODE',
        message: 'Invoice pull recorded but no actual Xero API call made',
      },
    });

    // Return mock invoice
    return {
      invoiceId,
      invoiceNumber: 'INV-001',
      contact: {
        contactId: 'contact_001',
        name: 'Mock Customer',
      },
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'AUTHORISED',
      lineAmountTypes: 'Exclusive',
      lineItems: [
        {
          lineItemId: 'line_001',
          description: 'Consulting Services',
          quantity: 10,
          unitAmount: 100.0,
          lineAmount: 1000.0,
          accountCode: '200',
          taxType: 'OUTPUT',
          taxAmount: 150.0,
        },
      ],
      subtotal: 1000.0,
      totalTax: 150.0,
      total: 1150.0,
      currencyCode: 'NZD',
      hasAttachments: false,
      hasErrors: false,
    };
  }

  /**
   * Pull payment from Xero (no-op)
   */
  async pullPayment(paymentId: string): Promise<XeroPayment> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_pull_payment',
      resource: 'xero_integration',
      details: {
        operation: 'pull_payment',
        paymentId,
        status: 'NO_OP_MODE',
        message: 'Payment pull recorded but no actual Xero API call made',
      },
    });

    // Return mock payment
    return {
      paymentId,
      invoice: {
        invoiceId: 'invoice_001',
        invoiceNumber: 'INV-001',
      },
      account: {
        accountId: '1',
        code: '090',
        name: 'Bank Account',
      },
      date: new Date().toISOString().split('T')[0],
      amount: 1150.0,
      reference: 'Payment for INV-001',
      status: 'AUTHORISED',
      paymentType: 'ACCRECPAYMENT',
      updatedDateUTC: new Date().toISOString(),
    };
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<XeroHealthStatus> {
    const hasClientId = !!this.config.clientId;
    const hasClientSecret = !!this.config.clientSecret;
    const hasRedirectUri = !!this.config.redirectUri;
    const hasTenantId = !!this.config.tenantId;

    const allConfigPresent = hasClientId && hasClientSecret && hasRedirectUri && hasTenantId;

    return {
      enabled: allConfigPresent,
      status: allConfigPresent ? 'HEALTHY' : 'DISABLED',
      lastSync: allConfigPresent ? new Date().toISOString() : undefined,
      errors: allConfigPresent ? [] : ['Xero integration not configured'],
      configStatus: {
        clientId: hasClientId,
        clientSecret: hasClientSecret,
        redirectUri: hasRedirectUri,
        tenantId: hasTenantId,
      },
    };
  }

  /**
   * Handle webhook (no-op)
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'system', // System user for webhooks
      action: 'xero_webhook_received',
      resource: 'xero_integration',
      details: {
        operation: 'handle_webhook',
        payload: JSON.stringify(payload),
        signature,
        status: 'NO_OP_MODE',
        message: 'Webhook received but not processed (no-op mode)',
      },
    });
  }

  /**
   * Get authorization URL (no-op)
   */
  getAuthorizationUrl(): string {
    return `${this.config.redirectUri}?code=mock_code&state=mock_state`;
  }

  /**
   * Handle OAuth callback (no-op)
   */
  async handleCallback(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    await this.auditLogger.logEvent({
      organizationId: 'org_id', // Will be injected
      userId: 'user_id', // Will be injected
      action: 'xero_oauth_callback',
      resource: 'xero_integration',
      details: {
        operation: 'handle_callback',
        code,
        state,
        status: 'NO_OP_MODE',
        message: 'OAuth callback recorded but not processed (no-op mode)',
      },
    });

    return {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    };
  }
}
