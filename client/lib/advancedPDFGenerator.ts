import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Quote } from "./quoteTypes";

export interface AdvancedPDFOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTerms?: boolean;
  includeSpecifications?: boolean;
  watermark?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

class AdvancedPDFGenerator {
  private defaultOptions: AdvancedPDFOptions = {
    includeHeader: true,
    includeFooter: true,
    includeTerms: true,
    includeSpecifications: true,
    format: "a4",
    orientation: "portrait",
  };

  async generateQuotePDF(
    quote: Quote,
    options: AdvancedPDFOptions = {},
  ): Promise<void> {
    const finalOptions = { ...this.defaultOptions, ...options };

    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF({
        orientation: finalOptions.orientation!,
        unit: "mm",
        format: finalOptions.format!,
      });

      // Add metadata
      pdf.setProperties({
        title: `Quote ${quote.quoteNumber} - ${quote.clientInfo.company}`,
        subject: "EV Charging Infrastructure Quote",
        author: "ChargeSource",
        creator: "ChargeSource Smart Quoting Engine",
        keywords: "EV charging, quote, infrastructure",
      });

      // Generate PDF content
      await this.addContentToPDF(pdf, quote, finalOptions);

      // Save the PDF
      pdf.save(
        `quote-${quote.quoteNumber}-${quote.clientInfo.company?.replace(/[^a-zA-Z0-9]/g, "") || "client"}.pdf`,
      );
    } catch (error) {
      console.error("Advanced PDF generation failed:", error);
      throw new Error("Failed to generate PDF. Please try again.");
    }
  }

  private async addContentToPDF(
    pdf: jsPDF,
    quote: Quote,
    options: AdvancedPDFOptions,
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;

    // Add watermark if specified
    if (options.watermark) {
      this.addWatermark(pdf, options.watermark, pageWidth, pageHeight);
    }

    // Header
    if (options.includeHeader) {
      yPosition = this.addHeader(pdf, quote, leftMargin, yPosition, pageWidth);
    }

    // Client Information
    yPosition = this.addClientInfo(
      pdf,
      quote,
      leftMargin,
      yPosition,
      pageWidth,
    );

    // Project Information
    if (quote.title || quote.description) {
      yPosition = this.addProjectInfo(
        pdf,
        quote,
        leftMargin,
        yPosition,
        pageWidth,
      );
    }

    // Line Items
    if (quote.lineItems.length > 0) {
      yPosition = await this.addLineItems(
        pdf,
        quote,
        leftMargin,
        yPosition,
        pageWidth,
        options,
      );
    }

    // Totals
    yPosition = this.addTotals(pdf, quote, leftMargin, yPosition, pageWidth);

    // Terms & Conditions
    if (options.includeTerms) {
      yPosition = this.addTerms(pdf, quote, leftMargin, yPosition, pageWidth);
    }

    // Footer
    if (options.includeFooter) {
      this.addFooter(pdf, quote, leftMargin, pageHeight, pageWidth);
    }
  }

  private addWatermark(
    pdf: jsPDF,
    watermark: string,
    pageWidth: number,
    pageHeight: number,
  ): void {
    pdf.saveGraphicsState();
    pdf.setGState({ opacity: 0.1 });
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(72);

    // Center the watermark and rotate it
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    pdf.text(watermark, centerX, centerY, {
      angle: -45,
      align: "center",
      baseline: "middle",
    });

    pdf.restoreGraphicsState();
  }

  private addHeader(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
  ): number {
    // Company logo area (placeholder for now)
    pdf.setFillColor(59, 130, 246); // Blue color
    pdf.rect(leftMargin, yPosition, 50, 15, "F");

    // Company name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("ChargeSource", leftMargin + 25, yPosition + 10, {
      align: "center",
    });

    // Quote information on the right
    const rightX = pageWidth - 20;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.text("QUOTATION", rightX, yPosition + 5, { align: "right" });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Quote #${quote.quoteNumber}`, rightX, yPosition + 12, {
      align: "right",
    });
    pdf.text(
      `Date: ${new Date().toLocaleDateString()}`,
      rightX,
      yPosition + 18,
      { align: "right" },
    );
    pdf.text(
      `Valid until: ${new Date(quote.validUntil).toLocaleDateString()}`,
      rightX,
      yPosition + 24,
      { align: "right" },
    );

    // Company tagline
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(10);
    pdf.text("EV Infrastructure Solutions", leftMargin, yPosition + 20);

    // Contact information
    pdf.setFontSize(8);
    pdf.text(
      "Email: hello@chargesource.com.au | Phone: 1300 CHARGE | Web: www.chargesource.com.au",
      leftMargin,
      yPosition + 25,
    );

    // Divider line
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(leftMargin, yPosition + 35, pageWidth - 20, yPosition + 35);

    return yPosition + 45;
  }

  private addClientInfo(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
  ): number {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To:", leftMargin, yPosition);

    yPosition += 8;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const clientLines = [
      quote.clientInfo.company || quote.clientInfo.name,
      quote.clientInfo.contactPerson,
      quote.clientInfo.email,
      quote.clientInfo.phone,
      ...(quote.clientInfo.address ? quote.clientInfo.address.split("\n") : []),
      ...(quote.clientInfo.abn ? [`ABN: ${quote.clientInfo.abn}`] : []),
    ].filter(Boolean);

    clientLines.forEach((line) => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += 5;
    });

    return yPosition + 10;
  }

  private addProjectInfo(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
  ): number {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Details:", leftMargin, yPosition);

    yPosition += 8;
    pdf.setFontSize(11);

    if (quote.title) {
      pdf.setFont("helvetica", "bold");
      pdf.text(quote.title, leftMargin, yPosition);
      yPosition += 6;
    }

    if (quote.description) {
      pdf.setFont("helvetica", "normal");
      const maxWidth = pageWidth - 40;
      const descriptionLines = pdf.splitTextToSize(quote.description, maxWidth);
      pdf.text(descriptionLines, leftMargin, yPosition);
      yPosition += descriptionLines.length * 5;
    }

    return yPosition + 10;
  }

  private async addLineItems(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
    options: AdvancedPDFOptions,
  ): Promise<number> {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Quote Items:", leftMargin, yPosition);

    yPosition += 10;

    // Table headers
    const tableX = leftMargin;
    const tableWidth = pageWidth - 40;
    const colWidths = [
      tableWidth * 0.5,
      tableWidth * 0.15,
      tableWidth * 0.175,
      tableWidth * 0.175,
    ];
    const headers = ["Description", "Qty", "Unit Price", "Total"];

    // Header background
    pdf.setFillColor(249, 250, 251);
    pdf.rect(tableX, yPosition - 3, tableWidth, 8, "F");

    // Header text
    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");

    let currentX = tableX;
    headers.forEach((header, index) => {
      const align = index === 0 ? "left" : index === 1 ? "center" : "right";
      const textX =
        index === 0
          ? currentX + 2
          : index === 1
            ? currentX + colWidths[index] / 2
            : currentX + colWidths[index] - 2;

      pdf.text(header, textX, yPosition + 2, { align });
      currentX += colWidths[index];
    });

    yPosition += 8;

    // Table border
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    pdf.line(tableX, yPosition, tableX + tableWidth, yPosition);

    // Table rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");

    for (const item of quote.lineItems) {
      yPosition += 6;

      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      currentX = tableX;

      // Description column
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(item.name, currentX + 2, yPosition);

      if (item.description) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        const descLines = pdf.splitTextToSize(
          item.description,
          colWidths[0] - 4,
        );
        pdf.text(descLines, currentX + 2, yPosition + 4);
        yPosition += (descLines.length - 1) * 3;
      }

      if (item.isOptional) {
        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        pdf.text("(Optional)", currentX + 2, yPosition + 8);
        yPosition += 3;
      }

      // Other columns
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      currentX += colWidths[0];
      pdf.text(
        item.quantity.toString(),
        currentX + colWidths[1] / 2,
        yPosition,
        { align: "center" },
      );

      currentX += colWidths[1];
      pdf.text(
        `$${item.unitPrice.toLocaleString()}`,
        currentX + colWidths[2] - 2,
        yPosition,
        { align: "right" },
      );

      currentX += colWidths[2];
      pdf.text(
        `$${item.totalPrice.toLocaleString()}`,
        currentX + colWidths[3] - 2,
        yPosition,
        { align: "right" },
      );

      yPosition += 5;

      // Row separator
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.1);
      pdf.line(tableX, yPosition, tableX + tableWidth, yPosition);
    }

    return yPosition + 10;
  }

  private addTotals(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
  ): number {
    const totalsX = pageWidth - 80;
    const totalsWidth = 60;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    // Subtotal
    pdf.text("Subtotal:", totalsX, yPosition, { align: "left" });
    pdf.text(
      `$${quote.totals.subtotal.toLocaleString()}`,
      totalsX + totalsWidth,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;

    // Discount (if any)
    if (quote.totals.discount > 0) {
      pdf.setTextColor(5, 150, 105);
      pdf.text("Discount:", totalsX, yPosition, { align: "left" });
      pdf.text(
        `-$${quote.totals.discount.toLocaleString()}`,
        totalsX + totalsWidth,
        yPosition,
        { align: "right" },
      );
      yPosition += 6;
      pdf.setTextColor(0, 0, 0);
    }

    // GST
    pdf.text("GST (10%):", totalsX, yPosition, { align: "left" });
    pdf.text(
      `$${quote.totals.gst.toLocaleString()}`,
      totalsX + totalsWidth,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;

    // Total line
    pdf.setDrawColor(55, 65, 81);
    pdf.setLineWidth(0.5);
    pdf.line(totalsX, yPosition, totalsX + totalsWidth, yPosition);
    yPosition += 4;

    // Total
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Total:", totalsX, yPosition, { align: "left" });
    pdf.text(
      `$${quote.totals.total.toLocaleString()}`,
      totalsX + totalsWidth,
      yPosition,
      { align: "right" },
    );

    return yPosition + 15;
  }

  private addTerms(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    yPosition: number,
    pageWidth: number,
  ): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Terms & Conditions:", leftMargin, yPosition);

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const termsData = [
      { label: "Payment Terms", value: quote.settings.paymentTerms },
      { label: "Warranty", value: quote.settings.warranty },
      { label: "Delivery Terms", value: quote.settings.deliveryTerms },
      {
        label: "Quote Validity",
        value: `${quote.settings.validityDays} days from date of issue`,
      },
    ];

    termsData.forEach(({ label, value }) => {
      if (value) {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, leftMargin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, leftMargin + 35, yPosition);
        yPosition += 6;
      }
    });

    if (quote.settings.terms) {
      yPosition += 4;
      pdf.setFont("helvetica", "bold");
      pdf.text("General Terms:", leftMargin, yPosition);
      yPosition += 5;
      pdf.setFont("helvetica", "normal");
      const termsLines = pdf.splitTextToSize(
        quote.settings.terms,
        pageWidth - 40,
      );
      pdf.text(termsLines, leftMargin, yPosition);
      yPosition += termsLines.length * 4;
    }

    if (quote.settings.notes) {
      yPosition += 4;
      pdf.setFont("helvetica", "bold");
      pdf.text("Additional Notes:", leftMargin, yPosition);
      yPosition += 5;
      pdf.setFont("helvetica", "normal");
      const notesLines = pdf.splitTextToSize(
        quote.settings.notes,
        pageWidth - 40,
      );
      pdf.text(notesLines, leftMargin, yPosition);
      yPosition += notesLines.length * 4;
    }

    return yPosition + 10;
  }

  private addFooter(
    pdf: jsPDF,
    quote: Quote,
    leftMargin: number,
    pageHeight: number,
    pageWidth: number,
  ): void {
    const footerY = pageHeight - 15;

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(leftMargin, footerY - 5, pageWidth - 20, footerY - 5);

    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");

    pdf.text("Thank you for your business!", pageWidth / 2, footerY, {
      align: "center",
    });
    pdf.text(
      "This quote was generated by ChargeSource Smart Quoting Engine",
      pageWidth / 2,
      footerY + 4,
      { align: "center" },
    );
    pdf.text(
      "For questions about this quote, please contact us at hello@chargesource.com.au",
      pageWidth / 2,
      footerY + 8,
      { align: "center" },
    );
  }

  // Method to generate PDF from HTML element (alternative approach)
  async generateFromHTML(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("HTML to PDF conversion failed:", error);
      throw new Error("Failed to generate PDF from HTML. Please try again.");
    }
  }
}

export const advancedPDFGenerator = new AdvancedPDFGenerator();
export default advancedPDFGenerator;
