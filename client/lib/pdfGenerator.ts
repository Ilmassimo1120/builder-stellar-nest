// PDF Generation utility for Smart Quoting Engine
// This implementation uses browser's print functionality as a fallback
// In production, you'd integrate with a PDF library like jsPDF or PDFKit

import { Quote } from './quoteTypes';

export interface PDFOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTerms?: boolean;
  includeSpecifications?: boolean;
  watermark?: string;
}

class PDFGenerator {
  private defaultOptions: PDFOptions = {
    includeHeader: true,
    includeFooter: true,
    includeTerms: true,
    includeSpecifications: true,
  };

  async generateQuotePDF(quote: Quote, options: PDFOptions = {}): Promise<void> {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Create a new window with the quote content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow popups for this site.');
      }

      // Generate HTML content for PDF
      const htmlContent = this.generateQuoteHTML(quote, finalOptions);
      
      // Write content to new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  private generateQuoteHTML(quote: Quote, options: PDFOptions): string {
    const styles = this.getPDFStyles();
    const header = options.includeHeader ? this.generateHeader(quote) : '';
    const footer = options.includeFooter ? this.generateFooter(quote) : '';
    const content = this.generateContent(quote, options);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Quote ${quote.quoteNumber} - ${quote.clientInfo.company}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
          <div class="page">
            ${header}
            ${content}
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  private getPDFStyles(): string {
    return `
      @page {
        margin: 20mm;
        size: A4;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
      }
      
      .page {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        position: relative;
      }
      
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        color: rgba(0, 0, 0, 0.1);
        z-index: 0;
        pointer-events: none;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-name {
        font-size: 24px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .company-tagline {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 16px;
      }
      
      .quote-info {
        text-align: right;
        flex: 1;
      }
      
      .quote-title {
        font-size: 28px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .quote-number {
        font-size: 16px;
        color: #6b7280;
        margin-bottom: 4px;
      }
      
      .quote-date {
        font-size: 14px;
        color: #6b7280;
      }
      
      .client-section {
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 12px;
        padding-bottom: 4px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      
      .client-details p {
        margin-bottom: 4px;
      }
      
      .project-section {
        margin-bottom: 30px;
      }
      
      .project-title {
        font-size: 18px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .project-description {
        color: #6b7280;
        line-height: 1.5;
      }
      
      .items-section {
        margin-bottom: 30px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      
      .items-table th,
      .items-table td {
        padding: 12px 8px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .items-table th {
        background-color: #f9fafb;
        font-weight: bold;
        color: #374151;
        border-bottom: 2px solid #d1d5db;
      }
      
      .items-table .text-right {
        text-align: right;
      }
      
      .items-table .text-center {
        text-align: center;
      }
      
      .item-name {
        font-weight: 600;
        color: #1f2937;
      }
      
      .item-description {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        line-height: 1.3;
      }
      
      .item-specs {
        font-size: 10px;
        color: #9ca3af;
        margin-top: 4px;
      }
      
      .totals-section {
        margin-top: 30px;
        display: flex;
        justify-content: flex-end;
      }
      
      .totals-table {
        width: 300px;
        border-collapse: collapse;
      }
      
      .totals-table td {
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .totals-table .total-row td {
        border-top: 2px solid #374151;
        border-bottom: 2px solid #374151;
        font-weight: bold;
        font-size: 14px;
        padding: 12px 0;
      }
      
      .terms-section {
        margin-top: 40px;
        page-break-inside: avoid;
      }
      
      .terms-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .terms-item {
        margin-bottom: 12px;
      }
      
      .terms-label {
        font-weight: bold;
        color: #374151;
        margin-bottom: 4px;
      }
      
      .terms-content {
        color: #6b7280;
        font-size: 11px;
        line-height: 1.4;
        white-space: pre-line;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: #6b7280;
        font-size: 10px;
      }
      
      .badge {
        display: inline-block;
        padding: 2px 8px;
        background-color: #f3f4f6;
        color: #374151;
        border-radius: 4px;
        font-size: 10px;
        margin-left: 8px;
      }
      
      @media print {
        body {
          font-size: 11px;
        }
        
        .page {
          margin: 0;
          box-shadow: none;
        }
        
        .no-print {
          display: none;
        }
        
        .page-break {
          page-break-before: always;
        }
      }
    `;
  }

  private generateHeader(quote: Quote): string {
    return `
      <div class="header">
        <div class="company-info">
          <div class="company-name">ChargeSource</div>
          <div class="company-tagline">EV Infrastructure Solutions</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
            Email: hello@chargesource.com.au<br>
            Phone: 1300 CHARGE<br>
            Web: www.chargesource.com.au
          </div>
        </div>
        <div class="quote-info">
          <div class="quote-title">QUOTATION</div>
          <div class="quote-number">Quote #${quote.quoteNumber}</div>
          <div class="quote-date">Date: ${new Date().toLocaleDateString()}</div>
          <div class="quote-date">Valid until: ${new Date(quote.validUntil).toLocaleDateString()}</div>
        </div>
      </div>
    `;
  }

