/**
 * Xero No-Op Connector
 * Provides stub implementations for Xero integration methods
 * Records intended operations to audit logs
 */

// Note: Using console.log for no-op connector instead of audit logging
// to avoid dependency on shared package audit functions

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

export class NoOpXeroConnector {
  async pushInvoice(invoice: XeroInvoice): Promise<{ success: boolean; xeroId?: string }> {
    console.log('Xero No-Op: pushInvoice', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
    });
    
    return { success: true, xeroId: `xero_${invoice.id}` };
  }

  async pushPayment(payment: XeroPayment): Promise<{ success: boolean; xeroId?: string }> {
    console.log('Xero No-Op: pushPayment', {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      date: payment.date,
    });
    
    return { success: true, xeroId: `xero_${payment.id}` };
  }

  async pullContact(contactId: string): Promise<XeroContact | null> {
    console.log('Xero No-Op: pullContact', { contactId });
    
    return {
      id: contactId,
      name: `Xero Contact ${contactId}`,
      email: `contact${contactId}@example.com`,
    };
  }

  async pullAccountCodes(): Promise<XeroAccountCode[]> {
    console.log('Xero No-Op: pullAccountCodes');
    
    return [
      { code: '200', name: 'Sales', type: 'Revenue' },
      { code: '400', name: 'Cost of Sales', type: 'Expense' },
      { code: '800', name: 'Administration', type: 'Expense' },
    ];
  }
}