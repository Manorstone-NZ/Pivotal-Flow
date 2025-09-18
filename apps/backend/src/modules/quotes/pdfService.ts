import puppeteer from 'puppeteer';

export interface QuotePDFData {
  quote: any; // Using any for now since we don't have the full Quote type
  organization: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export class QuotePDFService {
  private generateQuoteHTML(data: QuotePDFData): string {
    const { quote, organization } = data;
    
    // Format currency
    const formatCurrency = (amount: number, currency = 'NZD') => {
      return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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

    const currency = quote.metadata?.currency || 'NZD';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quote ${quote.quoteNumber}</title>
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
        
        .quote {
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
        
        .quote-title {
            text-align: right;
            flex: 1;
        }
        
        .quote-title h1 {
            font-size: 32px;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .quote-number {
            font-size: 18px;
            color: #666;
            margin-bottom: 4px;
        }
        
        .quote-date {
            color: #666;
        }
        
        .quote-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .quote-info {
            flex: 1;
            margin-right: 20px;
        }
        
        .quote-info h3 {
            font-size: 14px;
            color: #2563eb;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-section {
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
        
        .status-section {
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
        
        .status-draft {
            background: #f3f4f6;
            color: #374151;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-approved {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
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
            .quote {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="quote">
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
            <div class="quote-title">
                <h1>QUOTE</h1>
                <div class="quote-number">${quote.quoteNumber}</div>
                <div class="quote-date">Date: ${formatDate(quote.createdAt)}</div>
            </div>
        </div>

        <!-- Quote Details -->
        <div class="quote-details">
            <div class="quote-info">
                <h3>Quote Information</h3>
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">Quote Number:</span>
                        <span class="info-value">${quote.quoteNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${formatDate(quote.createdAt)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Valid Until:</span>
                        <span class="info-value">${formatDate(quote.validUntil)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${quote.type}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Currency:</span>
                        <span class="info-value">${currency}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Description -->
        ${quote.description ? `
        <div class="quote-details">
            <div class="quote-info">
                <h3>Description</h3>
                <div class="info-section">
                    <p>${quote.description}</p>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Line Items -->
        ${quote.lineItems && quote.lineItems.length > 0 ? `
        <div class="line-items">
            <h3>Services & Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.lineItems.map((item: any) => `
                    <tr>
                        <td>
                            <strong>${item.description}</strong>
                            ${item.notes ? `<br><small style="color: #6b7280;">${item.notes}</small>` : ''}
                        </td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.unitPrice, currency)}</td>
                        <td class="text-right">${formatCurrency(item.totalPrice, currency)}</td>
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
                <span>${formatCurrency(quote.subtotal, currency)}</span>
            </div>
            ${quote.metadata?.discountAmount && parseFloat(quote.metadata.discountAmount) > 0 ? `
            <div class="total-row">
                <span>Discount (${quote.metadata.discountType === 'percentage' ? quote.metadata.discountValue + '%' : 'Fixed'}):</span>
                <span>-${formatCurrency(parseFloat(quote.metadata.discountAmount), currency)}</span>
            </div>
            ` : ''}
            <div class="total-row">
                <span>Tax (${quote.metadata?.taxRate ? (parseFloat(quote.metadata.taxRate) * 100).toFixed(1) + '%' : '15%'}):</span>
                <span>${formatCurrency(quote.taxAmount, currency)}</span>
            </div>
            <div class="total-row final">
                <span>Total Amount:</span>
                <span>${formatCurrency(quote.totalAmount, currency)}</span>
            </div>
        </div>

        <!-- Status -->
        <div class="status-section">
            <span class="status-badge status-${quote.status}">
                ${quote.status.toUpperCase()}
            </span>
        </div>

        <!-- Terms & Conditions -->
        ${quote.termsConditions ? `
        <div class="terms">
            <h4>Terms & Conditions</h4>
            <p>${quote.termsConditions}</p>
        </div>
        ` : ''}

        ${quote.notes ? `
        <div class="terms">
            <h4>Notes</h4>
            <p>${quote.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for considering our services!</p>
            <p>This quote is valid until ${quote.validUntil ? formatDate(quote.validUntil) : 'further notice'}.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-NZ')}</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async generatePDF(data: QuotePDFData): Promise<Buffer> {
    let browser;
    
    try {
      // Launch browser with minimal configuration using system Chromium
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
      });

      const page = await browser.newPage();
      
      // Set page format for quote
      await page.setViewport({ width: 1200, height: 1600 });
      
      // Generate HTML content
      const htmlContent = this.generateQuoteHTML(data);
      
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
      console.error('Quote PDF generation error:', error);
      throw new Error('Failed to generate quote PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