  private generateContent(quote: Quote, options: PDFOptions): string {
    let content = '';

    // Client Information
    content += `
      <div class="client-section">
        <div class="section-title">Bill To</div>
        <div class="client-info">
          <div class="client-details">
            <p><strong>${quote.clientInfo.company || quote.clientInfo.name}</strong></p>
            <p>${quote.clientInfo.contactPerson}</p>
            <p>${quote.clientInfo.email}</p>
            <p>${quote.clientInfo.phone}</p>
          </div>
          <div class="client-details">
            ${quote.clientInfo.address ? `<p style="white-space: pre-line;">${quote.clientInfo.address}</p>` : ''}
            ${quote.clientInfo.abn ? `<p>ABN: ${quote.clientInfo.abn}</p>` : ''}
          </div>
        </div>
      </div>
    `;

    // Project Information
    if (quote.title || quote.description) {
      content += `
        <div class="project-section">
          <div class="section-title">Project Details</div>
          ${quote.title ? `<div class="project-title">${quote.title}</div>` : ''}
          ${quote.description ? `<div class="project-description">${quote.description}</div>` : ''}
        </div>
      `;
    }

    // Line Items
    if (quote.lineItems.length > 0) {
      content += `
        <div class="items-section">
          <div class="section-title">Quote Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-center" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 20%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
      `;

      quote.lineItems.forEach(item => {
        content += `
          <tr>
            <td>
              <div class="item-name">${item.name}</div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
              ${options.includeSpecifications && item.specifications ? this.generateSpecifications(item.specifications) : ''}
              ${item.isOptional ? '<span class="badge">Optional</span>' : ''}
            </td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">$${item.unitPrice.toLocaleString()}</td>
            <td class="text-right">$${item.totalPrice.toLocaleString()}</td>
          </tr>
        `;
      });

      content += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Quote Totals
    content += `
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">$${quote.totals.subtotal.toLocaleString()}</td>
          </tr>
    `;

    if (quote.totals.discount > 0) {
      content += `
        <tr>
          <td>Discount:</td>
          <td class="text-right" style="color: #059669;">-$${quote.totals.discount.toLocaleString()}</td>
        </tr>
      `;
    }

    content += `
          <tr>
            <td>GST (10%):</td>
            <td class="text-right">$${quote.totals.gst.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">$${quote.totals.total.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;

    // Terms & Conditions
    if (options.includeTerms) {
      content += `
        <div class="terms-section">
          <div class="section-title">Terms & Conditions</div>
          <div class="terms-grid">
            <div class="terms-item">
              <div class="terms-label">Payment Terms</div>
              <div class="terms-content">${quote.settings.paymentTerms}</div>
            </div>
            <div class="terms-item">
              <div class="terms-label">Warranty</div>
              <div class="terms-content">${quote.settings.warranty}</div>
            </div>
            <div class="terms-item">
              <div class="terms-label">Delivery Terms</div>
              <div class="terms-content">${quote.settings.deliveryTerms}</div>
            </div>
            <div class="terms-item">
              <div class="terms-label">Quote Validity</div>
              <div class="terms-content">${quote.settings.validityDays} days from date of issue</div>
            </div>
          </div>
      `;

      if (quote.settings.terms) {
        content += `
          <div class="terms-item">
            <div class="terms-label">General Terms</div>
            <div class="terms-content">${quote.settings.terms}</div>
          </div>
        `;
      }

      if (quote.settings.notes) {
        content += `
          <div class="terms-item">
            <div class="terms-label">Additional Notes</div>
            <div class="terms-content">${quote.settings.notes}</div>
          </div>
        `;
      }

      content += `</div>`;
    }

    return content;
  }

  private generateSpecifications(specs: Record<string, any>): string {
    const specItems = Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
    
    return `<div class="item-specs">${specItems}</div>`;
  }

  private generateFooter(quote: Quote): string {
    return `
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This quote was generated by ChargeSource Smart Quoting Engine</p>
        <p>For questions about this quote, please contact us at hello@chargesource.com.au</p>
      </div>
    `;
  }

  // Alternative method using jsPDF (if library is available)
  async generateAdvancedPDF(quote: Quote, options: PDFOptions = {}): Promise<void> {
    // This would use a library like jsPDF for more advanced PDF generation
    // Implementation would depend on the chosen PDF library
    throw new Error('Advanced PDF generation not implemented. Please use generateQuotePDF() instead.');
  }

  // Email integration for sending quotes
  generateEmailShareLink(quote: Quote): string {
    const baseUrl = window.location.origin;
    const clientPortalUrl = `${baseUrl}/client/quote/${quote.id}?token=${this.generateAccessToken(quote)}`;
    
    const subject = encodeURIComponent(`Quote ${quote.quoteNumber} - ${quote.title || 'EV Charging Project'}`);
    const body = encodeURIComponent(`
Dear ${quote.clientInfo.contactPerson},

Please find your quote for ${quote.title || 'EV Charging Project'} at the link below:

${clientPortalUrl}

Quote Details:
- Quote Number: ${quote.quoteNumber}
- Total Amount: $${quote.totals.total.toLocaleString()} (GST included)
- Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}

You can view the full quote details, download a PDF, and accept or decline the quote through the secure client portal.

If you have any questions about this quote, please don't hesitate to contact us.

Best regards,
The ChargeSource Team
hello@chargesource.com.au
1300 CHARGE
    `);

    return `mailto:${quote.clientInfo.email}?subject=${subject}&body=${body}`;
  }

  private generateAccessToken(quote: Quote): string {
    // In a real implementation, this would generate a secure, time-limited access token
    // For now, we'll use a simple token based on quote ID and creation date
    const tokenData = `${quote.id}-${quote.createdAt}`;
    return btoa(tokenData).replace(/[/+=]/g, '');
  }
}

export const pdfGenerator = new PDFGenerator();
export default pdfGenerator;
