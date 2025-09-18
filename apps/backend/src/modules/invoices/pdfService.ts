import puppeteer from 'puppeteer';
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

export class InvoicePDFService {
  private generateInvoiceHTML(data: InvoicePDFData): string {
    const { invoice, lineItems, payments, organization } = data;
    
    // Format currency
    const formatCurrency = (amount: number, currency = 'NZD') => {
      return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    };

    // Format date
    const formatDate = (date: string | Date | null) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-NZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .invoice {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .company-details {
            color: #666;
            line-height: 1.5;
        }
        
        .invoice-title {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title h1 {
            font-size: 32px;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .invoice-number {
            font-size: 18px;
            color: #666;
            margin-bottom: 4px;
        }
        
        .invoice-date {
            color: #666;
        }
        
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .bill-to, .invoice-info {
            flex: 1;
            margin-right: 20px;
        }
        
        .bill-to h3, .invoice-info h3 {
            font-size: 14px;
            color: #2563eb;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .customer-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        
        .info-value {
            color: #6b7280;
        }
        
        .line-items {
            margin-bottom: 30px;
        }
        
        .line-items h3 {
            font-size: 16px;
            color: #2563eb;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 30px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row.final {
            border-top: 2px solid #2563eb;
            border-bottom: 2px solid #2563eb;
            font-weight: bold;
            font-size: 16px;
            color: #2563eb;
            margin-top: 10px;
            padding: 12px 0;
        }
        
        .payment-status {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-overdue {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .payments {
            margin-bottom: 30px;
        }
        
        .payments h3 {
            font-size: 16px;
            color: #2563eb;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
        }
        
        .terms {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 6px;
        }
        
        .terms h4 {
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        @media print {
            .invoice {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">${organization.name}</div>
                <div class="company-details">
                    ${organization.address ? `${organization.address}<br>` : ''}
                    ${organization.phone ? `Phone: ${organization.phone}<br>` : ''}
                    ${organization.email ? `Email: ${organization.email}<br>` : ''}
                    ${organization.website ? `Web: ${organization.website}` : ''}
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">${invoice.invoiceNumber}</div>
                <div class="invoice-date">Date: ${formatDate(invoice.createdAt)}</div>
            </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="bill-to">
                <h3>Bill To</h3>
                <div class="customer-info">
                    <strong>${invoice.customer.name}</strong><br>
                    ${invoice.customer.email || ''}<br>
                    ${invoice.customer.address || ''}
                </div>
            </div>
            <div class="invoice-info">
                <h3>Invoice Information</h3>
                <div class="info-row">
                    <span class="info-label">Invoice Number:</span>
                    <span class="info-value">${invoice.invoiceNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Issue Date:</span>
                    <span class="info-value">${formatDate(invoice.issuedAt || invoice.createdAt)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Due Date:</span>
                    <span class="info-value">${formatDate(invoice.dueAt)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Currency:</span>
                    <span class="info-value">${invoice.currency}</span>
                </div>
            </div>
        </div>

        <!-- Line Items -->
        ${lineItems.length > 0 ? `
        <div class="line-items">
            <h3>Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Tax</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItems.map(item => `
                    <tr>
                        <td>
                            <strong>${item.description}</strong>
                            ${item.notes ? `<br><small style="color: #6b7280;">${item.notes}</small>` : ''}
                        </td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.unitPrice, invoice.currency)}</td>
                        <td class="text-right">${formatCurrency(item.taxAmount, invoice.currency)}</td>
                        <td class="text-right">${formatCurrency(item.totalAmount, invoice.currency)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Totals -->
        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div class="total-row">
                <span>Tax:</span>
                <span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
            ${invoice.discountAmount > 0 ? `
            <div class="total-row">
                <span>Discount:</span>
                <span>-${formatCurrency(invoice.discountAmount, invoice.currency)}</span>
            </div>
            ` : ''}
            <div class="total-row final">
                <span>Total Amount:</span>
                <span>${formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
        </div>

        <!-- Payment Status -->
        <div class="payment-status">
            <span class="status-badge ${invoice.status === 'paid' ? 'status-paid' : invoice.status === 'overdue' ? 'status-overdue' : 'status-pending'}">
                ${invoice.status.toUpperCase()}
            </span>
        </div>

        <!-- Payment History -->
        ${payments.length > 0 ? `
        <div class="payments">
            <h3>Payment History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                    <tr>
                        <td>${formatDate(payment.paymentDate)}</td>
                        <td>${payment.paymentMethod}</td>
                        <td>${payment.reference || '-'}</td>
                        <td class="text-right">${formatCurrency(payment.amount, invoice.currency)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Terms & Conditions -->
        ${invoice.termsConditions ? `
        <div class="terms">
            <h4>Terms & Conditions</h4>
            <p>${invoice.termsConditions}</p>
        </div>
        ` : ''}

        ${invoice.notes ? `
        <div class="terms">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString('en-NZ')}</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async generatePDF(data: InvoicePDFData): Promise<Buffer> {
    let browser;
    
    try {
      // Launch browser with minimal configuration
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
      });

      const page = await browser.newPage();
      
      // Set page format for invoice
      await page.setViewport({ width: 1200, height: 1600 });
      
      // Generate HTML content
      const htmlContent = this.generateInvoiceHTML(data);
      
      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
