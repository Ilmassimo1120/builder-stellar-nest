import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Quote } from "./quoteTypes";

export interface PDFOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTerms?: boolean;
  includeSpecifications?: boolean;
  watermark?: string;
  fileName?: string;
}

class PDFGenerator {
  private defaultOptions: PDFOptions = {
    includeHeader: true,
    includeFooter: true,
    includeTerms: true,
    includeSpecifications: true,
    fileName: undefined,
  };

  /**
   * Generate a client-side PDF using html2canvas + jsPDF.
   * Renders an offscreen HTML snapshot of the quote and converts it to an A4 PDF.
   */
  async generateQuotePDF(
    quote: Quote,
    options: PDFOptions = {},
  ): Promise<void> {
    const finalOptions = { ...this.defaultOptions, ...options };

    const htmlContent = this.generateQuoteHTML(quote, finalOptions);

    const container = document.createElement("div");
    container.setAttribute("id", "chargesource-pdf-temp");
    container.setAttribute(
      "style",
      "position:fixed;left:-10000px;top:0;width:1123px;padding:20px;background:white;",
    );
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      await this.waitForImages(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidthMm = pageWidth;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

      if (imgHeightMm <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm);
      } else {
        // Multi-page: slice canvas vertically per page height
        let remainingHeightPx = canvas.height;
        const pxPerMm = canvas.height / imgHeightMm; // pixels per mm for height
        let offsetY = 0;

        while (remainingHeightPx > 0) {
          const sliceHeightMm = Math.min(
            pageHeight,
            remainingHeightPx / pxPerMm,
          );
          const sliceHeightPx = Math.round(sliceHeightMm * pxPerMm);

          // Create temporary canvas to hold the slice
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeightPx;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              offsetY,
              canvas.width,
              sliceHeightPx,
              0,
              0,
              canvas.width,
              sliceHeightPx,
            );
            const sliceData = sliceCanvas.toDataURL("image/png");
            const sliceHeightMmActual =
              (sliceHeightPx * imgWidthMm) / canvas.width;

            pdf.addImage(
              sliceData,
              "PNG",
              0,
              0,
              imgWidthMm,
              sliceHeightMmActual,
            );
          }

          remainingHeightPx -= sliceHeightPx;
          offsetY += sliceHeightPx;

          if (remainingHeightPx > 0) pdf.addPage();
        }
      }

      const fileName =
        finalOptions.fileName || `quote-${quote.quoteNumber}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Client-side PDF generation failed:", err);
      throw err;
    } finally {
      container.remove();
    }
  }

  private waitForImages(container: HTMLElement): Promise<void> {
    const imgs = Array.from(
      container.querySelectorAll("img"),
    ) as HTMLImageElement[];
    if (imgs.length === 0) return Promise.resolve();

    return Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) return res();
            img.onload = () => res();
            img.onerror = () => res();
          }),
      ),
    ).then(() => undefined);
  }

  private generateQuoteHTML(quote: Quote, options: PDFOptions): string {
    const styles = this.getPDFStyles();
    const header = options.includeHeader ? this.generateHeader(quote) : "";
    const footer = options.includeFooter ? this.generateFooter(quote) : "";
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
          ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ""}
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
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; font-size:12px; color:#333; background:white; }
      .page { width: 1000px; max-width: 1000px; margin:0 auto; padding: 10px; background: white; }
      .header { display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin-bottom:12px }
      .company-name { font-weight:700; font-size:18px }
      .quote-title { font-weight:700; font-size:20px }
      .section-title { font-weight:700; margin-bottom:8px; }
      .items-table { width:100%; border-collapse: collapse; }
      .items-table th, .items-table td { border: 1px solid #e5e7eb; padding:6px; text-align:left }
      .totals-table { width:320px; float:right }
      .footer { margin-top:18px; border-top:1px solid #e5e7eb; padding-top:8px; text-align:center; font-size:11px }
      .watermark { position: absolute; opacity: 0.05; font-size:72px; transform: rotate(-45deg); left: 30%; top: 40%; }
      .badge { background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:10px }
    `;
  }

  private generateHeader(quote: Quote): string {
    return `
      <div class="header">
        <div>
          <div class="company-name">ChargeSource</div>
          <div style="font-size:11px;color:#6b7280">EV Infrastructure Solutions</div>
        </div>
        <div style="text-align:right">
          <div class="quote-title">QUOTATION</div>
          <div>Quote #${quote.quoteNumber}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Valid until: ${new Date(quote.validUntil).toLocaleDateString()}</div>
        </div>
      </div>
    `;
  }

  private generateContent(quote: Quote, options: PDFOptions): string {
    let content = "";

    content += `<div><div class="section-title">Bill To</div><div>${quote.clientInfo.company || quote.clientInfo.name}</div><div>${quote.clientInfo.contactPerson}</div><div>${quote.clientInfo.email}</div><div>${quote.clientInfo.phone}</div></div>`;

    if (quote.title || quote.description) {
      content += `<div style="margin-top:12px"><div class="section-title">Project Details</div>${quote.title ? `<div style="font-weight:600">${quote.title}</div>` : ""}${quote.description ? `<div>${quote.description}</div>` : ""}</div>`;
    }

    if (quote.lineItems.length > 0) {
      content += `<div style="margin-top:12px"><div class="section-title">Quote Items</div><table class="items-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>`;
      for (const item of quote.lineItems) {
        content += `<tr><td><div style="font-weight:600">${item.name}</div>${item.description ? `<div style="font-size:11px;color:#6b7280">${item.description}</div>` : ""}${options.includeSpecifications && item.specifications ? `<div style="font-size:10px;color:#9ca3af">${this.generateSpecifications(item.specifications)}</div>` : ""}${item.isOptional ? `<div class="badge">Optional</div>` : ""}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">$${item.unitPrice.toLocaleString()}</td><td style="text-align:right">$${item.totalPrice.toLocaleString()}</td></tr>`;
      }
      content += `</tbody></table></div>`;
    }

    content += `<div style="margin-top:8px;float:right;width:320px"><table class="totals-table">`;
    content += `<tr><td>Subtotal:</td><td style="text-align:right">$${quote.totals.subtotal.toLocaleString()}</td></tr>`;
    if (quote.totals.discount > 0)
      content += `<tr><td>Discount:</td><td style="text-align:right;color:#059669">-$${quote.totals.discount.toLocaleString()}</td></tr>`;
    content += `<tr><td>GST (10%):</td><td style="text-align:right">$${quote.totals.gst.toLocaleString()}</td></tr>`;
    content += `<tr style="font-weight:700"><td>Total:</td><td style="text-align:right">$${quote.totals.total.toLocaleString()}</td></tr>`;
    content += `</table></div><div style="clear:both"></div>`;

    if (options.includeTerms) {
      content += `<div style="margin-top:16px"><div class="section-title">Terms & Conditions</div><div style="font-size:11px;color:#6b7280"><div><strong>Payment Terms:</strong> ${quote.settings.paymentTerms}</div><div><strong>Warranty:</strong> ${quote.settings.warranty}</div><div><strong>Delivery:</strong> ${quote.settings.deliveryTerms}</div><div style="margin-top:8px">${quote.settings.terms ? quote.settings.terms : ""}</div></div></div>`;
    }

    return content;
  }

  private generateSpecifications(specs: Record<string, any>): string {
    return Object.entries(specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" • ");
  }

  private generateFooter(quote: Quote): string {
    return `<div class="footer">Thank you for your business! This quote was generated by ChargeSource Smart Quoting Engine</div>`;
  }

  generateEmailShareLink(quote: Quote): string {
    const baseUrl = window.location.origin;
    const clientPortalUrl = `${baseUrl}/client/quote/${quote.id}?token=${this.generateAccessToken(quote)}`;
    const subject = encodeURIComponent(
      `Quote ${quote.quoteNumber} - ${quote.title || "EV Charging Project"}`,
    );
    const body = encodeURIComponent(
      `Dear ${quote.clientInfo.contactPerson},\n\nPlease find your quote at: ${clientPortalUrl}\n\nQuote Number: ${quote.quoteNumber}\nTotal: $${quote.totals.total.toLocaleString()}\n\nBest regards,\nChargeSource`,
    );
    return `mailto:${quote.clientInfo.email}?subject=${subject}&body=${body}`;
  }

  private generateAccessToken(quote: Quote): string {
    const tokenData = `${quote.id}-${quote.createdAt}`;
    return btoa(tokenData).replace(/[/+=]/g, "");
  }
}

export const pdfGenerator = new PDFGenerator();
export default pdfGenerator;
