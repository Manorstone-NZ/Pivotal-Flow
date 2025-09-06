/**
 * Xero No-Op Connector
 * Provides stub implementations for Xero integration methods
 * Records intended operations to audit logs
 */
export class NoOpXeroConnector {
    async pushInvoice(invoice) {
        console.log('Xero No-Op: pushInvoice', {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            currency: invoice.currency,
            status: invoice.status,
        });
        return { success: true, xeroId: `xero_${invoice.id}` };
    }
    async pushPayment(payment) {
        console.log('Xero No-Op: pushPayment', {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            date: payment.date,
        });
        return { success: true, xeroId: `xero_${payment.id}` };
    }
    async pullContact(contactId) {
        console.log('Xero No-Op: pullContact', { contactId });
        return {
            id: contactId,
            name: `Xero Contact ${contactId}`,
            email: `contact${contactId}@example.com`,
        };
    }
    async pullAccountCodes() {
        console.log('Xero No-Op: pullAccountCodes');
        return [
            { code: '200', name: 'Sales', type: 'Revenue' },
            { code: '400', name: 'Cost of Sales', type: 'Expense' },
            { code: '800', name: 'Administration', type: 'Expense' },
        ];
    }
}
//# sourceMappingURL=no-op-connector.js.map